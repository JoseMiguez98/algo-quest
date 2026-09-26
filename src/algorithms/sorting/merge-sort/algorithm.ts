import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { BarMark, SortItem, SortStep } from '../types';

export interface MergeExtra {
  /** Auxiliary buffer B where each merge is written before copying back. */
  aux: (SortItem | null)[];
  /** Active recursion frames, outermost first. */
  stack: { lo: number; hi: number }[];
  /** Split into halves for the current merge, when merging. */
  halves: { lo: number; mid: number; hi: number } | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure mergeSort(A, lo, hi)' },
  { id: 'base', indent: 1, text: 'if lo ≥ hi then return' },
  { id: 'mid', indent: 1, text: 'mid ← ⌊(lo + hi) / 2⌋' },
  { id: 'left', indent: 1, text: 'mergeSort(A, lo, mid)' },
  { id: 'right', indent: 1, text: 'mergeSort(A, mid + 1, hi)' },
  { id: 'call-merge', indent: 1, text: 'merge(A, lo, mid, hi)' },
  { id: 'merge', indent: 0, text: 'procedure merge(A, lo, mid, hi)' },
  { id: 'init', indent: 1, text: 'i ← lo;  j ← mid + 1;  k ← lo' },
  { id: 'while', indent: 1, text: 'while i ≤ mid and j ≤ hi do' },
  { id: 'cmp', indent: 2, text: 'if A[i] ≤ A[j] then' },
  { id: 'take-left', indent: 3, text: 'B[k] ← A[i];  i ← i + 1' },
  { id: 'take-right', indent: 2, text: 'else B[k] ← A[j];  j ← j + 1' },
  { id: 'rest', indent: 1, text: 'copy the remaining run into B' },
  { id: 'copy', indent: 1, text: 'A[lo..hi] ← B[lo..hi]' },
];

export function* run(values: readonly number[]): Generator<SortStep<MergeExtra>> {
  const n = values.length;
  const r = new SortRecorder<MergeExtra>(values, { aux: new Array(n).fill(null), stack: [], halves: null });
  yield r.step('start', 'fn', 'start', { params: { n } });
  if (n > 0) yield* sort(r, 0, n - 1);
  r.lockAll();
  r.range = null;
  r.extra.stack = [];
  yield r.step('done', null, 'done');
}

function* sort(r: SortRecorder<MergeExtra>, lo: number, hi: number): Generator<SortStep<MergeExtra>> {
  r.extra.stack.push({ lo, hi });
  r.range = [lo, hi];
  const depth = r.extra.stack.length - 1;
  if (lo >= hi) {
    yield r.step('base', 'base', 'base', { vars: { lo, hi, depth }, params: { lo, value: r.value(lo) } });
    r.extra.stack.pop();
    return;
  }
  const mid = Math.floor((lo + hi) / 2);
  yield r.step('split', 'mid', 'split', { vars: { lo, mid, hi, depth }, params: { lo, mid, hi }, phase: depth === 0 ? 'split' : undefined });
  yield* sort(r, lo, mid);
  yield* sort(r, mid + 1, hi);
  r.range = [lo, hi];
  yield* merge(r, lo, mid, hi, depth);
  r.extra.stack.pop();
}

function* merge(r: SortRecorder<MergeExtra>, lo: number, mid: number, hi: number, depth: number): Generator<SortStep<MergeExtra>> {
  const consumed = new Set<number>();
  const marks = (extra: Record<number, BarMark> = {}): Record<number, BarMark> => {
    const m: Record<number, BarMark> = {};
    for (const c of consumed) m[c] = 'inactive';
    return { ...m, ...extra };
  };
  r.extra.halves = { lo, mid, hi };
  let i = lo;
  let j = mid + 1;
  let k = lo;
  const ptr = () => [
    ...(i <= mid ? [{ label: 'i', index: i }] : []),
    ...(j <= hi ? [{ label: 'j', index: j }] : []),
  ];
  yield r.step('merge-start', 'init', 'merge-start', { vars: { lo, mid, hi, i, j, k, depth }, params: { lo, mid, hi }, pointers: ptr(), phase: depth === 0 ? 'merge' : undefined });
  while (i <= mid && j <= hi) {
    const a = r.value(i);
    const b = r.value(j);
    const takeLeft = r.compare(i, j) <= 0;
    yield r.step('compare', 'cmp', takeLeft ? 'compare-le' : 'compare-gt', {
      marks: marks({ [i]: 'compare', [j]: 'compare' }), pointers: ptr(), vars: { lo, mid, hi, i, j, k }, params: { a, b }, tone: r.tone(Math.min(a, b)),
    });
    const src = takeLeft ? i : j;
    r.extra.aux[k] = r.item(src);
    r.counters.writes++;
    consumed.add(src);
    if (takeLeft) i++;
    else j++;
    yield r.step('write-aux', takeLeft ? 'take-left' : 'take-right', 'write-aux', {
      marks: marks(), pointers: ptr(), vars: { lo, mid, hi, i, j, k }, params: { value: r.value(src), k }, tone: r.tone(r.value(src)),
    });
    k++;
  }
  while (i <= mid || j <= hi) {
    const src = i <= mid ? i++ : j++;
    r.extra.aux[k] = r.item(src);
    r.counters.writes++;
    consumed.add(src);
    yield r.step('write-aux', 'rest', 'rest', {
      marks: marks(), pointers: ptr(), vars: { lo, mid, hi, i, j, k }, params: { value: r.value(src), k }, tone: r.tone(r.value(src)),
    });
    k++;
  }
  for (let t = lo; t <= hi; t++) {
    const it = r.extra.aux[t]!;
    r.write(t, it);
    r.extra.aux[t] = null;
    consumed.delete(t);
  }
  r.extra.halves = null;
  if (lo === 0 && hi === r.length - 1) r.lockAll();
  yield r.step('copy-back', 'copy', 'copy-back', { marks: rangeMarks(lo, hi, 'write'), vars: { lo, hi }, params: { lo, hi } });
}

function rangeMarks(lo: number, hi: number, mark: BarMark): Record<number, BarMark> {
  const m: Record<number, BarMark> = {};
  for (let t = lo; t <= hi; t++) m[t] = mark;
  return m;
}
