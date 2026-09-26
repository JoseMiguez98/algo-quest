import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, finalItems, isStable, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run } from './algorithm';

describe('selection sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, false));

  it('satisfies the contract on random input', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      checkContract(values, collect(run(values)), pseudocode, false);
    }), { numRuns: 400 });
  });

  it('always does n(n-1)/2 comparisons and at most n-1 swaps', () => {
    fc.assert(fc.property(smallInts, (values) => {
      const n = values.length;
      const c = counters(collect(run(values)));
      expect(c.comparisons).toBe(n < 2 ? 0 : (n * (n - 1)) / 2);
      expect(c.swaps).toBeLessThanOrEqual(Math.max(0, n - 1));
    }), { numRuns: 300 });
  });

  it('prefix A[0..i] holds the i+1 smallest elements after pass i', () => {
    fc.assert(fc.property(smallInts, (values) => {
      const sorted = [...values].sort((a, b) => a - b);
      for (const s of collect(run(values)).filter((s) => s.event === 'lock')) {
        const i = s.vars.i as number;
        expect(s.state.items.slice(0, i + 1).map((it) => it!.value)).toEqual(sorted.slice(0, i + 1));
      }
    }), { numRuns: 200 });
  });

  it('is demonstrably unstable', () => {
    expect(isStable(finalItems(collect(run([2, 2, 1]))))).toBe(false);
  });
});
