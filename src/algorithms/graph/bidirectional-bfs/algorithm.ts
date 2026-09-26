import type { Pseudocode } from '../../../core/types';
import { adjacency, findEdge } from '../model';
import { GraphRecorder, walkParents } from '../recorder';
import { INF, type GraphInput, type GraphStep } from '../types';

export type Alternation = 'alternate' | 'smaller';

export interface BiBfsOptions {
  /** Strict alternation (default) or always expand the smaller frontier. */
  alternation: Alternation;
}

interface Side {
  queue: number[];
  dist: number[];
  parent: number[];
}

export interface BiBfsExtra {
  forward: Side;
  backward: Side;
  side: 'forward' | 'backward' | null;
  best: { length: number; u: number; v: number } | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure bidirectionalBFS(G, s, t)' },
  { id: 'init', indent: 1, text: 'Qf ← [s];  Qb ← [t];  df[s] ← 0;  db[t] ← 0' },
  { id: 'loop', indent: 1, text: 'while Qf and Qb are not empty do' },
  { id: 'pick', indent: 2, text: 'pick a side X (the other is Y) and expand one whole layer of QX' },
  { id: 'for', indent: 3, text: 'for each u in the layer, for each v in adjX[u] do' },
  { id: 'meet', indent: 4, text: 'if dY[v] ≠ ∞ then best ← min(best, dX[u] + 1 + dY[v])' },
  { id: 'discover', indent: 4, text: 'else if dX[v] = ∞ then dX[v] ← dX[u] + 1;  enqueue(QX, v)' },
  { id: 'stop', indent: 2, text: 'if best < ∞ then return path through the best meeting edge' },
  { id: 'fail', indent: 1, text: 'return no path' },
];

export function* run({ graph, start, target }: GraphInput, options: Partial<BiBfsOptions> = {}): Generator<GraphStep<BiBfsExtra>> {
  if (target === null) throw new RangeError('bidirectional BFS needs a target');
  const alternation = options.alternation ?? 'alternate';
  const n = graph.nodes.length;
  const adjF = adjacency(graph);
  const adjB = adjacency(graph, true);
  const side = (s: number): Side => {
    const dist = new Array(n).fill(INF);
    dist[s] = 0;
    return { queue: [s], dist, parent: new Array(n).fill(-1) };
  };
  const r = new GraphRecorder<BiBfsExtra>(graph, { forward: side(start), backward: side(target), side: null, best: null }, ['visited', 'discovered', 'edgeChecks', 'maxFrontier', 'layers']);
  const { forward: F, backward: B } = r.extra;
  r.nodes[start] = 'frontier';
  r.nodes[target] = 'frontier-b';
  r.badges[start] = '0';
  r.badges[target] = '0';
  r.count('discovered', start === target ? 1 : 2);
  yield r.step('start', 'init', 'start', { params: { s: r.label(start), t: r.label(target) } });
  if (start === target) {
    r.markPath([start], () => -1);
    yield r.step('done', null, 'done-same', {});
    return;
  }
  let turn: 'forward' | 'backward' = 'forward';
  while (F.queue.length && B.queue.length) {
    if (alternation === 'smaller') turn = F.queue.length <= B.queue.length ? 'forward' : 'backward';
    const X = turn === 'forward' ? F : B;
    const Y = turn === 'forward' ? B : F;
    const adj = turn === 'forward' ? adjF : adjB;
    const frontierMark = turn === 'forward' ? 'frontier' : 'frontier-b';
    const visitedMark = turn === 'forward' ? 'visited' : 'visited-b';
    r.extra.side = turn;
    r.count('layers');
    const layer = X.queue.splice(0);
    yield r.step('layer', 'pick', turn === 'forward' ? 'layer-forward' : 'layer-backward', { vars: { side: turn, depth: X.dist[layer[0]!]! }, params: { size: layer.length, depth: X.dist[layer[0]!]! }, phase: 'layer' });
    for (const u of layer) {
      r.count('visited');
      r.nodes[u] = 'current';
      yield r.step('visit', 'for', 'expand', { vars: { side: turn, u: r.label(u) }, params: { u: r.label(u) }, tone: r.tone(u) });
      for (const { to: v, edge } of adj[u]!) {
        r.count('edgeChecks');
        if (Y.dist[v] !== INF) {
          const length = X.dist[u]! + 1 + Y.dist[v]!;
          const improved = !r.extra.best || length < r.extra.best.length;
          if (improved) r.extra.best = { length, u, v };
          yield r.step('meet', 'meet', improved ? 'meet' : 'meet-worse', { edges: { [edge]: 'active' }, nodes: { [v]: 'meet' }, vars: { u: r.label(u), v: r.label(v), best: r.extra.best!.length }, params: { u: r.label(u), v: r.label(v), length }, tone: r.tone(v) });
          continue;
        }
        if (X.dist[v] !== INF) {
          yield r.step('skip', 'discover', 'seen', { edges: { [edge]: 'rejected' }, vars: { u: r.label(u), v: r.label(v) }, params: { v: r.label(v) } });
          continue;
        }
        X.dist[v] = X.dist[u]! + 1;
        X.parent[v] = u;
        X.queue.push(v);
        r.nodes[v] = frontierMark;
        r.edges[edge] = turn === 'forward' ? 'tree' : 'tree-b';
        r.badges[v] = String(X.dist[v]);
        r.count('discovered');
        r.peak('maxFrontier', F.queue.length + B.queue.length);
        yield r.step('discover', 'discover', 'discover', { edges: { [edge]: 'active' }, vars: { u: r.label(u), v: r.label(v), d: X.dist[v]! }, params: { u: r.label(u), v: r.label(v), d: X.dist[v]! }, tone: r.tone(v) });
      }
      r.nodes[u] = visitedMark;
    }
    if (r.extra.best) {
      const { u, v } = r.extra.best;
      const [fu, bv] = turn === 'forward' ? [u, v] : [v, u];
      const path = [...walkParents(F.parent, fu), ...walkParents(B.parent, bv).reverse()];
      r.markPath(path, (a, b) => findEdge(graph, a, b));
      yield r.step('found', 'stop', 'found', { vars: { best: r.extra.best.length }, params: { len: r.extra.best.length } });
      yield r.step('done', null, 'done-found', { params: { len: r.extra.best.length } });
      return;
    }
    if (alternation === 'alternate') turn = turn === 'forward' ? 'backward' : 'forward';
  }
  r.extra.side = null;
  yield r.step('fail', 'fail', 'fail', {});
  yield r.step('done', null, 'done-unreachable', {});
}
