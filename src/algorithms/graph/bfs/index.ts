import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'bfs',
  category: 'graph',
  scene: 'graph',
  layers: ['queue'],
  input: { kind: 'graph', fixture: 'bfs', needsTarget: false, weighted: false },
  run: (input) => run(input),
  pseudocode,
  complexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
  traits: { optimal: true, weighted: false },
  counters: ['visited', 'discovered', 'edgeChecks', 'maxFrontier'],
  legend: ['default', 'frontier', 'current', 'visited', 'tree', 'rejected', 'path'],
  durations: { start: 1.5, skip: 0.6, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
