import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortItem, SortStep } from '../types';

export interface CountingExtra {
  offset: number;
  counts: number[];
  output: (SortItem | null)[];
  /** Index into counts being touched, or null. */
  focus: number | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure countingSort(A)' },
  { id: 'range', indent: 1, text: 'lo ← min(A);  k ← max(A) − lo' },
  { id: 'init', indent: 1, text: 'C[0..k] ← 0' },
  { id: 'count', indent: 1, text: 'for i ← 0 to n − 1 do  C[A[i] − lo] += 1' },
  { id: 'prefix', indent: 1, text: 'for v ← 1 to k do  C[v] ← C[v] + C[v − 1]' },
  { id: 'place-loop', indent: 1, text: 'for i ← n − 1 downto 0 do' },
  { id: 'dec', indent: 2, text: 'C[A[i] − lo] ← C[A[i] − lo] − 1' },
  { id: 'place', indent: 2, text: 'B[C[A[i] − lo]] ← A[i]' },
  { id: 'copy', indent: 1, text: 'A ← B' },
];

export function* run(values: readonly number[]): Generator<SortStep<CountingExtra>> {
  const n = values.length;
  const r = new SortRecorder<CountingExtra>(values, { offset: 0, counts: [], output: new Array(n).fill(null), focus: null });
  yield r.step('start', 'fn', 'start', { params: { n } });
  if (n === 0) {
    yield r.step('done', null, 'done');
    return;
  }
  let lo = r.value(0);
  let hi = r.value(0);
  for (let i = 0; i < n; i++) {
    r.read();
    lo = Math.min(lo, r.value(i));
    hi = Math.max(hi, r.value(i));
  }
  const k = hi - lo;
  r.extra.offset = lo;
  r.extra.counts = new Array(k + 1).fill(0);
  yield r.step('range', 'range', 'range', { vars: { lo, k }, params: { lo, hi, k }, phase: 'count' });
  yield r.step('init', 'init', 'init', { vars: { lo, k }, params: { size: k + 1 } });
  for (let i = 0; i < n; i++) {
    const v = r.value(i);
    r.read();
    r.extra.counts[v - lo]!++;
    r.extra.focus = v - lo;
    yield r.step('count', 'count', 'count', {
      marks: { [i]: 'active' }, pointers: [{ label: 'i', index: i }], vars: { i, 'A[i]': v, lo }, params: { value: v, slot: v - lo, count: r.extra.counts[v - lo]! }, tone: r.tone(v),
    });
  }
  for (let v = 1; v <= k; v++) {
    r.extra.counts[v]! += r.extra.counts[v - 1]!;
    r.extra.focus = v;
    yield r.step('prefix', 'prefix', 'prefix', {
      vars: { v, 'C[v]': r.extra.counts[v]! }, params: { v, total: r.extra.counts[v]!, value: v + lo }, tone: v / Math.max(1, k), phase: v === 1 ? 'prefix' : undefined,
    });
  }
  for (let i = n - 1; i >= 0; i--) {
    const it = r.item(i);
    r.read();
    const slot = it.value - lo;
    const pos = --r.extra.counts[slot]!;
    r.extra.output[pos] = it;
    r.counters.writes++;
    r.extra.focus = slot;
    yield r.step('write', 'place', 'place', {
      marks: { [i]: 'active' }, pointers: [{ label: 'i', index: i }], vars: { i, 'A[i]': it.value, pos }, params: { value: it.value, pos, id: it.id }, tone: r.tone(it.value), phase: i === n - 1 ? 'place' : undefined,
    });
  }
  r.extra.focus = null;
  for (let i = 0; i < n; i++) r.write(i, r.extra.output[i]!);
  r.extra.output = new Array(n).fill(null);
  r.lockAll();
  yield r.step('copy-back', 'copy', 'copy-back', { phase: 'copy' });
  yield r.step('done', null, 'done');
}
