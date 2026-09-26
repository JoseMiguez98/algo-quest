import { Emitter } from './emitter';
import type { Step } from './types';

export const SPEEDS = [0.25, 0.5, 1, 2, 4, 8] as const;
export type Speed = (typeof SPEEDS)[number];

/** Milliseconds a step stays on screen at 1×. */
export const BASE_STEP_MS = 520;

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'ended';

interface PlayerEvents {
  step: { index: number; direction: 1 | -1 | 0 };
  status: PlayerStatus;
  speed: Speed;
  frame: { progress: number };
  [key: string]: unknown;
}

export interface PlayerOptions {
  /** Relative dwell per event name, e.g. { done: 3, skip: 0.5 }. */
  durations?: Partial<Record<string, number>>;
  speed?: Speed;
}

/**
 * Plays a precomputed trace. Because every step is a full snapshot,
 * seeking backwards is as cheap as seeking forwards.
 */
export class Player<S = unknown> extends Emitter<PlayerEvents> {
  private steps: readonly Step<S>[] = [];
  private _index = 0;
  private _status: PlayerStatus = 'idle';
  private _speed: Speed;
  private elapsed = 0;
  private last = 0;
  private raf = 0;
  private readonly durations: Partial<Record<string, number>>;

  constructor(options: PlayerOptions = {}) {
    super();
    this._speed = options.speed ?? 1;
    this.durations = options.durations ?? {};
  }

  get index(): number { return this._index; }
  get status(): PlayerStatus { return this._status; }
  get speed(): Speed { return this._speed; }
  get length(): number { return this.steps.length; }
  get current(): Step<S> | undefined { return this.steps[this._index]; }
  get previous(): Step<S> | undefined { return this.steps[this._index - 1]; }
  get atEnd(): boolean { return this._index >= this.steps.length - 1; }
  stepAt(i: number): Step<S> | undefined { return this.steps[i]; }

  /** Progress (0..1) of the transition into the current step. */
  get progress(): number {
    return Math.min(1, this.elapsed / Math.min(this.dwell(), 220 / this._speed));
  }

  load(steps: readonly Step<S>[]): void {
    this.stopLoop();
    this.steps = steps;
    this._index = 0;
    this.elapsed = Infinity;
    this.setStatus('idle');
    this.emit('step', { index: 0, direction: 0 });
  }

  play(): void {
    if (!this.steps.length) return;
    if (this.atEnd) this.seek(0);
    this.setStatus('playing');
    this.last = performance.now();
    this.loop();
  }

  pause(): void {
    if (this._status !== 'playing') return;
    this.stopLoop();
    this.setStatus('paused');
  }

  toggle(): void {
    if (this._status === 'playing') this.pause();
    else this.play();
  }

  stepForward(): void {
    this.pauseForManualStep();
    this.go(this._index + 1, 1);
  }

  stepBack(): void {
    this.pauseForManualStep();
    this.go(this._index - 1, -1);
  }

  seek(index: number): void {
    const target = Math.max(0, Math.min(this.steps.length - 1, index));
    this.go(target, target > this._index ? 1 : target < this._index ? -1 : 0, true);
  }

  reset(): void {
    this.stopLoop();
    this.go(0, 0, true);
    this.setStatus('idle');
  }

  setSpeed(speed: Speed): void {
    this._speed = speed;
    this.emit('speed', speed);
  }

  faster(): void {
    this.setSpeed(SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(this._speed) + 1)]!);
  }

  slower(): void {
    this.setSpeed(SPEEDS[Math.max(0, SPEEDS.indexOf(this._speed) - 1)]!);
  }

  destroy(): void {
    this.stopLoop();
  }

  private pauseForManualStep(): void {
    if (this._status === 'playing') {
      this.stopLoop();
      this.setStatus('paused');
    } else if (this._status === 'idle' || this._status === 'ended') {
      this.setStatus('paused');
    }
  }

  private go(index: number, direction: 1 | -1 | 0, instant = false): void {
    if (index < 0 || index >= this.steps.length) return;
    this._index = index;
    this.elapsed = instant || direction === -1 ? Infinity : 0;
    this.emit('step', { index, direction });
    if (this.atEnd && this._status !== 'idle') {
      this.stopLoop();
      this.setStatus('ended');
    }
  }

  private dwell(): number {
    const ev = this.current?.event ?? '';
    return (BASE_STEP_MS * (this.durations[ev] ?? 1)) / this._speed;
  }

  private loop = (): void => {
    this.raf = requestAnimationFrame((now) => {
      const dt = Math.min(100, now - this.last);
      this.last = now;
      this.elapsed = (this.elapsed === Infinity ? this.dwell() : this.elapsed) + dt;
      this.emit('frame', { progress: this.progress });
      if (this.elapsed >= this.dwell()) this.go(this._index + 1, 1);
      if (this._status === 'playing') this.loop();
    });
  };

  private stopLoop(): void {
    cancelAnimationFrame(this.raf);
  }

  private setStatus(status: PlayerStatus): void {
    if (status === this._status) return;
    this._status = status;
    this.emit('status', status);
  }
}
