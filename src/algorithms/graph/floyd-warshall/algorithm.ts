import type { Pseudocode } from '../../../core/types';
import { findEdge } from '../model';
import { GraphRecorder } from '../recorder';
import { INF, type GraphInput, type GraphStep } from '../types';

export interface FloydExtra {
  dist: number[][];
  next: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  /** Cell updated in this step. */
  updated: [number, number] | null;
  negativeCycle: boolean;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure floydWarshall(G)' },
  { id: 'init', indent: 1, text: 'dist[i][j] ← w(i, j) or ∞;  dist[i][i] ← 0;  next[i][j] ← j' },
  { id: 'k', indent: 1, text: 'for k ← 1 to |V| do' },
  { id: 'i', indent: 2, text: 'for i ← 1 to |V| do' },
  { id: 'j', indent: 3, text: 'for j ← 1 to |V| do' },
  { id: 'check', indent: 4, text: 'if dist[i][k] + dist[k][j] < dist[i][j] then' },
  { id: 'update', indent: 5, text: 'dist[i][j] ← dist[i][k] + dist[k][j];  next[i][j] ← next[i][k]' },
  { id: 'detect', indent: 1, text: 'if dist[i][i] < 0 for some i then report negative cycle' },
  { id: 'path', indent: 1, text: 'path(u, v): follow next[u][v] until v' },
];

export function reconstruct(next: readonly number[][], u: number, v: number): number[] | null {
  if (next[u]![v] === -1) return null;
  const path = [u];
  while (u !== v) {
    u = next[u]![v]!;
    path.push(u);
    if (path.length > next.length + 1) return null;
  }
  return path;
}

export function* run({ graph, start, target }: GraphInput): Generator<GraphStep<FloydExtra>> {
  const n = graph.nodes.length;
  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)));
  const next = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? i : -1)));
  for (const e of graph.edges) {
    const dirs = graph.directed ? [[e.from, e.to]] : [[e.from, e.to], [e.to, e.from]];
    for (const [a, b] of dirs as [number, number][]) {
      if (e.weight < dist[a]![b]!) {
        dist[a]![b] = e.weight;
        next[a]![b] = b;
      }
    }
  }
  const r = new GraphRecorder<FloydExtra>(graph, { dist, next, k: null, i: null, j: null, updated: null, negativeCycle: false }, ['checks', 'updates']);
  const x = r.extra;
  yield r.step('start', 'init', 'start', { params: { n }, phase: 'init' });
  for (let k = 0; k < n; k++) {
    x.k = k;
    yield r.step('pivot', 'k', 'pivot', { nodes: { [k]: 'current' }, vars: { k: r.label(k) }, params: { k: r.label(k) }, phase: 'k', tone: r.tone(k) });
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        x.i = i;
        x.j = j;
        x.updated = null;
        const vars = { k: r.label(k), i: r.label(i), j: r.label(j) };
        const nodes = { [i]: 'frontier', [j]: 'frontier-b', [k]: 'current' } as const;
        r.count('checks');
        const viaK = dist[i]![k]! === INF || dist[k]![j]! === INF ? INF : dist[i]![k]! + dist[k]![j]!;
        if (viaK < dist[i]![j]!) {
          const old = dist[i]![j]!;
          dist[i]![j] = viaK;
          next[i]![j] = next[i]![k]!;
          x.updated = [i, j];
          r.count('updates');
          yield r.step('relax', 'update', 'update', { nodes, vars: { ...vars, via: viaK }, params: { ...vars, via: viaK, old: old === INF ? '∞' : old }, tone: r.tone(j) });
        } else {
          yield r.step('compare', 'check', viaK === INF ? 'no-route' : 'no-improve', { nodes, vars: { ...vars, via: viaK === INF ? '∞' : viaK }, params: { ...vars, via: viaK === INF ? '∞' : viaK, cur: dist[i]![j]! === INF ? '∞' : dist[i]![j]! } });
        }
      }
    }
  }
  Object.assign(x, { k: null, i: null, j: null, updated: null });
  const negative = dist.findIndex((row, i) => row[i]! < 0);
  if (negative >= 0) {
    x.negativeCycle = true;
    dist.forEach((row, i) => { if (row[i]! < 0) r.nodes[i] = 'dead'; });
    yield r.step('cycle', 'detect', 'cycle', { params: { v: r.label(negative) }, phase: 'result' });
    yield r.step('done', null, 'done-cycle', {});
    return;
  }
  if (target !== null) {
    const path = reconstruct(next, start, target);
    if (path) {
      r.markPath(path, (a, b) => findEdge(graph, a, b));
      yield r.step('found', 'path', 'found', { params: { s: r.label(start), t: r.label(target), cost: dist[start]![target]! }, phase: 'result' });
    }
  }
  yield r.step('done', null, 'done', {});
}
