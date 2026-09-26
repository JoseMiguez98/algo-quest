import type { Pseudocode } from '../../../core/types';
import { mulberry32 } from '../../../core/rng';
import { SortRecorder } from '../recorder';
import type { BarMark, SortStep } from '../types';

export type PivotStrategy = 'last' | 'first' | 'median3' | 'random';

export interface QuickOptions {
  pivot: PivotStrategy;
  seed: number;
}

export interface QuickExtra {
  stack: { lo: number; hi: number }[];
  /** Lomuto regions of the partition in progress: A[lo..i] < pivot, A[i+1..j-1] ≥ pivot. */
  partition: { lo: number; hi: number; i: number; j: number } | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure quickSort(A, lo, hi)' },
  { id: 'base', indent: 1, text: 'if lo < hi then' },
  { id: 'call-part', indent: 2, text: 'p ← partition(A, lo, hi)' },
  { id: 'left', indent: 2, text: 'quickSort(A, lo, p − 1)' },
  { id: 'right', indent: 2, text: 'quickSort(A, p + 1, hi)' },
  { id: 'part', indent: 0, text: 'procedure partition(A, lo, hi)' },
  { id: 'choose', indent: 1, text: 'move the chosen pivot to A[hi]' },
  { id: 'pivot', indent: 1, text: 'pivot ← A[hi];  i ← lo − 1' },
  { id: 'loop', indent: 1, text: 'for j ← lo to hi − 1 do' },
  { id: 'cmp', indent: 2, text: 'if A[j] ≤ pivot then' },
  { id: 'inc', indent: 3, text: 'i ← i + 1' },
  { id: 'swap', indent: 3, text: 'swap(A[i], A[j])' },
  { id: 'place', indent: 1, text: 'swap(A[i + 1], A[hi])' },
  { id: 'ret', indent: 1, text: 'return i + 1' },
];

export function* run(values: readonly number[], options: Partial<QuickOptions> = {}): Generator<SortStep<QuickExtra>> {
  const opts: QuickOptions = { pivot: 'last', seed: 1, ...options };
  const rng = mulberry32(opts.seed);
  const r = new SortRecorder<QuickExtra>(values, { stack: [], partition: null });
  yield r.step('start', 'fn', 'start', { params: { n: r.length } });
  yield* sort(r, 0, r.length - 1, opts.pivot, rng);
  r.lockAll();
  r.range = null;
  yield r.step('done', null, 'done');
}

function* sort(r: SortRecorder<QuickExtra>, lo: number, hi: number, strategy: PivotStrategy, rng: () => number): Generator<SortStep<QuickExtra>> {
  if (lo > hi) return;
  r.extra.stack.push({ lo, hi });
  r.range = [lo, hi];
  const depth = r.extra.stack.length - 1;
  if (lo === hi) {
    r.sorted.add(lo);
    yield r.step('base', 'base', 'base', { vars: { lo, hi, depth }, params: { lo, value: r.value(lo) } });
    r.extra.stack.pop();
    return;
  }
  const p = yield* partition(r, lo, hi, strategy, rng, depth);
  yield* sort(r, lo, p - 1, strategy, rng);
  yield* sort(r, p + 1, hi, strategy, rng);
  r.extra.stack.pop();
}

function pickPivot(r: SortRecorder<QuickExtra>, lo: number, hi: number, strategy: PivotStrategy, rng: () => number): number {
  switch (strategy) {
    case 'last': return hi;
    case 'first': return lo;
    case 'random': return lo + Math.floor(rng() * (hi - lo + 1));
    case 'median3': {
      const mid = Math.floor((lo + hi) / 2);
      const [a, b, c] = [lo, mid, hi];
      const ab = r.compare(a, b) <= 0;
      const bc = r.compare(b, c) <= 0;
      if (ab === bc) return b;
      const ac = r.compare(a, c) <= 0;
      return ab === ac ? c : a;
    }
  }
}

function* partition(r: SortRecorder<QuickExtra>, lo: number, hi: number, strategy: PivotStrategy, rng: () => number, depth: number): Generator<SortStep<QuickExtra>, number> {
  const chosen = pickPivot(r, lo, hi, strategy, rng);
  if (chosen !== hi) {
    r.swap(chosen, hi);
    yield r.step('swap', 'choose', 'move-pivot', {
      marks: { [chosen]: 'swap', [hi]: 'pivot' }, vars: { lo, hi, depth }, params: { value: r.value(hi), from: chosen }, tone: r.tone(r.value(hi)),
    });
  }
  const pivot = r.value(hi);
  let i = lo - 1;
  const regionMarks = (extra: Record<number, BarMark> = {}): Record<number, BarMark> => ({ [hi]: 'pivot', ...extra });
  const ptr = (j: number) => [
    ...(i >= lo ? [{ label: 'i', index: i }] : []),
    ...(j <= hi - 1 ? [{ label: 'j', index: j }] : []),
  ];
  r.extra.partition = { lo, hi, i, j: lo };
  yield r.step('pivot', 'pivot', 'pivot', {
    marks: regionMarks(), pointers: ptr(lo), vars: { lo, hi, pivot, i, depth }, params: { pivot, lo, hi }, tone: r.tone(pivot), phase: depth === 0 ? 'partition' : undefined,
  });
  for (let j = lo; j <= hi - 1; j++) {
    r.extra.partition = { lo, hi, i, j };
    const le = r.compareValues(r.value(j), pivot) <= 0;
    yield r.step('compare', 'cmp', le ? 'compare-le' : 'compare-gt', {
      marks: regionMarks({ [j]: 'compare' }), pointers: ptr(j), vars: { lo, hi, pivot, i, j }, params: { a: r.value(j), pivot }, tone: r.tone(r.value(j)),
    });
    if (le) {
      i++;
      r.extra.partition = { lo, hi, i, j };
      if (i !== j) {
        r.swap(i, j);
        yield r.step('swap', 'swap', 'swap', {
          marks: regionMarks({ [i]: 'swap', [j]: 'swap' }), pointers: ptr(j), vars: { lo, hi, pivot, i, j }, params: { a: r.value(j), b: r.value(i) }, tone: r.tone(r.value(i)),
        });
      } else {
        yield r.step('grow', 'inc', 'grow', { marks: regionMarks({ [i]: 'active' }), pointers: ptr(j), vars: { lo, hi, pivot, i, j }, params: { i } });
      }
    }
  }
  const p = i + 1;
  r.extra.partition = { lo, hi, i, j: hi };
  r.swap(p, hi);
  r.sorted.add(p);
  r.extra.partition = null;
  yield r.step(p !== hi ? 'swap' : 'place', 'place', 'place', {
    marks: { [p]: 'pivot' }, pointers: [{ label: 'p', index: p }], vars: { lo, hi, pivot, p }, params: { pivot, p }, tone: r.tone(pivot),
  });
  return p;
}
