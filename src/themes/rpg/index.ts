import type { Theme } from '../contract';
import { PixelRenderer } from '../pixel/renderer';
import { pixelFrame } from '../pixel/frame';
import { nesSounds } from './sound-pack';
import css from './style.css?inline';
import { rpgTokens } from './tokens';

const c = rpgTokens.color;

export const rpgTheme: Theme = {
  id: 'rpg',
  name: 'RPG Clásico',
  tokens: rpgTokens,
  css,
  frames: {
    window: pixelFrame(c.border!, c.window!),
    dark: pixelFrame(c.border!, c.bg!),
    button: pixelFrame(c.border!, c.bg!),
    primary: pixelFrame(c.border!, c.accent!),
  },
  createRenderer: () => new PixelRenderer(rpgTokens),
  sounds: nesSounds,
};
