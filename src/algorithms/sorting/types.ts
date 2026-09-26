import type { Primitive, Step } from '../../core/types';

export interface SortItem {
  /** Original position; identifies equal values to show stability. */
  id: number;
  value: number;
}

export type BarMark =
  | 'compare'
  | 'swap'
  | 'write'
  | 'pivot'
  | 'min'
  | 'max'
  | 'key'
  | 'sorted'
  | 'inactive'
  | 'active';

export interface Pointer {
  label: string;
  index: number;
}

export interface ArrayState<X = unknown> {
  items: readonly (SortItem | null)[];
  marks: readonly (BarMark | null)[];
  pointers: readonly Pointer[];
  range: readonly [number, number] | null;
  extra: X;
}

export type SortStep<X = unknown> = Step<ArrayState<X>>;

export interface SortCounters {
  comparisons: number;
  swaps: number;
  writes: number;
  reads: number;
}

export interface StepOptions {
  marks?: Record<number, BarMark>;
  pointers?: Pointer[];
  range?: readonly [number, number] | null;
  vars?: Record<string, Primitive>;
  params?: Record<string, Primitive>;
  phase?: string;
  tone?: number;
}

export type SortRun<X = unknown, O = Record<string, never>> = (
  values: readonly number[],
  options?: Partial<O>,
) => Generator<SortStep<X>, void, undefined>;
