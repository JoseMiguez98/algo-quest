import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, finalItems, isStable, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run } from './algorithm';

function reference(values: number[]) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  const sift = (i: number, size: number) => {
    for (;;) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < size && (comparisons++, a[l]! > a[largest]!)) largest = l;
      if (r < size && (comparisons++, a[r]! > a[largest]!)) largest = r;
      if (largest === i) return;
      [a[i], a[largest]] = [a[largest]!, a[i]!];
      swaps++;
      i = largest;
    }
  };
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);
  for (let end = a.length - 1; end >= 1; end--) {
    [a[0], a[end]] = [a[end]!, a[0]!];
    swaps++;
    sift(0, end);
  }
  return { comparisons, swaps };
}

const isMaxHeap = (v: number[], size: number) =>
  v.slice(0, size).every((x, i) => i === 0 || v[Math.floor((i - 1) / 2)]! >= x);

describe('heap sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, false));

  it('satisfies the contract on random input', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      checkContract(values, collect(run(values)), pseudocode, false);
    }), { numRuns: 400 });
  });

  it('matches reference counts', () => {
    fc.assert(fc.property(fc.array(fc.integer({ min: 1, max: 99 }), { minLength: 2, maxLength: 24 }), (values) => {
      const c = counters(collect(run(values)));
      const ref = reference(values);
      expect(c.comparisons).toBe(ref.comparisons);
      expect(c.swaps).toBe(ref.swaps);
    }), { numRuns: 300 });
  });

  it('build phase yields a max-heap; every extraction moves the max of the heap to the end', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      const sorted = [...values].sort((a, b) => a - b);
      for (const s of collect(run(values))) {
        const v = s.state.items.map((it) => it!.value);
        if (s.event === 'heap-built') expect(isMaxHeap(v, v.length)).toBe(true);
        if (s.line === 'extract-swap') {
          const end = s.vars.end as number;
          expect(v.slice(0, end).every((x) => x <= v[end]!)).toBe(true);
          expect(v.slice(end)).toEqual(sorted.slice(end));
        }
        if (s.line === 'stop' && s.state.extra.heapSize < v.length) {
          expect(isMaxHeap(v, s.state.extra.heapSize)).toBe(true);
        }
      }
    }), { numRuns: 200 });
  });

  it('is demonstrably unstable', () => {
    expect(isStable(finalItems(collect(run([1, 1]))))).toBe(false);
  });
});
