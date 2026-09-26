import type { Theme } from '../contract';
import { VectorRenderer } from './renderer';
import { modernSounds } from './sound-pack';
import css from './style.css?inline';
import { modernTokens } from './tokens';

export const modernTheme: Theme = {
  id: 'modern',
  name: 'Moderno',
  tokens: modernTokens,
  css,
  createRenderer: () => new VectorRenderer(modernTokens),
  sounds: modernSounds,
};
