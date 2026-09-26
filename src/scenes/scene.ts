import type { Step } from '../core/types';
import type { StageRenderer } from '../themes/contract';

export interface SceneFrame<S> {
  step: Step<S>;
  prev: Step<S> | undefined;
  /** Eased 0..1 progress of the transition from prev to step. */
  t: number;
  width: number;
  height: number;
}

export interface Scene<S = unknown> {
  /** Logical height in stage pixels; the width follows the container's aspect ratio. */
  readonly logicalHeight: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  draw(r: StageRenderer, f: SceneFrame<S>): void;
}

export const ease = (t: number): number => (t >= 1 ? 1 : 1 - (1 - t) * (1 - t));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
