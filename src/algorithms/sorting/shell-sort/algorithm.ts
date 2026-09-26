import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortItem, SortStep } from '../types';

export interface ShellExtra {
  key: SortItem | null;
  gap: number;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure shellSort(A)' },
  { id: 'gaps', indent: 1, text: 'h ← 1;  while h < n / 3 do h ← 3h + 1' },
  { id: 'loop', indent: 1, text: 'while h ≥ 1 do' },
  { id: 'outer', indent: 2, text: 'for i ← h to n − 1 do' },
  { id: 'key', indent: 3, text: 'key ← A[i];  j ← i' },
  { id: 'while', indent: 3, text: 'while j ≥ h and A[j − h] > key do' },
  { id: 'shift', indent: 4, text: 'A[j] ← A[j − h];  j ← j − h' },
  { id: 'place', indent: 3, text: 'A[j] ← key' },
  { id: 'shrink', indent: 2, text: 'h ← ⌊h / 3⌋' },
];

/** Knuth's gap sequence 1, 4, 13, 40, … (largest below n/3), as in Sedgewick's Algorithms. */
export function knuthGaps(n: number): number[] {
  const gaps = [1];
  while (gaps.at(-1)! < Math.floor(n / 3)) gaps.push(3 * gaps.at(-1)! + 1);
  return gaps.reverse();
}

export function* run(values: readonly number[]): Generator<SortStep<ShellExtra>> {
  const n = values.length;
  const gaps = knuthGaps(n);
  const r = new SortRecorder<ShellExtra>(values, { key: null, gap: gaps[0] ?? 1 });
  yield r.step('start', 'gaps', 'start', { params: { n, gaps: gaps.join(', ') } });
  for (const h of gaps) {
    r.extra.gap = h;
    yield r.step('pass', 'loop', 'gap', { vars: { h }, params: { h }, phase: 'pass' });
    for (let i = h; i < n; i++) {
      const key = r.item(i);
      r.extra.key = key;
      r.write(i, null);
      r.read();
      yield r.step('pick', 'key', 'pick', { pointers: [{ label: 'i', index: i }], vars: { h, i, key: key.value }, params: { value: key.value, i }, tone: r.tone(key.value) });
      let j = i;
      while (j >= h) {
        const greater = r.compareValues(r.value(j - h), key.value) > 0;
        yield r.step('compare', 'while', greater ? 'compare-gt' : 'compare-le', {
          marks: { [j - h]: 'compare' }, pointers: [{ label: 'j−h', index: j - h }], vars: { h, i, j, key: key.value }, params: { a: r.value(j - h), key: key.value, h }, tone: r.tone(r.value(j - h)),
        });
        if (!greater) break;
        const moved = r.item(j - h);
        r.write(j, moved);
        r.write(j - h, null);
        yield r.step('shift', 'shift', 'shift', { marks: { [j]: 'write' }, pointers: [{ label: 'j', index: j }], vars: { h, i, j, key: key.value }, params: { value: moved.value, from: j - h, to: j }, tone: r.tone(moved.value) });
        j -= h;
      }
      r.write(j, key);
      r.extra.key = null;
      yield r.step('insert', 'place', 'insert', { marks: { [j]: 'key' }, pointers: [{ label: 'j', index: j }], vars: { h, i, j }, params: { value: key.value, index: j }, tone: r.tone(key.value) });
    }
    yield r.step('pass-done', 'shrink', h === 1 ? 'sorted' : 'h-sorted', { vars: { h }, params: { h } });
  }
  r.lockAll();
  yield r.step('done', null, 'done');
}
