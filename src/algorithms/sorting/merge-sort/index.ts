import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'merge-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['aux-row', 'ranges'],
  input: { kind: 'array', min: 5, max: 49, minN: 4, maxN: 16, preset: [38, 12, 27, 43, 9, 31, 18, 27] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  traits: { stable: true, inPlace: false, comparison: true },
  counters: ['comparisons', 'writes'],
  legend: ['default', 'compare', 'write', 'inactive', 'sorted'],
  durations: { start: 1.5, split: 1.1, 'merge-start': 1.2, 'copy-back': 1.4, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
