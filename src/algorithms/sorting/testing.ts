import fc from 'fast-check';
import { expect } from 'vitest';
import type { Pseudocode } from '../../core/types';
import type { SortItem, SortStep } from './types';

export const smallInts = fc.array(fc.integer({ min: 1, max: 99 }), { minLength: 0, maxLength: 24 });
export const manyDuplicates = fc.array(fc.integer({ min: 1, max: 4 }), { minLength: 0, maxLength: 24 });
export const edgeCases: number[][] = [
  [],
  [5],
  [2, 1],
  [1, 2, 3, 4, 5, 6],
  [6, 5, 4, 3, 2, 1],
  [3, 3, 3, 3],
  [7, 3, 9, 2, 10, 1, 6, 3, 8, 4, 9, 5],
];

/** Collects every step and checks that emitted snapshots are never mutated afterwards. */
export function collect<X>(gen: Generator<SortStep<X>>): SortStep<X>[] {
  const steps: SortStep<X>[] = [];
  const frozen: string[] = [];
  for (const s of gen) {
    steps.push(s);
    frozen.push(JSON.stringify(s));
  }
  steps.forEach((s, i) => {
    if (JSON.stringify(s) !== frozen[i]) throw new Error(`step ${i} (${s.event}) was mutated after being emitted`);
  });
  return steps;
}

export function finalItems<X>(steps: SortStep<X>[]): SortItem[] {
  const last = steps.at(-1)!;
  return last.state.items.map((it, i) => {
    if (!it) throw new Error(`final slot ${i} is empty`);
    return it;
  });
}

export function isStable(items: SortItem[]): boolean {
  return items.every((it, i) => i === 0 || items[i - 1]!.value !== it.value || items[i - 1]!.id < it.id);
}

/** Generic contract every sorting visualizer must satisfy. */
export function checkContract<X>(values: number[], steps: SortStep<X>[], pseudocode: Pseudocode, stable: boolean): void {
  const lines = new Set(pseudocode.map((l) => l.id));
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0]!.event).toBe('start');
  expect(steps.at(-1)!.event).toBe('done');
  for (const s of steps) {
    if (s.line !== null) expect(lines, `unknown line ${s.line}`).toContain(s.line);
    expect(s.state.items.length).toBe(values.length);
    expect(s.state.marks.length).toBe(values.length);
    if (s.tone !== undefined) expect(s.tone >= 0 && s.tone <= 1, `tone ${s.tone}`).toBe(true);
  }
  for (let i = 1; i < steps.length; i++) {
    for (const [k, v] of Object.entries(steps[i]!.counters)) {
      expect(v, `counter ${k} decreased at step ${i}`).toBeGreaterThanOrEqual(steps[i - 1]!.counters[k]!);
    }
  }
  const items = finalItems(steps);
  expect(items.map((i) => i.value)).toEqual([...values].sort((a, b) => a - b));
  expect(items.map((i) => i.id).sort((a, b) => a - b)).toEqual(values.map((_, i) => i));
  if (stable) expect(isStable(items), 'stability').toBe(true);
  expect(steps.at(-1)!.state.marks.every((m) => m === 'sorted')).toBe(true);
}

export const counters = <X>(steps: SortStep<X>[]) => steps.at(-1)!.counters;

export function inversions(values: number[]): number {
  let c = 0;
  for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) if (values[i]! > values[j]!) c++;
  return c;
}
