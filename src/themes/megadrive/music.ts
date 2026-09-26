import { mulberry32 } from '../../core/rng';
import type { MusicTrack } from '../../core/sound';
import { PATCHES, fm, noise } from './sound-pack';

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);

/** i–VI–III–VII in A minor: the quintessential late-80s progression. */
const CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [60, 64, 67],
  [55, 59, 62],
];

/** Composes a fresh 8-bar AABA-ish melody from chord tones, then loops it with bass, arps and drums. */
export function megaDriveMusic(seed = Date.now()): MusicTrack {
  const rng = mulberry32(seed);
  const phrase = (chord: number[]) =>
    Array.from({ length: 8 }, (_, i) => (i % 2 === 1 && rng() < 0.35 ? null : chord[Math.floor(rng() * 3)]! + 12 + (rng() < 0.25 ? 12 : 0)));
  const a = CHORDS.map(phrase);
  const b = CHORDS.map(phrase);
  const melody = [...a, ...b];
  const bpm = 112;
  const sixteenth = 60 / bpm / 4;

  return {
    schedule(ctx, out, step, at) {
      const bar = Math.floor(step / 16) % 8;
      const s = step % 16;
      const chord = CHORDS[bar % 4]!;
      if (s % 2 === 0) fm(ctx, out, PATCHES.bass, midi(chord[0]! - 12 + (s % 4 === 2 ? 12 : 0)), at, sixteenth * 1.8);
      fm(ctx, out, { ...PATCHES.epiano, gain: 0.08 }, midi(chord[s % 3]! + 12), at, sixteenth * 1.5);
      if (s % 2 === 0) {
        const note = melody[bar]![s / 2];
        if (note) fm(ctx, out, { ...PATCHES.bell, gain: 0.16 }, midi(note), at, sixteenth * 3.5);
      }
      if (s === 0 || s === 8) fm(ctx, out, { ...PATCHES.slap, gain: 0.45 }, 110, at, 0.12, 40);
      if (s === 4 || s === 12) noise(ctx, out, at, 0.14, 0.18, 0.8);
      if (s % 2 === 1) noise(ctx, out, at, 0.03, 0.05, 2);
    },
    stepSeconds: sixteenth,
  };
}
