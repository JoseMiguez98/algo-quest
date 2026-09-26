import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'heap-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['heap-tree'],
  input: { kind: 'array', min: 5, max: 49, minN: 4, maxN: 15, preset: [27, 8, 35, 14, 42, 19, 5, 27, 11, 23] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
  traits: { stable: false, inPlace: true, comparison: true },
  counters: ['comparisons', 'swaps'],
  legend: ['default', 'active', 'compare', 'max', 'swap', 'sorted'],
  durations: { start: 1.5, 'heap-built': 2, swap: 1.1, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
