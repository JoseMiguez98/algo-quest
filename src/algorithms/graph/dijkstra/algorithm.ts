import type { Pseudocode } from '../../../core/types';
import { bestFirst, type BestFirstExtra } from '../best-first';
import type { GraphInput, GraphStep } from '../types';

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure dijkstra(G, s)' },
  { id: 'init', indent: 1, text: 'dist[v] ← ∞ for every v;  dist[s] ← 0;  PQ ← {(0, s)}' },
  { id: 'loop', indent: 1, text: 'while PQ is not empty do' },
  { id: 'extract', indent: 2, text: '(d, u) ← extractMin(PQ)' },
  { id: 'stale', indent: 2, text: 'if u is final then continue      ▹ outdated entry' },
  { id: 'final', indent: 2, text: 'mark u final' },
  { id: 'goal', indent: 2, text: 'if u = target then return path(u)' },
  { id: 'for', indent: 2, text: 'for each (v, w) in adj[u] do' },
  { id: 'closed', indent: 3, text: 'if v is final then continue' },
  { id: 'relax-check', indent: 3, text: 'if dist[u] + w < dist[v] then' },
  { id: 'relax', indent: 4, text: 'dist[v] ← dist[u] + w;  parent[v] ← u;  insert(PQ, (dist[v], v))' },
];

export function run(input: GraphInput): Generator<GraphStep<BestFirstExtra>> {
  return bestFirst('dijkstra', input, () => 0);
}
