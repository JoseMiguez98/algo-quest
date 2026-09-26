import type { Cue, SoundPack } from '../../core/sound';

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);
/** A minor pentatonic: bright but with the moody edge of late-80s soundtracks. */
const SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81];
const pitch = (tone: number, shift = 0) => midi(SCALE[Math.round(tone * (SCALE.length - 1))]! + shift);

export interface FmPatch {
  /** Modulator frequency as a multiple of the carrier (YM2612 MUL). */
  ratio: number;
  /** Modulation depth in Hz per Hz of carrier: brightness of the tone. */
  index: number;
  attack: number;
  decay: number;
  /** How fast the modulation (timbre) decays; lower = more "clang" at the start only. */
  indexDecay: number;
  gain: number;
  feedback?: number;
}

export const PATCHES = {
  bell: { ratio: 3.5, index: 2.2, attack: 0.002, decay: 0.5, indexDecay: 0.25, gain: 0.35 },
  slap: { ratio: 1, index: 4, attack: 0.002, decay: 0.16, indexDecay: 0.05, gain: 0.5 },
  epiano: { ratio: 1, index: 1.2, attack: 0.004, decay: 0.3, indexDecay: 0.2, gain: 0.3 },
  brass: { ratio: 1, index: 3, attack: 0.03, decay: 0.35, indexDecay: 0.3, gain: 0.26 },
  pluck: { ratio: 2, index: 2.5, attack: 0.002, decay: 0.12, indexDecay: 0.06, gain: 0.35 },
  bass: { ratio: 0.5, index: 3.5, attack: 0.003, decay: 0.22, indexDecay: 0.12, gain: 0.5 },
} satisfies Record<string, FmPatch>;

/** Two-operator FM voice: modulator → carrier frequency, both with their own envelopes. */
export function fm(ctx: AudioContext, out: AudioNode, p: FmPatch, freq: number, at: number, dur = p.decay, slideTo?: number): void {
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const amp = ctx.createGain();
  car.frequency.setValueAtTime(freq, at);
  mod.frequency.setValueAtTime(freq * p.ratio, at);
  if (slideTo) {
    car.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    mod.frequency.exponentialRampToValueAtTime(slideTo * p.ratio, at + dur);
  }
  modGain.gain.setValueAtTime(freq * p.index, at);
  modGain.gain.exponentialRampToValueAtTime(Math.max(1, freq * p.index * 0.08), at + p.indexDecay);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(p.gain, at + p.attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  mod.connect(modGain).connect(car.frequency);
  car.connect(amp).connect(out);
  mod.start(at);
  car.start(at);
  mod.stop(at + dur + 0.05);
  car.stop(at + dur + 0.05);
}

/** SN76489-style PSG square (fixed 50% duty) with a stepped 4-bit volume envelope. */
export function psg(ctx: AudioContext, out: AudioNode, freq: number, at: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, at);
  const g = ctx.createGain();
  const steps = 4;
  for (let i = 0; i < steps; i++) g.gain.setValueAtTime(vol * (1 - i / steps), at + (dur * i) / steps);
  g.gain.setValueAtTime(0, at + dur);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

let noiseBuf: AudioBuffer | null = null;

/** PSG white noise from a 16-bit LFSR with the SN76489 tap pattern. */
export function noise(ctx: AudioContext, out: AudioNode, at: number, dur: number, vol: number, rate = 1): void {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let lfsr = 0x8000;
    for (let i = 0; i < d.length; i++) {
      if (i % 3 === 0) {
        const bit = (lfsr ^ (lfsr >> 3)) & 1;
        lfsr = (lfsr >> 1) | (bit << 15);
      }
      d[i] = lfsr & 1 ? 0.5 : -0.5;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(g).connect(out);
  src.start(at);
  src.stop(at + dur + 0.02);
}

const arp = (ctx: AudioContext, out: AudioNode, p: FmPatch, notes: number[], at: number, step: number, dur?: number) =>
  notes.forEach((n, i) => fm(ctx, out, p, midi(n), at + i * step, dur));

export const megaDriveSounds: SoundPack = {
  id: 'megadrive',
  play(ctx, out, cue: Cue, tone, at) {
    switch (cue) {
      case 'compare': return psg(ctx, out, pitch(tone, 12), at, 0.04, 0.12);
      case 'swap':
        fm(ctx, out, PATCHES.pluck, pitch(tone), at, 0.1);
        return fm(ctx, out, PATCHES.pluck, pitch(tone, 7), at + 0.045, 0.1);
      case 'write': return fm(ctx, out, PATCHES.slap, pitch(tone, -12), at, 0.14);
      case 'select': return fm(ctx, out, PATCHES.epiano, pitch(tone, 12), at, 0.2);
      case 'lock': return fm(ctx, out, PATCHES.bell, pitch(tone, 12), at, 0.45);
      case 'visit': return fm(ctx, out, PATCHES.pluck, pitch(tone, 12), at, 0.12);
      case 'discover': return psg(ctx, out, pitch(tone, 24), at, 0.05, 0.1);
      case 'reject': return noise(ctx, out, at, 0.05, 0.12, 1.5);
      case 'backtrack': return fm(ctx, out, PATCHES.epiano, pitch(tone, 12), at, 0.16, pitch(tone));
      case 'phase':
        fm(ctx, out, PATCHES.brass, midi(69), at, 0.22);
        return fm(ctx, out, PATCHES.brass, midi(76), at, 0.22);
      case 'found': return arp(ctx, out, PATCHES.bell, [69, 72, 76, 81], at, 0.07, 0.5);
      case 'complete':
        [57, 64, 69, 72].forEach((n) => fm(ctx, out, PATCHES.brass, midi(n), at, 0.28));
        arp(ctx, out, PATCHES.bell, [76, 79, 81, 84, 88], at + 0.3, 0.09, 0.6);
        [57, 57, 64, 69].forEach((n, i) => fm(ctx, out, PATCHES.bass, midi(n - 12), at + 0.3 + i * 0.18, 0.2));
        [72, 76, 81].forEach((n) => fm(ctx, out, PATCHES.brass, midi(n), at + 1.05, 0.7));
        return;
      case 'error':
        fm(ctx, out, { ...PATCHES.brass, index: 6, ratio: 1.01 }, midi(45), at, 0.4, midi(40));
        return noise(ctx, out, at, 0.25, 0.15, 0.5);
      case 'ui-move': return psg(ctx, out, midi(96), at, 0.02, 0.08);
      case 'ui-select':
        fm(ctx, out, PATCHES.bell, midi(88), at, 0.18);
        return fm(ctx, out, PATCHES.bell, midi(95), at + 0.06, 0.3);
      case 'ui-back': return fm(ctx, out, PATCHES.epiano, midi(76), at, 0.12, midi(69));
      case 'ui-toggle': return psg(ctx, out, midi(84), at, 0.03, 0.1);
    }
  },
};
