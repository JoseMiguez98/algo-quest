import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'quick-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['partition', 'ranges'],
  input: { kind: 'array', min: 5, max: 49, minN: 4, maxN: 20, preset: [25, 42, 13, 31, 8, 39, 17, 5, 28, 25] },
  options: [{ id: 'pivot', values: ['last', 'first', 'median3', 'random'], default: 'last' }],
  run: (values, o) => run(values, { pivot: o.pivot as never, seed: 7 }),
  pseudocode,
  complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  traits: { stable: false, inPlace: true, comparison: true },
  counters: ['comparisons', 'swaps'],
  legend: ['default', 'pivot', 'compare', 'swap', 'active', 'sorted'],
  durations: { start: 1.5, pivot: 1.3, place: 1.4, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
