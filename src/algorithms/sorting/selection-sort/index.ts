import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'selection-sort',
  category: 'sorting',
  scene: 'bars',
  input: { kind: 'array', min: 1, max: 9, minN: 4, maxN: 20, preset: [5, 3, 5, 1, 8, 2, 9, 4, 7] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  traits: { stable: false, inPlace: true, comparison: true },
  counters: ['comparisons', 'swaps'],
  legend: ['default', 'compare', 'min', 'swap', 'sorted'],
  durations: { start: 1.5, pass: 1.2, lock: 1.2, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
