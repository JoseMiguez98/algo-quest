import { defineAlgorithm } from '../../../core/algorithm';
import type { GraphInput } from '../types';
import { pseudocode, run } from './algorithm';

export default defineAlgorithm<GraphInput>({
  id: 'bidirectional-bfs',
  category: 'graph',
  scene: 'graph',
  layers: ['queue-f', 'queue-b'],
  input: { kind: 'graph', fixture: 'bidirectional-bfs', needsTarget: true, weighted: false },
  options: [{ id: 'alternation', values: ['alternate', 'smaller'], default: 'alternate' }],
  run: (input, o) => run(input, { alternation: o.alternation as never }),
  pseudocode,
  complexity: { best: 'O(b^(d/2))', average: 'O(b^(d/2))', worst: 'O(V + E)', space: 'O(b^(d/2))' },
  traits: { optimal: true, weighted: false },
  counters: ['visited', 'discovered', 'edgeChecks', 'layers'],
  legend: ['default', 'frontier', 'visited', 'frontier-b', 'visited-b', 'current', 'meet', 'path'],
  durations: { start: 1.5, layer: 1.3, skip: 0.6, meet: 1.4, done: 3 },
  content: { es: () => import('./content.es'), en: () => import('./content.en') },
});
