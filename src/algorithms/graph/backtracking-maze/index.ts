import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'backtracking-maze',
  category: 'graph',
  scene: 'graph',
  input: { kind: 'graph', fixture: 'backtracking-maze', needsTarget: true, weighted: false, gridOnly: true },
  options: [{ id: 'visited', values: ['memo', 'pure'], default: 'memo' }],
  run: (input, o) => run(input, { visited: o.visited as never }),
  pseudocode,
  complexity: { best: 'O(V)', average: 'O(V)', worst: 'O(V) (memo) · O(4^V) (puro)', space: 'O(V)' },
  traits: { optimal: false, weighted: false },
  counters: ['visited', 'backtracks', 'rejects', 'maxDepth'],
  legend: ['frontier', 'current', 'dead', 'focus', 'path'],
  durations: { start: 1.5, skip: 0.5, try: 0.6, backtrack: 1, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
