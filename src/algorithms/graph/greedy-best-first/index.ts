import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'greedy-best-first',
  category: 'graph',
  scene: 'graph',
  layers: ['pq'],
  input: { kind: 'graph', fixture: 'greedy-best-first', needsTarget: true, weighted: true },
  options: [{ id: 'heuristic', values: ['manhattan', 'euclidean'], default: 'manhattan' }],
  run: (input, o) => run(input, { heuristic: o.heuristic as never }),
  pseudocode,
  complexity: { best: 'O(d)', average: 'O(E log V)', worst: 'O((V + E) log V)', space: 'O(V)' },
  traits: { optimal: false, weighted: true },
  counters: ['visited', 'relaxations', 'pushes', 'maxFrontier'],
  legend: ['default', 'frontier', 'current', 'visited', 'tree', 'rejected', 'path'],
  durations: { start: 1.5, skip: 0.6, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
