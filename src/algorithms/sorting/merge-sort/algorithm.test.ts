import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkContract, collect, counters, edgeCases, manyDuplicates, smallInts } from '../testing';
import { pseudocode, run } from './algorithm';

function referenceComparisons(values: number[]): number {
  let c = 0;
  const sort = (a: number[]): number[] => {
    if (a.length <= 1) return a;
    const mid = Math.floor((a.length - 1) / 2) + 1;
    const l = sort(a.slice(0, mid));
    const r = sort(a.slice(mid));
    const out: number[] = [];
    let i = 0;
    let j = 0;
    while (i < l.length && j < r.length) {
      c++;
      out.push(l[i]! <= r[j]! ? l[i++]! : r[j++]!);
    }
    return out.concat(l.slice(i), r.slice(j));
  };
  sort(values);
  return c;
}

describe('merge sort', () => {
  it.each(edgeCases)('sorts %j', (...values) => checkContract(values, collect(run(values)), pseudocode, true));

  it('satisfies the contract on random input', () => {
    fc.assert(fc.property(fc.oneof(smallInts, manyDuplicates), (values) => {
      checkContract(values, collect(run(values)), pseudocode, true);
    }), { numRuns: 400 });
  });

  it('comparisons match a reference top-down merge sort', () => {
    fc.assert(fc.property(smallInts, (values) => {
      expect(counters(collect(run(values))).comparisons).toBe(referenceComparisons(values));
    }), { numRuns: 300 });
  });

  it('A[lo..hi] is sorted after every merge and the buffer is cleared', () => {
    fc.assert(fc.property(smallInts, (values) => {
      for (const s of collect(run(values)).filter((s) => s.event === 'copy-back')) {
        const { lo, hi } = s.vars as { lo: number; hi: number };
        const run = s.state.items.slice(lo, hi + 1).map((it) => it!.value);
        expect(run).toEqual([...run].sort((a, b) => a - b));
        expect(s.state.extra.aux.every((x) => x === null)).toBe(true);
      }
    }), { numRuns: 200 });
  });

  it('recursion depth is ⌈log2 n⌉', () => {
    const values = Array.from({ length: 16 }, (_, i) => 16 - i);
    const depth = Math.max(...collect(run(values)).map((s) => s.state.extra.stack.length));
    expect(depth - 1).toBe(4);
  });
});
