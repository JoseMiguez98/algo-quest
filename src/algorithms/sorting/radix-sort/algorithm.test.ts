import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases } from '../testing';
import { pseudocode, run } from './algorithm';

const nonNegative = fc.array(fc.integer({ min: 0, max: 99999 }), { maxLength: 24 });

describe('radix sort (LSD)', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, true));

  it.each([2, 4, 10, 16])('is stable and correct in base %i for any digit count', (base) => {
    fc.assert(fc.property(nonNegative, (values) => {
      checkContract(values, collect(run(values, { base })), pseudocode, true);
    }), { numRuns: 200 });
  });

  it('runs one pass per digit of the maximum and does no comparisons', () => {
    const steps = collect(run([7, 1002, 45, 0]));
    expect(steps.filter((s) => s.event === 'pass').length).toBe(4);
    expect(counters(steps).comparisons).toBe(0);
    expect(collect(run([0, 0, 0])).filter((s) => s.event === 'pass').length).toBe(0);
  });

  it('after pass p the array equals a stable sort of the input by its last p digits', () => {
    fc.assert(fc.property(nonNegative, fc.constantFrom(2, 10), (values, base) => {
      for (const s of collect(run(values, { base })).filter((s) => s.event === 'copy-back')) {
        const mod = s.state.extra.exp * base;
        const expected = values.map((value, id) => ({ id, value })).sort((a, b) => a.value % mod - b.value % mod || a.id - b.id);
        expect(s.state.items).toEqual(expected);
      }
    }), { numRuns: 200 });
  });

  it('rejects negative or fractional input', () => {
    expect(() => collect(run([3, -1]))).toThrow(RangeError);
    expect(() => collect(run([1.5]))).toThrow(RangeError);
  });
});
