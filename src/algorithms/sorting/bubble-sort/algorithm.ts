import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortStep } from '../types';

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure bubbleSort(A)' },
  { id: 'outer', indent: 1, text: 'for i ← 0 to n − 2 do' },
  { id: 'reset', indent: 2, text: 'swapped ← false' },
  { id: 'inner', indent: 2, text: 'for j ← 0 to n − i − 2 do' },
  { id: 'cmp', indent: 3, text: 'if A[j] > A[j + 1] then' },
  { id: 'swap', indent: 4, text: 'swap(A[j], A[j + 1])' },
  { id: 'flag', indent: 4, text: 'swapped ← true' },
  { id: 'check', indent: 2, text: 'if not swapped then return' },
];

export function* run(values: readonly number[]): Generator<SortStep<null>> {
  const r = new SortRecorder(values, null);
  const n = r.length;
  yield r.step('start', 'fn', 'start', { params: { n } });
  for (let i = 0; i <= n - 2; i++) {
    let swapped = false;
    const end = n - i - 1;
    r.range = [0, end];
    yield r.step('pass', 'reset', 'pass', { vars: { i, swapped }, params: { pass: i + 1, end }, phase: 'pass' });
    for (let j = 0; j <= n - i - 2; j++) {
      const vars = { i, j, swapped };
      const ptr = [{ label: 'j', index: j }, { label: 'j+1', index: j + 1 }];
      const a = r.value(j);
      const b = r.value(j + 1);
      const greater = r.compare(j, j + 1) > 0;
      yield r.step('compare', 'cmp', greater ? 'compare-gt' : 'compare-le', {
        marks: { [j]: 'compare', [j + 1]: 'compare' }, pointers: ptr, vars, params: { a, b, j }, tone: r.tone(a),
      });
      if (greater) {
        r.swap(j, j + 1);
        swapped = true;
        yield r.step('swap', 'swap', 'swap', {
          marks: { [j]: 'swap', [j + 1]: 'swap' }, pointers: ptr, vars: { i, j, swapped }, params: { a, b }, tone: r.tone(b),
        });
      }
    }
    r.sorted.add(end);
    if (!swapped) {
      r.lockAll();
      yield r.step('early-exit', 'check', 'early-exit', { vars: { i, swapped }, range: null });
      break;
    }
    yield r.step('lock', 'inner', 'lock', { vars: { i, swapped }, params: { index: end, value: r.value(end) } });
  }
  r.lockAll();
  r.range = null;
  yield r.step('done', null, 'done');
}
