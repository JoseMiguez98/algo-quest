import type { ArrayState, SortCounters, SortItem, SortStep, StepOptions } from './types';

/**
 * Owns the array under sort and the operation counters. Algorithms mutate data only
 * through it so counters stay honest and every snapshot is consistent.
 */
export class SortRecorder<X> {
  readonly items: (SortItem | null)[];
  readonly counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0, reads: 0 };
  readonly sorted = new Set<number>();
  range: readonly [number, number] | null = null;
  private readonly min: number;
  private readonly max: number;

  constructor(
    values: readonly number[],
    public extra: X,
  ) {
    this.items = values.map((value, id) => ({ id, value }));
    this.min = values.length ? Math.min(...values) : 0;
    this.max = values.length ? Math.max(...values) : 0;
  }

  get length(): number {
    return this.items.length;
  }

  item(i: number): SortItem {
    const it = this.items[i];
    if (!it) throw new Error(`empty slot ${i}`);
    return it;
  }

  value(i: number): number {
    return this.item(i).value;
  }

  /** Counts one comparison; returns a - b. */
  compareValues(a: number, b: number): number {
    this.counters.comparisons++;
    return a - b;
  }

  compare(i: number, j: number): number {
    return this.compareValues(this.value(i), this.value(j));
  }

  swap(i: number, j: number): void {
    if (i === j) return;
    const a = this.items[i]!;
    this.items[i] = this.items[j]!;
    this.items[j] = a;
    this.counters.swaps++;
    this.counters.writes += 2;
  }

  write(i: number, item: SortItem | null): void {
    this.items[i] = item;
    if (item) this.counters.writes++;
  }

  read(): void {
    this.counters.reads++;
  }

  tone(value: number): number {
    return this.max === this.min ? 0.5 : (value - this.min) / (this.max - this.min);
  }

  lockAll(): void {
    for (let i = 0; i < this.items.length; i++) this.sorted.add(i);
  }

  step(event: string, line: string | null, narration: string, o: StepOptions = {}): SortStep<X> {
    const marks: ArrayState['marks'][number][] = this.items.map((_, i) =>
      this.sorted.has(i) ? 'sorted' : null,
    );
    for (const [k, m] of Object.entries(o.marks ?? {})) marks[Number(k)] = m;
    const state: ArrayState<X> = {
      items: this.items.slice(),
      marks,
      pointers: o.pointers ?? [],
      range: o.range === undefined ? this.range : o.range,
      extra: structuredClone(this.extra),
    };
    return {
      event,
      line,
      state,
      vars: o.vars ?? {},
      counters: { ...this.counters },
      narration: { key: narration, params: o.params },
      phase: o.phase,
      tone: o.tone,
    };
  }
}

export function finalValues(steps: readonly SortStep[]): number[] {
  const last = steps[steps.length - 1];
  if (!last) return [];
  return last.state.items.map((it) => {
    if (!it) throw new Error('final state has empty slots');
    return it.value;
  });
}
