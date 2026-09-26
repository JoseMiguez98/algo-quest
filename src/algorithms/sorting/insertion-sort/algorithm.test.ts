import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, inversions, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run } from './algorithm';

function referenceComparisons(values: number[]): number {
  const a = [...values];
  let c = 0;
  for (let i = 1; i < a.length; i++) {
    const key = a[i]!;
    let j = i - 1;
    while (j >= 0) {
      c++;
      if (!(a[j]! > key)) break;
      a[j + 1] = a[j]!;
      j--;
    }
    a[j + 1] = key;
  }
  return c;
}

describe('insertion sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, true));

  it('satisfies the contract on random input', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      checkContract(values, collect(run(values)), pseudocode, true);
    }), { numRuns: 400 });
  });

  it('shifts equal the number of inversions; comparisons match reference', () => {
    fc.assert(fc.property(smallInts, (values) => {
      const steps = collect(run(values));
      expect(steps.filter((s) => s.event === 'shift').length).toBe(inversions(values));
      expect(counters(steps).comparisons).toBe(referenceComparisons(values));
      expect(counters(steps).swaps).toBe(0);
    }), { numRuns: 300 });
  });

  it('A[0..i] is sorted after inserting the i-th key', () => {
    fc.assert(fc.property(smallInts, (values) => {
      for (const s of collect(run(values)).filter((s) => s.event === 'insert')) {
        const prefix = s.state.items.slice(0, (s.vars.i as number) + 1).map((it) => it!.value);
        expect(prefix).toEqual([...prefix].sort((a, b) => a - b));
      }
    }), { numRuns: 200 });
  });

  it('exactly one slot is empty while the key is lifted', () => {
    fc.assert(fc.property(smallInts, (values) => {
      for (const s of collect(run(values))) {
        const holes = s.state.items.filter((it) => it === null).length;
        expect(holes).toBe(s.state.extra.key ? 1 : 0);
      }
    }), { numRuns: 100 });
  });
});
