import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'bucket-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['buckets'],
  input: { kind: 'array', min: 1, max: 99, minN: 4, maxN: 16, preset: [42, 7, 91, 33, 68, 15, 84, 26, 53, 3, 76, 47] },
  options: [{ id: 'buckets', values: [5, 3, 8], default: 5 }],
  run: (values, o) => run(values, { buckets: Number(o.buckets) }),
  pseudocode,
  complexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n²)', space: 'O(n + k)' },
  traits: { stable: true, inPlace: false, comparison: true },
  counters: ['comparisons', 'writes'],
  legend: ['default', 'write', 'key', 'compare', 'sorted'],
  durations: { start: 1.5, range: 1.5, bucket: 1.3, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
