import type { Pseudocode } from '../../../core/types';
import { bestFirst, heuristicFn, type BestFirstExtra, type Heuristic } from '../best-first';
import type { GraphInput, GraphStep } from '../types';

export interface GreedyOptions {
  heuristic: Heuristic;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure greedyBestFirst(G, s, t, h)' },
  { id: 'init', indent: 1, text: 'OPEN ← {(h(s), s)};  mark s discovered' },
  { id: 'loop', indent: 1, text: 'while OPEN is not empty do' },
  { id: 'extract', indent: 2, text: 'u ← node in OPEN with least h' },
  { id: 'stale', indent: 2, text: 'if u is closed then continue' },
  { id: 'final', indent: 2, text: 'close u' },
  { id: 'goal', indent: 2, text: 'if u = t then return path(u)' },
  { id: 'for', indent: 2, text: 'for each v in adj[u] do' },
  { id: 'closed', indent: 3, text: 'if v is closed then continue' },
  { id: 'relax-check', indent: 3, text: 'if v is not discovered then' },
  { id: 'relax', indent: 4, text: 'mark v discovered;  parent[v] ← u;  insert(OPEN, (h(v), v))' },
];

export function run(input: GraphInput, options: Partial<GreedyOptions> = {}): Generator<GraphStep<BestFirstExtra>> {
  const heuristic = options.heuristic ?? (input.graph.grid ? 'manhattan' : 'euclidean');
  return bestFirst('greedy', input, heuristicFn(heuristic, input.graph, input.target));
}
