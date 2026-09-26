import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortItem, SortStep } from '../types';

export interface InsertionExtra {
  /** The lifted key while it is out of the array. */
  key: SortItem | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure insertionSort(A)' },
  { id: 'outer', indent: 1, text: 'for i ← 1 to n − 1 do' },
  { id: 'key', indent: 2, text: 'key ← A[i]' },
  { id: 'init', indent: 2, text: 'j ← i − 1' },
  { id: 'while', indent: 2, text: 'while j ≥ 0 and A[j] > key do' },
  { id: 'shift', indent: 3, text: 'A[j + 1] ← A[j]' },
  { id: 'dec', indent: 3, text: 'j ← j − 1' },
  { id: 'place', indent: 2, text: 'A[j + 1] ← key' },
];

export function* run(values: readonly number[]): Generator<SortStep<InsertionExtra>> {
  const r = new SortRecorder<InsertionExtra>(values, { key: null });
  const n = r.length;
  yield r.step('start', 'fn', 'start', { params: { n } });
  if (n > 0) r.sorted.add(0);
  for (let i = 1; i <= n - 1; i++) {
    const key = r.item(i);
    r.range = [0, i];
    r.extra.key = key;
    r.write(i, null);
    r.read();
    yield r.step('pick', 'key', 'pick', {
      pointers: [{ label: 'i', index: i }], vars: { i, key: key.value }, params: { value: key.value, i }, phase: 'pass', tone: r.tone(key.value),
    });
    let j = i - 1;
    while (true) {
      if (j < 0) {
        yield r.step('boundary', 'while', 'boundary', { pointers: [{ label: 'j+1', index: 0 }], vars: { i, j, key: key.value } });
        break;
      }
      const greater = r.compareValues(r.value(j), key.value) > 0;
      yield r.step('compare', 'while', greater ? 'compare-gt' : 'compare-le', {
        marks: { [j]: 'compare' }, pointers: [{ label: 'j', index: j }], vars: { i, j, key: key.value },
        params: { a: r.value(j), key: key.value }, tone: r.tone(r.value(j)),
      });
      if (!greater) break;
      const moved = r.item(j);
      r.write(j + 1, moved);
      r.write(j, null);
      yield r.step('shift', 'shift', 'shift', {
        marks: { [j + 1]: 'write' }, pointers: [{ label: 'j', index: j }], vars: { i, j, key: key.value },
        params: { value: moved.value, from: j, to: j + 1 }, tone: r.tone(moved.value),
      });
      j--;
    }
    r.write(j + 1, key);
    r.extra.key = null;
    for (let k = 0; k <= i; k++) r.sorted.add(k);
    yield r.step('insert', 'place', 'insert', {
      marks: { [j + 1]: 'key' }, pointers: [{ label: 'j+1', index: j + 1 }], vars: { i, j, key: key.value },
      params: { value: key.value, index: j + 1 }, tone: r.tone(key.value),
    });
  }
  r.lockAll();
  r.range = null;
  yield r.step('done', null, 'done');
}
