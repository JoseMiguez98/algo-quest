import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortItem, SortStep } from '../types';

export interface RadixOptions {
  base: number;
}

export interface RadixExtra {
  base: number;
  exp: number;
  pass: number;
  passes: number;
  counts: number[];
  output: (SortItem | null)[];
  focus: number | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure radixSort(A, b)' },
  { id: 'loop', indent: 1, text: 'for exp ← 1, b, b², … while ⌊max(A) / exp⌋ > 0 do' },
  { id: 'init', indent: 2, text: 'C[0..b − 1] ← 0' },
  { id: 'count', indent: 2, text: 'for i ← 0 to n − 1 do  C[digit(A[i], exp)] += 1' },
  { id: 'prefix', indent: 2, text: 'for d ← 1 to b − 1 do  C[d] ← C[d] + C[d − 1]' },
  { id: 'place-loop', indent: 2, text: 'for i ← n − 1 downto 0 do' },
  { id: 'place', indent: 3, text: 'd ← digit(A[i], exp);  C[d] −= 1;  B[C[d]] ← A[i]' },
  { id: 'copy', indent: 2, text: 'A ← B' },
];

export const digit = (value: number, exp: number, base: number): number => Math.floor(value / exp) % base;

export function* run(values: readonly number[], options: Partial<RadixOptions> = {}): Generator<SortStep<RadixExtra>> {
  const base = options.base ?? 10;
  if (!Number.isInteger(base) || base < 2) throw new RangeError('base must be an integer ≥ 2');
  if (values.some((v) => !Number.isInteger(v) || v < 0)) throw new RangeError('radix sort needs non-negative integers');
  const n = values.length;
  const max = n ? Math.max(...values) : 0;
  let passes = 0;
  for (let e = 1; Math.floor(max / e) > 0; e *= base) passes++;
  const r = new SortRecorder<RadixExtra>(values, { base, exp: 1, pass: 0, passes, counts: new Array(base).fill(0), output: new Array(n).fill(null), focus: null });
  yield r.step('start', 'fn', 'start', { params: { n, base, passes, max } });
  for (let exp = 1, pass = 1; Math.floor(max / exp) > 0; exp *= base, pass++) {
    Object.assign(r.extra, { exp, pass, counts: new Array(base).fill(0), output: new Array(n).fill(null), focus: null });
    yield r.step('pass', 'init', 'pass', { vars: { exp, pass }, params: { pass, passes, exp }, phase: 'pass' });
    for (let i = 0; i < n; i++) {
      const v = r.value(i);
      const d = digit(v, exp, base);
      r.read();
      r.extra.counts[d]!++;
      r.extra.focus = d;
      yield r.step('count', 'count', 'count', {
        marks: { [i]: 'active' }, pointers: [{ label: 'i', index: i }], vars: { i, 'A[i]': v, d }, params: { value: v, digit: d }, tone: d / (base - 1),
      });
    }
    for (let d = 1; d < base; d++) {
      r.extra.counts[d]! += r.extra.counts[d - 1]!;
      r.extra.focus = d;
      yield r.step('prefix', 'prefix', 'prefix', { vars: { d, 'C[d]': r.extra.counts[d]! }, params: { digit: d, total: r.extra.counts[d]! }, tone: d / (base - 1) });
    }
    for (let i = n - 1; i >= 0; i--) {
      const it = r.item(i);
      const d = digit(it.value, exp, base);
      r.read();
      const pos = --r.extra.counts[d]!;
      r.extra.output[pos] = it;
      r.counters.writes++;
      r.extra.focus = d;
      yield r.step('write', 'place', 'place', {
        marks: { [i]: 'active' }, pointers: [{ label: 'i', index: i }], vars: { i, 'A[i]': it.value, d, pos }, params: { value: it.value, digit: d, pos }, tone: d / (base - 1),
      });
    }
    for (let i = 0; i < n; i++) r.write(i, r.extra.output[i]!);
    r.extra.output = new Array(n).fill(null);
    r.extra.focus = null;
    yield r.step('copy-back', 'copy', 'copy-back', { vars: { exp, pass }, params: { pass, exp } });
  }
  r.lockAll();
  yield r.step('done', null, 'done');
}
