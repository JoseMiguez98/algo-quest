import { adjacency, euclidean, manhattan, type Graph } from './model';
import { MinHeap } from './heap';
import { GraphRecorder, walkParents } from './recorder';
import { INF, fmt, type GraphInput, type GraphStep } from './types';

export type Heuristic = 'manhattan' | 'euclidean' | 'zero';

export interface PqEntryView {
  node: number;
  g: number;
  h: number;
  priority: number;
  stale: boolean;
}

export interface BestFirstExtra {
  g: number[];
  h: number[];
  parent: number[];
  closed: boolean[];
  open: PqEntryView[];
  current: number | null;
}

export type Mode = 'dijkstra' | 'a-star' | 'greedy';

/**
 * Straight-line (or Manhattan) distance to the target, scaled by s = min(1, min w(u,v) / d(u,v)).
 * Then h(u) = s·d(u,t) ≤ s·d(u,v) + s·d(v,t) ≤ w(u,v) + h(v): consistent on any positive-weight graph,
 * even when node coordinates are not in weight units. A weight > 1 deliberately breaks that (weighted A*).
 */
export function heuristicFn(kind: Heuristic, graph: Graph, target: number | null, weight = 1): (u: number) => number {
  if (kind === 'zero' || target === null) return () => 0;
  const base = kind === 'manhattan' ? manhattan : euclidean;
  const s = heuristicScale(graph, base);
  return (u) => round(weight * s * base(graph, u, target));
}

export function heuristicScale(graph: Graph, base: (g: Graph, a: number, b: number) => number): number {
  let s = 1;
  for (const e of graph.edges) {
    if (e.weight <= 0) return 0;
    const d = base(graph, e.from, e.to);
    if (d > 0) s = Math.min(s, e.weight / d);
  }
  return s;
}

/** Floors to 2 decimals so rounding can never push h above the consistent bound. */
const round = (x: number) => Math.floor(x * 100 + 1e-9) / 100;

/**
 * Shared skeleton for Dijkstra (priority g), A* (g + h) and greedy best-first (h).
 * Nodes are closed when extracted; stale queue entries are shown and skipped (lazy deletion).
 */
export function* bestFirst(mode: Mode, { graph, start, target }: GraphInput, h: (u: number) => number): Generator<GraphStep<BestFirstExtra>> {
  const n = graph.nodes.length;
  const adj = adjacency(graph);
  const r = new GraphRecorder<BestFirstExtra>(graph, { g: new Array(n).fill(INF), h: graph.nodes.map((_, u) => (mode === 'dijkstra' ? 0 : h(u))), parent: new Array(n).fill(-1), closed: new Array(n).fill(false), open: [], current: null }, ['visited', 'pushes', 'relaxations', 'staleSkips', 'maxFrontier']);
  const x = r.extra;
  const pq = new MinHeap();
  const treeEdge = new Array<number>(n).fill(-1);
  const priority = (u: number) => (mode === 'dijkstra' ? x.g[u]! : mode === 'a-star' ? round(x.g[u]! + x.h[u]!) : x.h[u]!);
  const key = (u: number) => (mode === 'a-star' ? [priority(u), x.h[u]!] : [priority(u)]);
  const syncOpen = () => {
    x.open = pq.sorted().map((e) => ({ node: e.node, g: x.g[e.node]!, h: x.h[e.node]!, priority: e.key[0]!, stale: x.closed[e.node]! || e.key[0] !== priority(e.node) }));
  };
  const badge = (u: number) => {
    r.badges[u] = mode === 'dijkstra' ? fmt(x.g[u]!) : mode === 'a-star' ? `${fmt(x.g[u]!)}+${x.h[u]}` : `h${x.h[u]}`;
  };
  x.g[start] = 0;
  pq.push(start, key(start));
  r.count('pushes');
  r.nodes[start] = 'frontier';
  badge(start);
  syncOpen();
  r.peak('maxFrontier', 1);
  yield r.step('start', 'init', 'start', { vars: { s: r.label(start) }, params: { s: r.label(start), h: x.h[start]! }, tone: r.tone(start) });

  while (pq.size) {
    const e = pq.pop()!;
    const u = e.node;
    syncOpen();
    if (x.closed[u]) {
      r.count('staleSkips');
      yield r.step('stale', 'stale', 'stale', { nodes: { [u]: 'focus' }, vars: { u: r.label(u), key: e.key[0]! }, params: { u: r.label(u), key: e.key[0]! } });
      continue;
    }
    x.closed[u] = true;
    x.current = u;
    r.count('visited');
    r.nodes[u] = 'current';
    yield r.step('visit', 'extract', 'extract', { vars: { u: r.label(u), g: x.g[u]!, h: x.h[u]!, f: priority(u) }, params: { u: r.label(u), key: priority(u), g: x.g[u]!, h: x.h[u]! }, tone: r.tone(u) });
    if (u === target) {
      r.markPath(walkParents(x.parent, u), (_a, b) => treeEdge[b]!);
      x.current = null;
      yield r.step('found', 'goal', 'found', { params: { t: r.label(u), cost: x.g[u]! } });
      yield r.step('done', null, 'done-found', { params: { cost: x.g[u]!, len: r.path!.length - 1 } });
      return;
    }
    for (const { to: v, weight: w, edge } of adj[u]!) {
      r.count('relaxations');
      const vars = { u: r.label(u), v: r.label(v), w, 'g[u]': x.g[u]!, 'g[v]': fmt(x.g[v]!) };
      if (x.closed[v]) {
        yield r.step('skip', 'closed', 'closed', { edges: { [edge]: 'rejected' }, vars, params: { v: r.label(v) } });
        continue;
      }
      if (mode === 'greedy') {
        if (x.g[v] !== INF) {
          yield r.step('skip', 'relax-check', 'seen', { edges: { [edge]: 'rejected' }, vars, params: { v: r.label(v) } });
          continue;
        }
      } else {
        const cand = x.g[u]! + w;
        if (!(cand < x.g[v]!)) {
          yield r.step('reject', 'relax-check', 'no-improve', { edges: { [edge]: 'rejected' }, vars: { ...vars, cand }, params: { v: r.label(v), cand, old: fmt(x.g[v]!) } });
          continue;
        }
      }
      const improvedFrom = x.g[v]!;
      x.g[v] = x.g[u]! + w;
      x.parent[v] = u;
      pq.push(v, key(v));
      r.count('pushes');
      if (treeEdge[v]! >= 0) r.edges[treeEdge[v]!] = null;
      treeEdge[v] = edge;
      r.edges[edge] = 'tree';
      r.nodes[v] = 'frontier';
      badge(v);
      syncOpen();
      r.peak('maxFrontier', x.open.filter((o) => !o.stale).length);
      yield r.step('relax', 'relax', improvedFrom === INF ? 'discover' : 'improve', { edges: { [edge]: 'relaxed' }, vars: { ...vars, 'g[v]': x.g[v]! }, params: { v: r.label(v), u: r.label(u), g: x.g[v]!, old: fmt(improvedFrom), key: priority(v) }, tone: r.tone(v) });
    }
    r.nodes[u] = 'visited';
    x.current = null;
  }
  yield r.step('done', null, target === null ? 'done-all' : 'done-unreachable', { params: { count: r.counters.visited! } });
}
