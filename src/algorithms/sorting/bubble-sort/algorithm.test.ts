import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, inversions, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run } from './algorithm';

function reference(values: number[]) {
  const a = [...values];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - 1 - i; j++) {
      comparisons++;
      if (a[j]! > a[j + 1]!) {
        [a[j], a[j + 1]] = [a[j + 1]!, a[j]!];
        swaps++;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { comparisons, swaps };
}

describe('bubble sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, true));

  it('satisfies the contract on random input', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      checkContract(values, collect(run(values)), pseudocode, true);
    }), { numRuns: 400 });
  });

  it('matches reference counts; swaps equal inversions', () => {
    fc.assert(fc.property(smallInts, (values) => {
      const c = counters(collect(run(values)));
      const ref = reference(values);
      expect(c.comparisons).toBe(ref.comparisons);
      expect(c.swaps).toBe(ref.swaps);
      expect(c.swaps).toBe(inversions(values));
    }), { numRuns: 300 });
  });

  it('after each pass the largest remaining element is in its final place', () => {
    fc.assert(fc.property(smallInts, (values) => {
      const sorted = [...values].sort((a, b) => a - b);
      for (const s of collect(run(values)).filter((s) => s.event === 'lock')) {
        const end = s.narration.params!.end ?? s.narration.params!.index;
        const tail = s.state.items.slice(end as number).map((it) => it!.value);
        expect(tail).toEqual(sorted.slice(end as number));
      }
    }), { numRuns: 200 });
  });

  it('stops early on sorted input after a single pass', () => {
    const steps = collect(run([1, 2, 3, 4, 5]));
    expect(counters(steps).comparisons).toBe(4);
    expect(steps.some((s) => s.event === 'early-exit')).toBe(true);
  });
});
