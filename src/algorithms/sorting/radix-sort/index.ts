import { defineAlgorithm } from '../../../core/algorithm';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<number[]>({
  id: 'radix-sort',
  category: 'sorting',
  scene: 'bars',
  layers: ['counts', 'digits'],
  input: { kind: 'array', min: 100, max: 999, minN: 4, maxN: 14, preset: [329, 457, 657, 839, 436, 720, 355, 102, 598, 241] },
  options: [{ id: 'base', values: [10, 16, 4], default: 10 }],
  run: (values, o) => run(values, { base: Number(o.base) }),
  pseudocode,
  complexity: { best: 'O(d·(n + b))', average: 'O(d·(n + b))', worst: 'O(d·(n + b))', space: 'O(n + b)' },
  traits: { stable: true, inPlace: false, comparison: false },
  counters: ['reads', 'writes'],
  legend: ['default', 'active', 'compare', 'write', 'sorted'],
  durations: { start: 1.5, pass: 1.6, 'copy-back': 2, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
