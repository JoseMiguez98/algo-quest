import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'bubble-sort',
  category: 'sorting',
  scene: 'bars',
  input: { kind: 'array', min: 1, max: 10, minN: 4, maxN: 24, preset: [7, 3, 9, 2, 10, 1, 6, 3, 8, 4, 9, 5] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  traits: { stable: true, inPlace: true, comparison: true },
  counters: ['comparisons', 'swaps'],
  legend: ['default', 'compare', 'swap', 'sorted'],
  durations: { start: 1.5, pass: 1.2, lock: 1.2, 'early-exit': 2, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
