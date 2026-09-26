import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'bellman-ford',
  category: 'graph',
  scene: 'graph',
  input: { kind: 'graph', fixture: 'bellman-ford', alternatives: ['bellman-ford-negative-cycle'], needsTarget: true, weighted: true, directed: true, negativeWeights: true },
  run: (input) => run(input),
  pseudocode,
  complexity: { best: 'O(E)', average: 'O(V·E)', worst: 'O(V·E)', space: 'O(V)' },
  traits: { optimal: true, weighted: true, negativeWeights: true },
  counters: ['passes', 'relaxations', 'updates'],
  legend: ['default', 'visited', 'current', 'relaxed', 'tree', 'rejected', 'dead', 'cycle', 'path'],
  durations: { start: 1.5, pass: 1.4, skip: 0.35, reject: 0.6, converged: 2, cycle: 2.5, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
