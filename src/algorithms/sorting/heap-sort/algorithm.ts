import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { SortStep } from '../types';

export interface HeapExtra {
  heapSize: number;
  /** Node currently being sifted down, or null. */
  focus: number | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure heapSort(A)' },
  { id: 'build', indent: 1, text: 'for i ← ⌊n / 2⌋ − 1 downto 0 do' },
  { id: 'build-sift', indent: 2, text: 'siftDown(A, i, n)' },
  { id: 'extract', indent: 1, text: 'for end ← n − 1 downto 1 do' },
  { id: 'extract-swap', indent: 2, text: 'swap(A[0], A[end])' },
  { id: 'extract-sift', indent: 2, text: 'siftDown(A, 0, end)' },
  { id: 'sift', indent: 0, text: 'procedure siftDown(A, i, size)' },
  { id: 'children', indent: 1, text: 'largest ← i;  l ← 2i + 1;  r ← 2i + 2' },
  { id: 'cmp-left', indent: 1, text: 'if l < size and A[l] > A[largest] then largest ← l' },
  { id: 'cmp-right', indent: 1, text: 'if r < size and A[r] > A[largest] then largest ← r' },
  { id: 'stop', indent: 1, text: 'if largest = i then return' },
  { id: 'sift-swap', indent: 1, text: 'swap(A[i], A[largest]);  siftDown(A, largest, size)' },
];

export function* run(values: readonly number[]): Generator<SortStep<HeapExtra>> {
  const n = values.length;
  const r = new SortRecorder<HeapExtra>(values, { heapSize: n, focus: null });
  yield r.step('start', 'fn', 'start', { params: { n } });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield r.step('heapify', 'build-sift', 'heapify', { marks: { [i]: 'active' }, vars: { i, size: n }, params: { i, value: r.value(i) }, phase: i === Math.floor(n / 2) - 1 ? 'build' : undefined });
    yield* siftDown(r, i, n);
  }
  if (n > 0) yield r.step('heap-built', 'build', 'heap-built', { vars: { size: n }, params: { max: r.value(0) } });
  for (let end = n - 1; end >= 1; end--) {
    const max = r.value(0);
    r.swap(0, end);
    r.extra.heapSize = end;
    r.sorted.add(end);
    yield r.step('swap', 'extract-swap', 'extract', {
      marks: { [0]: 'swap', [end]: 'swap' }, vars: { end, size: end }, params: { max, end }, tone: r.tone(max), phase: end === n - 1 ? 'extract' : undefined,
    });
    yield* siftDown(r, 0, end);
  }
  r.extra.heapSize = 0;
  r.extra.focus = null;
  r.lockAll();
  yield r.step('done', null, 'done');
}

function* siftDown(r: SortRecorder<HeapExtra>, start: number, size: number): Generator<SortStep<HeapExtra>> {
  let i = start;
  while (true) {
    r.extra.focus = i;
    let largest = i;
    const l = 2 * i + 1;
    const rt = 2 * i + 2;
    if (l < size) {
      const gt = r.compare(l, largest) > 0;
      yield r.step('compare', 'cmp-left', gt ? 'left-larger' : 'left-smaller', {
        marks: { [i]: 'active', [l]: 'compare' }, vars: { i, l, r: rt, largest, size }, params: { child: r.value(l), parent: r.value(i) }, tone: r.tone(r.value(l)),
      });
      if (gt) largest = l;
    }
    if (rt < size) {
      const gt = r.compare(rt, largest) > 0;
      yield r.step('compare', 'cmp-right', gt ? 'right-larger' : 'right-smaller', {
        marks: { [i]: 'active', [largest]: 'max', [rt]: 'compare' }, vars: { i, l, r: rt, largest, size }, params: { child: r.value(rt), best: r.value(largest) }, tone: r.tone(r.value(rt)),
      });
      if (gt) largest = rt;
    }
    if (largest === i) {
      yield r.step('settle', 'stop', l < size ? 'settle' : 'leaf', { marks: { [i]: 'active' }, vars: { i, largest, size }, params: { value: r.value(i) } });
      r.extra.focus = null;
      return;
    }
    const a = r.value(i);
    const b = r.value(largest);
    r.swap(i, largest);
    yield r.step('swap', 'sift-swap', 'sift-swap', {
      marks: { [i]: 'swap', [largest]: 'swap' }, vars: { i, largest, size }, params: { a, b }, tone: r.tone(b),
    });
    i = largest;
  }
}
