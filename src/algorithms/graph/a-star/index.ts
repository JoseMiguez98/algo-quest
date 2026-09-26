import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'a-star',
  category: 'graph',
  scene: 'graph',
  layers: ['pq'],
  input: { kind: 'graph', fixture: 'a-star', needsTarget: true, weighted: true },
  options: [
    { id: 'heuristic', values: ['manhattan', 'euclidean', 'zero'], default: 'manhattan' },
    { id: 'weight', values: [1, 1.5, 3], default: 1 },
  ],
  run: (input, o) => run(input, { heuristic: o.heuristic as never, weight: Number(o.weight) }),
  pseudocode,
  complexity: { best: 'O(E)', average: 'O(E log V)', worst: 'O((V + E) log V)', space: 'O(V)' },
  traits: { optimal: true, weighted: true },
  counters: ['visited', 'relaxations', 'pushes', 'staleSkips'],
  legend: ['default', 'frontier', 'current', 'visited', 'relaxed', 'tree', 'rejected', 'path'],
  durations: { start: 1.5, skip: 0.6, stale: 0.9, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
