import { mulberry32 } from '../../core/rng';
import { px, sprite, svgUrl } from '../pixel/svg';
import { mdTokens } from './tokens';

const c = mdTokens.color;

export function starField(seed: number, density: number): string {
  const rng = mulberry32(seed);
  const size = 160;
  const body: string[] = [];
  for (let i = 0; i < density; i++) {
    const x = Math.floor(rng() * size);
    const y = Math.floor(rng() * size);
    if (rng() < 0.15) body.push(px(x - 1, y, c.muted!, 3, 1), px(x, y - 1, c.muted!, 1, 3));
    body.push(px(x, y, c.star!));
  }
  return svgUrl(size, size, body.join(''));
}

/** Stepped silhouette from a bounded random walk, tiled horizontally. */
export function mountains(seed: number, color: string, height: number, amp: number): string {
  const rng = mulberry32(seed);
  const w = 320;
  let y = height - amp;
  const body: string[] = [];
  for (let x = 0; x < w; x += 4) {
    y += Math.round((rng() - 0.5) * 6);
    y = Math.max(2, Math.min(height - 4, y));
    body.push(px(x, y, color, 4, height - y));
  }
  return svgUrl(w, height, body.join(''));
}

export const gem = sprite(
  ['..ww..', '.wyyk.', 'wyyyyk', 'yyyyyk', '.yyyk.', '..kk..'],
  { w: c['border-light']!, y: c.accent!, k: c['accent-shade']! },
);
