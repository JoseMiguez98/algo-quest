import type { Pseudocode } from '../../../core/types';
import { findEdge, type GraphEdge } from '../model';
import { GraphRecorder, walkParents } from '../recorder';
import { INF, fmt, type GraphInput, type GraphStep } from '../types';

export interface BellmanFordExtra {
  dist: number[];
  parent: number[];
  pass: number;
  passes: number;
  /** Index into the directed edge list scanned each pass. */
  edge: number | null;
  changed: boolean;
  negativeCycle: number[] | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure bellmanFord(G, s)' },
  { id: 'init', indent: 1, text: 'dist[v] ← ∞ for every v;  dist[s] ← 0' },
  { id: 'pass', indent: 1, text: 'for pass ← 1 to |V| − 1 do' },
  { id: 'for', indent: 2, text: 'for each edge (u, v, w) do' },
  { id: 'check', indent: 3, text: 'if dist[u] ≠ ∞ and dist[u] + w < dist[v] then' },
  { id: 'relax', indent: 4, text: 'dist[v] ← dist[u] + w;  parent[v] ← u' },
  { id: 'early', indent: 2, text: 'if no distance changed then return dist' },
  { id: 'detect', indent: 1, text: 'for each edge (u, v, w) do' },
  { id: 'cycle', indent: 2, text: 'if dist[u] + w < dist[v] then report negative cycle' },
  { id: 'ret', indent: 1, text: 'return dist' },
];

/** Directed edge list scanned in order; an undirected edge contributes both directions. */
export function directedEdges(input: GraphInput): (GraphEdge & { id: number })[] {
  const out: (GraphEdge & { id: number })[] = [];
  input.graph.edges.forEach((e, id) => {
    out.push({ ...e, id });
    if (!input.graph.directed) out.push({ from: e.to, to: e.from, weight: e.weight, id });
  });
  return out;
}

export function* run(input: GraphInput): Generator<GraphStep<BellmanFordExtra>> {
  const { graph, start, target } = input;
  const n = graph.nodes.length;
  const edges = directedEdges(input);
  const r = new GraphRecorder<BellmanFordExtra>(graph, { dist: new Array(n).fill(INF), parent: new Array(n).fill(-1), pass: 0, passes: Math.max(0, n - 1), edge: null, changed: false, negativeCycle: null }, ['relaxations', 'updates', 'passes']);
  const x = r.extra;
  const treeEdge = new Array<number>(n).fill(-1);
  const badges = () => x.dist.forEach((d, v) => (r.badges[v] = fmt(d)));
  x.dist[start] = 0;
  r.nodes[start] = 'visited';
  badges();
  yield r.step('start', 'init', 'start', { params: { s: r.label(start), n, passes: x.passes } });
  let converged = false;
  for (let pass = 1; pass <= n - 1; pass++) {
    x.pass = pass;
    x.changed = false;
    r.count('passes');
    yield r.step('pass', 'pass', 'pass', { vars: { pass }, params: { pass, passes: x.passes }, phase: 'pass' });
    for (let k = 0; k < edges.length; k++) {
      const { from: u, to: v, weight: w, id } = edges[k]!;
      x.edge = k;
      r.count('relaxations');
      const vars = { pass, u: r.label(u), v: r.label(v), w, 'dist[u]': fmt(x.dist[u]!), 'dist[v]': fmt(x.dist[v]!) };
      if (x.dist[u] === INF) {
        yield r.step('skip', 'check', 'unreached', { edges: { [id]: 'rejected' }, vars, params: { u: r.label(u), v: r.label(v) } });
        continue;
      }
      const cand = x.dist[u]! + w;
      if (!(cand < x.dist[v]!)) {
        yield r.step('reject', 'check', 'no-improve', { edges: { [id]: 'active' }, vars: { ...vars, cand }, params: { u: r.label(u), v: r.label(v), cand, old: fmt(x.dist[v]!) }, tone: r.tone(v) });
        continue;
      }
      const old = x.dist[v]!;
      x.dist[v] = cand;
      x.parent[v] = u;
      x.changed = true;
      r.count('updates');
      if (treeEdge[v]! >= 0) r.edges[treeEdge[v]!] = null;
      treeEdge[v] = id;
      r.edges[id] = 'tree';
      r.nodes[v] = 'visited';
      badges();
      yield r.step('relax', 'relax', 'relax', { edges: { [id]: 'relaxed' }, nodes: { [v]: 'current' }, vars: { ...vars, 'dist[v]': cand }, params: { u: r.label(u), v: r.label(v), cand, old: fmt(old) }, tone: r.tone(v) });
    }
    x.edge = null;
    if (!x.changed) {
      converged = true;
      yield r.step('converged', 'early', 'converged', { vars: { pass }, params: { pass } });
      break;
    }
  }
  if (!converged) {
    yield r.step('detect', 'detect', 'detect', { phase: 'detect' });
    for (let k = 0; k < edges.length; k++) {
      const { from: u, to: v, weight: w, id } = edges[k]!;
      x.edge = k;
      if (x.dist[u] !== INF && x.dist[u]! + w < x.dist[v]!) {
        x.negativeCycle = extractCycle(x.parent, x.dist, edges, k, n);
        x.negativeCycle.forEach((c, i, cyc) => {
          r.nodes[c] = 'dead';
          const e = findEdge(graph, cyc[(i + cyc.length - 1) % cyc.length]!, c);
          if (e >= 0) r.edges[e] = 'cycle';
        });
        x.edge = null;
        yield r.step('cycle', 'cycle', 'cycle', { edges: { [id]: 'cycle' }, params: { u: r.label(u), v: r.label(v), cycle: x.negativeCycle.map((c) => r.label(c)).join('→') } });
        yield r.step('done', null, 'done-cycle', {});
        return;
      }
      yield r.step('verify', 'cycle', 'verify', { edges: { [id]: 'active' }, params: { u: r.label(u), v: r.label(v) } });
    }
    x.edge = null;
  }
  if (target !== null && x.dist[target] !== INF) {
    r.markPath(walkParents(x.parent, target), (_a, b) => treeEdge[b]!);
    yield r.step('found', 'ret', 'found', { params: { t: r.label(target), cost: x.dist[target]! } });
  }
  yield r.step('done', null, 'done', { params: { passes: r.counters.passes! } });
}

/**
 * Finishes the |V|-th relaxation pass from edge `from` on copies of dist/parent, then walks
 * parents |V| times from the last relaxed vertex, which is guaranteed to land on the cycle.
 */
export function extractCycle(parent: readonly number[], dist: readonly number[], edges: readonly GraphEdge[], from: number, n: number): number[] {
  const p = parent.slice();
  const d = dist.slice();
  let last = -1;
  for (let k = from; k < edges.length; k++) {
    const { from: u, to: v, weight: w } = edges[k]!;
    if (d[u] !== INF && d[u]! + w < d[v]!) {
      d[v] = d[u]! + w;
      p[v] = u;
      last = v;
    }
  }
  let v = last;
  for (let i = 0; i < n; i++) v = p[v]!;
  const cycle = [v];
  for (let u = p[v]!; u !== v; u = p[u]!) cycle.push(u);
  return cycle.reverse();
}
