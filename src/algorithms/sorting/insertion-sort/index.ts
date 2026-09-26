import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'insertion-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['lifted-key'],
  input: { kind: 'array', min: 1, max: 9, minN: 4, maxN: 20, preset: [4, 7, 3, 9, 8, 6, 1, 5, 2, 7] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  traits: { stable: true, inPlace: true, comparison: true },
  counters: ['comparisons', 'writes'],
  legend: ['default', 'key', 'compare', 'write', 'sorted'],
  durations: { start: 1.5, pick: 1.2, insert: 1.2, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
