import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'floyd-warshall',
  category: 'graph',
  scene: 'graph',
  layers: ['matrix'],
  input: { kind: 'graph', fixture: 'floyd-warshall', alternatives: ['floyd-warshall-negative-cycle'], needsTarget: true, weighted: true, directed: true, negativeWeights: true, maxNodes: 12 },
  run: (input) => run(input),
  pseudocode,
  complexity: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)', space: 'O(V²)' },
  traits: { optimal: true, weighted: true, negativeWeights: true },
  counters: ['checks', 'updates'],
  legend: ['current', 'frontier', 'frontier-b', 'compare', 'write', 'dead', 'path'],
  durations: { start: 1.5, pivot: 1.6, compare: 0.35, relax: 1, cycle: 2.5, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
