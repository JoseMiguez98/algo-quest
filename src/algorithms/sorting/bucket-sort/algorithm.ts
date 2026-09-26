import type { Pseudocode } from '../../../core/types';
import { SortRecorder } from '../recorder';
import type { BarMark, SortItem, SortStep } from '../types';

export interface BucketOptions {
  buckets: number;
}

export interface BucketExtra {
  buckets: SortItem[][];
  /** Inclusive value range each bucket accepts. */
  ranges: [number, number][];
  focus: { bucket: number; index: number; mark: BarMark }[];
  activeBucket: number | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure bucketSort(A, k)' },
  { id: 'range', indent: 1, text: 'lo ← min(A);  hi ← max(A);  create k empty buckets' },
  { id: 'scatter', indent: 1, text: 'for each x in A do' },
  { id: 'index', indent: 2, text: 'b ← ⌊(x − lo) · k / (hi − lo + 1)⌋;  append x to bucket[b]' },
  { id: 'sort-loop', indent: 1, text: 'for b ← 0 to k − 1 do  insertionSort(bucket[b])' },
  { id: 'cmp', indent: 2, text: 'while j ≥ 0 and bucket[b][j] > key do' },
  { id: 'shift', indent: 3, text: 'bucket[b][j + 1] ← bucket[b][j];  j ← j − 1' },
  { id: 'insert', indent: 2, text: 'bucket[b][j + 1] ← key' },
  { id: 'gather', indent: 1, text: 'A ← bucket[0] ++ bucket[1] ++ … ++ bucket[k − 1]' },
];

export const bucketOf = (x: number, lo: number, hi: number, k: number): number => Math.floor(((x - lo) * k) / (hi - lo + 1));

export function* run(values: readonly number[], options: Partial<BucketOptions> = {}): Generator<SortStep<BucketExtra>> {
  const k = options.buckets ?? 5;
  if (!Number.isInteger(k) || k < 1) throw new RangeError('buckets must be a positive integer');
  if (values.some((v) => !Number.isInteger(v))) throw new RangeError('this bucket sort maps integers');
  const n = values.length;
  const r = new SortRecorder<BucketExtra>(values, { buckets: [], ranges: [], focus: [], activeBucket: null });
  yield r.step('start', 'fn', 'start', { params: { n, k } });
  if (n === 0) {
    yield r.step('done', null, 'done');
    return;
  }
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  r.counters.reads += n;
  r.extra.buckets = Array.from({ length: k }, () => []);
  r.extra.ranges = Array.from({ length: k }, (_, b) => bucketRange(b, lo, hi, k));
  yield r.step('range', 'range', 'range', { vars: { lo, hi, k }, params: { lo, hi, k }, phase: 'scatter' });
  for (let i = 0; i < n; i++) {
    const it = r.item(i);
    const b = bucketOf(it.value, lo, hi, k);
    r.read();
    r.extra.buckets[b]!.push(it);
    r.counters.writes++;
    r.write(i, null);
    r.extra.activeBucket = b;
    r.extra.focus = [{ bucket: b, index: r.extra.buckets[b]!.length - 1, mark: 'write' }];
    yield r.step('scatter', 'index', 'scatter', { pointers: [{ label: 'i', index: i }], vars: { i, x: it.value, b }, params: { value: it.value, bucket: b }, tone: b / Math.max(1, k - 1) });
  }
  for (let b = 0; b < k; b++) {
    const bucket = r.extra.buckets[b]!;
    r.extra.activeBucket = b;
    r.extra.focus = [];
    yield r.step('bucket', 'sort-loop', bucket.length > 1 ? 'bucket-sort' : 'bucket-trivial', { vars: { b }, params: { bucket: b, size: bucket.length }, phase: b === 0 ? 'sort' : undefined });
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i]!;
      let j = i - 1;
      while (j >= 0) {
        const gt = r.compareValues(bucket[j]!.value, key.value) > 0;
        r.extra.focus = [{ bucket: b, index: j, mark: 'compare' }, { bucket: b, index: j + 1, mark: 'key' }];
        yield r.step('compare', 'cmp', gt ? 'compare-gt' : 'compare-le', { vars: { b, i, j, key: key.value }, params: { a: bucket[j]!.value, key: key.value }, tone: r.tone(bucket[j]!.value) });
        if (!gt) break;
        bucket[j + 1] = bucket[j]!;
        bucket[j] = key;
        r.counters.writes++;
        r.extra.focus = [{ bucket: b, index: j, mark: 'key' }, { bucket: b, index: j + 1, mark: 'write' }];
        yield r.step('shift', 'shift', 'shift', { vars: { b, i, j, key: key.value }, params: { value: bucket[j + 1]!.value }, tone: r.tone(key.value) });
        j--;
      }
      r.counters.writes++;
      r.extra.focus = [{ bucket: b, index: j + 1, mark: 'key' }];
      yield r.step('insert', 'insert', 'insert', { vars: { b, i, j, key: key.value }, params: { value: key.value, index: j + 1 } });
    }
  }
  r.extra.activeBucket = null;
  r.extra.focus = [];
  let out = 0;
  for (let b = 0; b < k; b++) {
    const bucket = r.extra.buckets[b]!;
    while (bucket.length) {
      const it = bucket.shift()!;
      r.write(out, it);
      r.sorted.add(out);
      yield r.step('write', 'gather', 'gather', { marks: { [out]: 'write' }, vars: { b, index: out }, params: { value: it.value, bucket: b, index: out }, tone: r.tone(it.value), phase: out === 0 ? 'gather' : undefined });
      out++;
    }
  }
  r.lockAll();
  yield r.step('done', null, 'done');
}

function bucketRange(b: number, lo: number, hi: number, k: number): [number, number] {
  const span = hi - lo + 1;
  const first = lo + Math.ceil((b * span) / k);
  const last = lo + Math.ceil(((b + 1) * span) / k) - 1;
  return [first, last];
}
