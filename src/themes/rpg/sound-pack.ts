import type { Cue, SoundPack } from '../../core/sound';

const CPU_HZ = 1_789_773;

/** Snaps a frequency to what the NES pulse channel can actually produce (11-bit timer period). */
const nesHz = (f: number): number => CPU_HZ / (16 * Math.round(CPU_HZ / (16 * f)));

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);

/** C major pentatonic across two octaves: any tone sounds consonant with the others. */
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];
const pitch = (tone: number, shift = 0): number => nesHz(midi(SCALE[Math.round(tone * (SCALE.length - 1))]! + shift));

type Voice = 'p12' | 'p25' | 'p50' | 'tri';

const waves = new WeakMap<AudioContext, Map<Voice, PeriodicWave>>();
let noiseBuffer: AudioBuffer | null = null;

function wave(ctx: AudioContext, voice: Voice): PeriodicWave {
  let map = waves.get(ctx);
  if (!map) waves.set(ctx, (map = new Map()));
  let w = map.get(voice);
  if (!w) {
    const harmonics = 48;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    if (voice === 'tri') {
      // NES triangle is a 4-bit stepped triangle; its odd harmonics fall off as 1/n².
      for (let n = 1; n < harmonics; n += 2) imag[n] = (8 / (Math.PI * Math.PI)) * ((n - 1) / 2 % 2 ? -1 : 1) / (n * n);
    } else {
      const duty = voice === 'p12' ? 0.125 : voice === 'p25' ? 0.25 : 0.5;
      for (let n = 1; n < harmonics; n++) {
        real[n] = Math.sin(2 * Math.PI * n * duty) / (n * Math.PI);
        imag[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (n * Math.PI);
      }
    }
    w = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    map.set(voice, w);
  }
  return w;
}

function noise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const len = ctx.sampleRate;
  noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let lfsr = 1;
  const period = Math.max(1, Math.round(ctx.sampleRate / 22_000));
  for (let i = 0; i < len; i++) {
    if (i % period === 0) {
      const bit = (lfsr ^ (lfsr >> 1)) & 1;
      lfsr = (lfsr >> 1) | (bit << 14);
    }
    data[i] = lfsr & 1 ? 0.6 : -0.6;
  }
  return noiseBuffer;
}

function note(ctx: AudioContext, out: AudioNode, voice: Voice, freq: number, at: number, dur: number, vol: number, slideTo?: number): void {
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(wave(ctx, voice));
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, at + dur);
  const g = ctx.createGain();
  // Stepped envelope, like the APU's 4-bit volume register.
  g.gain.setValueAtTime(vol, at);
  g.gain.setValueAtTime(vol * 0.6, at + dur * 0.5);
  g.gain.setValueAtTime(0, at + dur);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function hiss(ctx: AudioContext, out: AudioNode, at: number, dur: number, vol: number, rate = 1): void {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, at);
  g.gain.setValueAtTime(0, at + dur);
  src.connect(g).connect(out);
  src.start(at, Math.random() * 0.5);
  src.stop(at + dur + 0.02);
}

const seq = (ctx: AudioContext, out: AudioNode, voice: Voice, notes: number[], at: number, step: number, vol: number) =>
  notes.forEach((n, i) => note(ctx, out, voice, nesHz(midi(n)), at + i * step, step * 0.9, vol));

export const nesSounds: SoundPack = {
  id: 'nes',
  play(ctx, out, cue: Cue, tone, at) {
    switch (cue) {
      case 'compare': return note(ctx, out, 'p12', pitch(tone), at, 0.045, 0.5);
      case 'swap':
        note(ctx, out, 'p25', pitch(tone), at, 0.035, 0.55);
        return note(ctx, out, 'p25', pitch(tone, 7), at + 0.035, 0.04, 0.55);
      case 'write': return note(ctx, out, 'tri', pitch(tone, 12), at, 0.06, 0.9);
      case 'select': return note(ctx, out, 'p50', pitch(tone, 12), at, 0.05, 0.4);
      case 'lock': return note(ctx, out, 'tri', pitch(tone, 24), at, 0.09, 0.9);
      case 'visit': return note(ctx, out, 'p25', pitch(tone), at, 0.06, 0.5);
      case 'discover': return note(ctx, out, 'tri', pitch(tone, 12), at, 0.05, 0.8);
      case 'reject': return hiss(ctx, out, at, 0.03, 0.25, 0.6);
      case 'backtrack': return note(ctx, out, 'p12', pitch(tone, 12), at, 0.09, 0.45, pitch(tone));
      case 'phase': return seq(ctx, out, 'p50', [72, 79], at, 0.06, 0.35);
      case 'found': return seq(ctx, out, 'p25', [72, 76, 79, 84], at, 0.07, 0.5);
      case 'complete':
        seq(ctx, out, 'p25', [72, 76, 79, 84, 79, 84, 88], at, 0.1, 0.5);
        seq(ctx, out, 'tri', [48, 55, 60], at, 0.23, 1);
        return;
      case 'error':
        note(ctx, out, 'p50', nesHz(midi(55)), at, 0.12, 0.45, nesHz(midi(43)));
        return hiss(ctx, out, at + 0.12, 0.12, 0.3, 0.3);
      case 'ui-move': return note(ctx, out, 'p12', nesHz(midi(84)), at, 0.025, 0.3);
      case 'ui-select': return seq(ctx, out, 'p25', [79, 91], at, 0.04, 0.4);
      case 'ui-back': return seq(ctx, out, 'p25', [79, 72], at, 0.04, 0.35);
      case 'ui-toggle': return note(ctx, out, 'p50', nesHz(midi(76)), at, 0.04, 0.35);
    }
  },
};
