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

export interface MusicTrack {
  /** Seconds per sequencer step. */
  stepSeconds: number;
  /** Schedules everything that starts on `step` at audio time `at`. */
  schedule(ctx: AudioContext, out: AudioNode, step: number, at: number): void;
}

export interface SoundPack {
  id: string;
  /** Schedules a cue at time `at`; `tone` (0..1) picks the pitch where it applies. */
  play(ctx: AudioContext, out: AudioNode, cue: Cue, tone: number, at: number): void;
  /** Optional procedural background music. */
  music?: () => MusicTrack;
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
  private musicGain: GainNode | null = null;
  private track: MusicTrack | null = null;
  private timer = 0;
  private nextStep = 0;
  private nextAt = 0;

  constructor() {
    settings.on('change', () => {
      this.applyVolume();
      this.syncMusic();
    });
  }

  get hasMusic(): boolean {
    return !!this.pack?.music;
  }

  use(pack: SoundPack): void {
    if (this.pack?.id === pack.id) return;
    this.stopMusic();
    this.pack = pack;
    this.syncMusic();
  }

  /** Must run inside a user gesture on the first call (browser autoplay policy). */
  unlock(): void {
    if (typeof AudioContext === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.3;
      this.musicGain.connect(this.master);
      this.applyVolume();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.syncMusic();
  }

  private syncMusic(): void {
    const want = settings.get().music && !settings.get().muted && !!this.pack?.music && !!this.ctx;
    if (want && !this.track) this.startMusic();
    else if (!want && this.track) this.stopMusic();
  }

  private startMusic(): void {
    if (!this.ctx || !this.musicGain || !this.pack?.music) return;
    this.track = this.pack.music();
    this.nextStep = 0;
    this.nextAt = this.ctx.currentTime + 0.1;
    const tick = () => {
      if (!this.ctx || !this.track || !this.musicGain) return;
      while (this.nextAt < this.ctx.currentTime + 0.25) {
        this.track.schedule(this.ctx, this.musicGain, this.nextStep++, this.nextAt);
        this.nextAt += this.track.stepSeconds;
      }
    };
    tick();
    this.timer = window.setInterval(tick, 100);
  }

  private stopMusic(): void {
    clearInterval(this.timer);
    this.track = null;
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
