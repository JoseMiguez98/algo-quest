import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run } from './algorithm';

describe('counting sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, true));

  it('is stable and correct on random input, including negatives', () => {
    const withNegatives = fc.array(fc.integer({ min: -9, max: 9 }), { maxLength: 24 });
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates, withNegatives), (values) => {
      checkContract(values, collect(run(values)), pseudocode, true);
    }), { numRuns: 400 });
  });

  it('does no comparisons and writes exactly 2n', () => {
    fc.assert(fc.property(smallInts, (values) => {
      const c = counters(collect(run(values)));
      expect(c.comparisons).toBe(0);
      expect(c.writes).toBe(2 * values.length);
    }), { numRuns: 200 });
  });

  it('after the prefix phase C[v] is the number of elements ≤ v + lo', () => {
    fc.assert(fc.property(fc.array(fc.integer({ min: 1, max: 20 }), { minLength: 1, maxLength: 24 }), (values) => {
      const steps = collect(run(values));
      const firstPlace = steps.find((s) => s.event === 'write')!;
      const before = steps[steps.indexOf(firstPlace) - 1]!;
      const { counts, offset } = before.state.extra;
      counts.forEach((c, v) => expect(c).toBe(values.filter((x) => x <= v + offset).length));
    }), { numRuns: 200 });
  });
});
