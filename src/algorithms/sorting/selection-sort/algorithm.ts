import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortStep } from '../types';

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure selectionSort(A)' },
  { id: 'outer', indent: 1, text: 'for i ← 0 to n − 2 do' },
  { id: 'init', indent: 2, text: 'min ← i' },
  { id: 'inner', indent: 2, text: 'for j ← i + 1 to n − 1 do' },
  { id: 'cmp', indent: 3, text: 'if A[j] < A[min] then' },
  { id: 'update', indent: 4, text: 'min ← j' },
  { id: 'check', indent: 2, text: 'if min ≠ i then' },
  { id: 'swap', indent: 3, text: 'swap(A[i], A[min])' },
];

export function* run(values: readonly number[]): Generator<SortStep<null>> {
  const r = new SortRecorder(values, null);
  const n = r.length;
  yield r.step('start', 'fn', 'start', { params: { n } });
  for (let i = 0; i <= n - 2; i++) {
    let min = i;
    r.range = [i, n - 1];
    yield r.step('pass', 'init', 'pass', {
      marks: { [i]: 'min' }, pointers: [{ label: 'i', index: i }, { label: 'min', index: min }],
      vars: { i, min }, params: { pass: i + 1, i }, phase: 'pass',
    });
    for (let j = i + 1; j <= n - 1; j++) {
      const less = r.compare(j, min) < 0;
      const ptr = [{ label: 'i', index: i }, { label: 'j', index: j }, { label: 'min', index: min }];
      yield r.step('compare', 'cmp', less ? 'compare-lt' : 'compare-ge', {
        marks: { [min]: 'min', [j]: 'compare' }, pointers: ptr, vars: { i, j, min },
        params: { a: r.value(j), b: r.value(min) }, tone: r.tone(r.value(j)),
      });
      if (less) {
        min = j;
        yield r.step('select', 'update', 'new-min', {
          marks: { [min]: 'min' }, pointers: [{ label: 'i', index: i }, { label: 'min', index: min }],
          vars: { i, j, min }, params: { value: r.value(min), index: min }, tone: r.tone(r.value(min)),
        });
      }
    }
    if (min !== i) {
      const a = r.value(i);
      const b = r.value(min);
      r.swap(i, min);
      yield r.step('swap', 'swap', 'swap', {
        marks: { [i]: 'swap', [min]: 'swap' }, pointers: [{ label: 'i', index: i }, { label: 'min', index: min }],
        vars: { i, min }, params: { a, b }, tone: r.tone(b),
      });
    } else {
      yield r.step('no-swap', 'check', 'no-swap', { marks: { [i]: 'min' }, vars: { i, min }, params: { value: r.value(i) } });
    }
    r.sorted.add(i);
    yield r.step('lock', 'outer', 'lock', { vars: { i }, params: { index: i, value: r.value(i) } });
  }
  r.lockAll();
  r.range = null;
  yield r.step('done', null, 'done');
}
