import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'dijkstra',
  category: 'graph',
  scene: 'graph',
  layers: ['pq'],
  input: { kind: 'graph', fixture: 'dijkstra', needsTarget: true, weighted: true },
  run: (input) => run(input),
  pseudocode,
  complexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)', space: 'O(V + E)' },
  traits: { optimal: true, weighted: true },
  counters: ['visited', 'relaxations', 'pushes', 'staleSkips'],
  legend: ['default', 'frontier', 'current', 'visited', 'relaxed', 'tree', 'rejected', 'path'],
  durations: { start: 1.5, skip: 0.6, stale: 0.9, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
