import { settings } from './settings';

export type Cue =
  | 'compare'
  | 'swap'
  | 'write'
  | 'select'
  | 'lock'
  | 'visit'
  | 'discover'
  | 'reject'
  | 'backtrack'
  | 'phase'
  | 'found'
  | 'complete'
  | 'error'
  | 'ui-move'
  | 'ui-select'
  | 'ui-back'
  | 'ui-toggle';

export interface SoundPack {
  id: string;
  /** Schedules a cue at time `at`; `tone` (0..1) picks the pitch where it applies. */
  play(ctx: AudioContext, out: AudioNode, cue: Cue, tone: number, at: number): void;
}

/** Default mapping from semantic step events to cues; algorithms may override per event. */
export const EVENT_CUES: Record<string, Cue | null> = {
  start: null,
  compare: 'compare',
  swap: 'swap',
  write: 'write',
  shift: 'write',
  'write-aux': 'write',
  'copy-back': 'phase',
  scatter: 'write',
  count: 'compare',
  prefix: 'compare',
  select: 'select',
  pivot: 'select',
  pick: 'select',
  heapify: 'select',
  lock: 'lock',
  insert: 'lock',
  place: 'lock',
  'early-exit': 'phase',
  pass: 'phase',
  layer: 'phase',
  bucket: 'phase',
  split: 'phase',
  'merge-start': 'phase',
  'heap-built': 'phase',
  range: 'phase',
  init: null,
  visit: 'visit',
  descend: 'visit',
  try: 'visit',
  resume: null,
  discover: 'discover',
  relax: 'discover',
  meet: 'found',
  skip: 'reject',
  reject: 'reject',
  stale: 'reject',
  backtrack: 'backtrack',
  converged: 'phase',
  detect: 'phase',
  verify: 'reject',
  found: 'found',
  cycle: 'error',
  fail: 'error',
  done: 'complete',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pack: SoundPack | null = null;
  private lastAt = 0;

  constructor() {
    settings.on('change', () => this.applyVolume());
  }

  use(pack: SoundPack): void {
    this.pack = pack;
  }

  /** Must run inside a user gesture on the first call (browser autoplay policy). */
  unlock(): void {
    if (typeof AudioContext === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyVolume();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  play(cue: Cue | null | undefined, tone = 0.5): void {
    if (!cue || !this.ctx || !this.master || !this.pack || settings.get().muted) return;
    const now = this.ctx.currentTime;
    // Rate-limit dense cues at high speed so audio stays readable instead of a buzz.
    if (!cue.startsWith('ui') && cue !== 'complete' && cue !== 'found' && now - this.lastAt < 0.035) return;
    this.lastAt = now;
    this.pack.play(this.ctx, this.master, cue, Math.min(1, Math.max(0, tone)), now + 0.005);
  }

  forEvent(event: string, tone?: number, overrides?: Partial<Record<string, Cue | null>>): void {
    const cue = overrides && event in overrides ? overrides[event] : EVENT_CUES[event];
    this.play(cue, tone);
  }

  private applyVolume(): void {
    if (!this.master || !this.ctx) return;
    const { volume, muted } = settings.get();
    this.master.gain.setTargetAtTime(muted ? 0 : volume * 0.35, this.ctx.currentTime, 0.01);
  }
}

export const sound = new SoundEngine();
