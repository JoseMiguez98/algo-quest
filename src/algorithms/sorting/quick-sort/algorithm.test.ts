import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, finalItems, isStable, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run, type PivotStrategy } from './algorithm';

function referenceLomuto(values: number[]) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  const swap = (i: number, j: number) => {
    if (i !== j) {
      [a[i], a[j]] = [a[j]!, a[i]!];
      swaps++;
    }
  };
  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const pivot = a[hi]!;
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      if (a[j]! <= pivot) swap(++i, j);
    }
    swap(i + 1, hi);
    sort(lo, i);
    sort(i + 2, hi);
  };
  sort(0, a.length - 1);
  return { comparisons, swaps };
}

const strategies: PivotStrategy[] = ['last', 'first', 'median3', 'random'];

describe('quick sort (Lomuto)', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, false));

  it.each(strategies)('satisfies the contract with pivot=%s, including duplicates', (pivot) => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), fc.integer(), (values, seed) => {
      checkContract(values, collect(run(values, { pivot, seed })), pseudocode, false);
    }), { numRuns: 300 });
  });

  it('matches reference Lomuto counts and never counts self-swaps', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      const steps = collect(run(values));
      const ref = referenceLomuto(values);
      expect(counters(steps).comparisons).toBe(ref.comparisons);
      expect(counters(steps).swaps).toBe(ref.swaps);
    }), { numRuns: 300 });
  });

  it('partition invariant: A[lo..p-1] ≤ pivot < A[p+1..hi]', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), fc.constantFrom(...strategies), (values, pivot) => {
      for (const s of collect(run(values, { pivot })).filter((s) => s.line === 'place')) {
        const { lo, hi, p } = s.vars as { lo: number; hi: number; p: number };
        const v = (k: number) => s.state.items[k]!.value;
        for (let k = lo; k < p; k++) expect(v(k)).toBeLessThanOrEqual(v(p));
        for (let k = p + 1; k <= hi; k++) expect(v(k)).toBeGreaterThan(v(p));
      }
    }), { numRuns: 200 });
  });

  it('is demonstrably unstable', () => {
    expect(isStable(finalItems(collect(run([2, 2, 1]))))).toBe(false);
  });
});
