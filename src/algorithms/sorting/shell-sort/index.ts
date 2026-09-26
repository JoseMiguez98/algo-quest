import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'shell-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['lifted-key'],
  input: { kind: 'array', min: 1, max: 30, minN: 4, maxN: 24, preset: [23, 5, 17, 29, 11, 2, 26, 8, 20, 14, 3, 29, 9, 18] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n log n)', average: '≈ O(n^1.25)', worst: 'O(n^1.5)', space: 'O(1)' },
  traits: { stable: false, inPlace: true, comparison: true },
  counters: ['comparisons', 'writes'],
  legend: ['default', 'key', 'compare', 'write', 'sorted'],
  durations: { start: 1.5, pass: 1.6, 'pass-done': 1.4, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
