import type { Cue, SoundPack } from '../../core/sound';

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];
const pitch = (tone: number, shift = 0) => midi(SCALE[Math.round(tone * (SCALE.length - 1))]! + shift);

/** Soft sine "UI" tones: short attack, exponential decay. */
function tone(ctx: AudioContext, out: AudioNode, f: number, at: number, dur: number, vol: number, type: OscillatorType = 'sine'): void {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, at);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.02);
}

const chord = (ctx: AudioContext, out: AudioNode, notes: number[], at: number, step: number, dur: number, vol: number) =>
  notes.forEach((n, i) => tone(ctx, out, midi(n), at + i * step, dur, vol));

export const modernSounds: SoundPack = {
  id: 'modern',
  play(ctx, out, cue: Cue, t, at) {
    switch (cue) {
      case 'compare': return tone(ctx, out, pitch(t, 12), at, 0.06, 0.12);
      case 'swap': return tone(ctx, out, pitch(t, 12), at, 0.09, 0.16, 'triangle');
      case 'write': return tone(ctx, out, pitch(t), at, 0.1, 0.16, 'triangle');
      case 'select': return tone(ctx, out, pitch(t, 19), at, 0.08, 0.12);
      case 'lock': return tone(ctx, out, pitch(t, 24), at, 0.16, 0.14);
      case 'visit': return tone(ctx, out, pitch(t, 12), at, 0.08, 0.14);
      case 'discover': return tone(ctx, out, pitch(t, 19), at, 0.06, 0.1);
      case 'reject': return tone(ctx, out, 180, at, 0.05, 0.06, 'triangle');
      case 'backtrack': return tone(ctx, out, pitch(t, 7), at, 0.1, 0.12);
      case 'phase': return chord(ctx, out, [72, 79], at, 0.05, 0.14, 0.1);
      case 'found': return chord(ctx, out, [72, 76, 79, 84], at, 0.07, 0.25, 0.12);
      case 'complete': return chord(ctx, out, [72, 76, 79, 84, 88], at, 0.08, 0.5, 0.12);
      case 'error': return chord(ctx, out, [60, 56], at, 0.1, 0.2, 0.12);
      case 'ui-move': return tone(ctx, out, midi(88), at, 0.03, 0.05);
      case 'ui-select': return chord(ctx, out, [79, 86], at, 0.04, 0.08, 0.08);
      case 'ui-back': return chord(ctx, out, [79, 74], at, 0.04, 0.08, 0.08);
      case 'ui-toggle': return tone(ctx, out, midi(84), at, 0.04, 0.07);
    }
  },
};
