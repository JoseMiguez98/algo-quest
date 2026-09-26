import type { Theme } from '../contract';
import { NesRenderer } from './renderer';
import { nesSounds } from './sound-pack';
import css from './style.css?inline';
import { nesTokens } from './tokens';

/** 12×12 pixel frame with notched corners, used as a 9-slice border-image. */
function frame(border: string, fill: string, notch = true): string {
  const px: string[] = [];
  const on = (x: number, y: number, c: string) => px.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`);
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      const edge = Math.min(x, y, 11 - x, 11 - y);
      const corner = Math.min(x, 11 - x) + Math.min(y, 11 - y);
      if (notch && corner < 2) continue;
      on(x, y, edge < 1 || (notch && corner === 2) ? border : fill);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" shape-rendering="crispEdges">${px.join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const c = nesTokens.color;

export const nesTheme: Theme = {
  id: 'nes',
  name: 'NES 8-bit',
  tokens: nesTokens,
  css,
  frames: {
    window: frame(c.border!, c.window!),
    dark: frame(c.border!, c.bg!),
    button: frame(c.border!, c.bg!),
    primary: frame(c.border!, c.accent!),
  },
  createRenderer: () => new NesRenderer(nesTokens),
  sounds: nesSounds,
};
