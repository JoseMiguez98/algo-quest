import type { Pseudocode } from '../../../core/types';
import { bestFirst, heuristicFn, type BestFirstExtra, type Heuristic } from '../best-first';
import type { GraphInput, GraphStep } from '../types';

export interface AStarOptions {
  heuristic: Heuristic;
  /** Values above 1 make h inadmissible (weighted A*): faster, not guaranteed optimal. */
  weight: number;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure aStar(G, s, t, h)' },
  { id: 'init', indent: 1, text: 'g[v] ← ∞ for every v;  g[s] ← 0;  OPEN ← {(h(s), s)}' },
  { id: 'loop', indent: 1, text: 'while OPEN is not empty do' },
  { id: 'extract', indent: 2, text: 'u ← node in OPEN with least f = g + h' },
  { id: 'stale', indent: 2, text: 'if u is closed then continue      ▹ outdated entry' },
  { id: 'final', indent: 2, text: 'close u' },
  { id: 'goal', indent: 2, text: 'if u = t then return path(u)' },
  { id: 'for', indent: 2, text: 'for each (v, w) in adj[u] do' },
  { id: 'closed', indent: 3, text: 'if v is closed then continue' },
  { id: 'relax-check', indent: 3, text: 'if g[u] + w < g[v] then' },
  { id: 'relax', indent: 4, text: 'g[v] ← g[u] + w;  parent[v] ← u;  insert(OPEN, (g[v] + h(v), v))' },
];

export function run(input: GraphInput, options: Partial<AStarOptions> = {}): Generator<GraphStep<BestFirstExtra>> {
  const heuristic = options.heuristic ?? (input.graph.grid ? 'manhattan' : 'euclidean');
  return bestFirst('a-star', input, heuristicFn(heuristic, input.graph, input.target, options.weight ?? 1));
}
