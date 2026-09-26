import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'dfs',
  category: 'graph',
  scene: 'graph',
  layers: ['stack'],
  input: { kind: 'graph', fixture: 'dfs', needsTarget: false, weighted: false },
  run: (input) => run(input),
  pseudocode,
  complexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
  traits: { optimal: false, weighted: false },
  counters: ['visited', 'edgeChecks', 'backtracks', 'maxDepth'],
  legend: ['default', 'current', 'frontier', 'visited', 'tree', 'rejected', 'path'],
  durations: { start: 1.5, skip: 0.6, backtrack: 1.1, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
