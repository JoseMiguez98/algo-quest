import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, manyDuplicates, smallInts } from '../testing';
import { bucketOf, pseudocode, run } from './algorithm';

describe('bucket sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, true));

  it.each([1, 3, 5, 10])('is stable and correct with %i buckets, including negatives', (buckets) => {
    const withNegatives = fc.array(fc.integer({ min: -50, max: 50 }), { maxLength: 24 });
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates, withNegatives), (values) => {
      checkContract(values, collect(run(values, { buckets })), pseudocode, true);
    }), { numRuns: 200 });
  });

  it('every item lands in the bucket whose advertised range contains it', () => {
    fc.assert(fc.property(fc.array(fc.integer({ min: -30, max: 120 }), { minLength: 1, maxLength: 24 }), fc.integer({ min: 1, max: 10 }), (values, k) => {
      const lo = Math.min(...values);
      const hi = Math.max(...values);
      for (const s of collect(run(values, { buckets: k })).filter((s) => s.event === 'scatter')) {
        const { ranges, buckets } = s.state.extra;
        buckets.forEach((b, idx) => b.forEach((it) => {
          expect(bucketOf(it.value, lo, hi, k)).toBe(idx);
          expect(it.value).toBeGreaterThanOrEqual(ranges[idx]![0]);
          expect(it.value).toBeLessThanOrEqual(ranges[idx]![1]);
        }));
      }
    }), { numRuns: 200 });
  });

  it('comparisons equal the sum of per-bucket insertion sort comparisons', () => {
    const values = [42, 7, 91, 33, 68, 15, 84, 26, 53, 3, 76, 47];
    const steps = collect(run(values));
    expect(counters(steps).comparisons).toBe(steps.filter((s) => s.event === 'compare').length);
  });
});
