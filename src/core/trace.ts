import type { Step } from './types';

export const MAX_STEPS = 50_000;

export function record<S>(gen: Iterable<Step<S>>): Step<S>[] {
  const steps: Step<S>[] = [];
  for (const s of gen) {
    steps.push(s);
    if (steps.length > MAX_STEPS) throw new RangeError(`trace exceeds ${MAX_STEPS} steps; use a smaller input`);
  }
  return steps;
}

export interface PhaseMarker {
  index: number;
  phase: string;
}

export function phases<S>(steps: readonly Step<S>[]): PhaseMarker[] {
  return steps.flatMap((s, index) => (s.phase ? [{ index, phase: s.phase }] : []));
}
