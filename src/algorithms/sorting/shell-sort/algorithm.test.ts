import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, finalItems, isStable, manyDuplicates, smallInts } from '../testing';
import { knuthGaps, pseudocode, run } from './algorithm';

function reference(values: number[]) {
  const a = [...values];
  let comparisons = 0;
  for (const h of knuthGaps(a.length)) {
    for (let i = h; i < a.length; i++) {
      const key = a[i]!;
      let j = i;
      while (j >= h) {
        comparisons++;
        if (!(a[j - h]! > key)) break;
        a[j] = a[j - h]!;
        j -= h;
      }
      a[j] = key;
    }
  }
  return { comparisons };
}

describe('shell sort (Knuth gaps)', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, false));

  it('satisfies the contract on random input', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      checkContract(values, collect(run(values)), pseudocode, false);
    }), { numRuns: 400 });
  });

  it('comparisons match a reference implementation', () => {
    fc.assert(fc.property(smallInts, (values) => {
      expect(counters(collect(run(values))).comparisons).toBe(reference(values).comparisons);
    }), { numRuns: 300 });
  });

  it('uses 1, 4, 13, … and each pass leaves the array h-sorted', () => {
    expect(knuthGaps(40)).toEqual([13, 4, 1]);
    fc.assert(fc.property(smallInts, (values) => {
      for (const s of collect(run(values)).filter((s) => s.event === 'pass-done')) {
        const h = s.vars.h as number;
        const v = s.state.items.map((it) => it!.value);
        for (let i = h; i < v.length; i++) expect(v[i - h]!).toBeLessThanOrEqual(v[i]!);
      }
    }), { numRuns: 200 });
  });

  it('is demonstrably unstable', () => {
    expect(isStable(finalItems(collect(run([5, 4, 4, 1, 2, 3]))))).toBe(false);
  });
});
