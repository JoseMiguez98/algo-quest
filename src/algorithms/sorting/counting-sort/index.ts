import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'counting-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['counts'],
  input: { kind: 'array', min: 1, max: 9, minN: 4, maxN: 16, preset: [4, 2, 7, 3, 2, 6, 4, 1, 5, 3, 2, 6] },
  run: (values) => run(values),
  pseudocode,
  complexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)', space: 'O(n + k)' },
  traits: { stable: true, inPlace: false, comparison: false },
  counters: ['reads', 'writes'],
  legend: ['default', 'active', 'compare', 'write', 'sorted'],
  durations: { start: 1.5, range: 1.5, init: 1.2, 'copy-back': 2, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
