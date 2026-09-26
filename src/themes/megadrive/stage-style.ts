import { mulberry32 } from '../../core/rng';
import type { PixelRenderer, PixelStyle } from '../pixel/renderer';

const SKY = ['sky-0', 'sky-1', 'sky-2', 'sky-3', 'sky-4', 'sky-5', 'sky-6'];

/** Horizontal color bands with a dithered seam between them, like raster (HDMA-style) sky effects. */
function sky(r: PixelRenderer, w: number, h: number): void {
  const band = Math.ceil(h / SKY.length / 1.6);
  let y = 0;
  SKY.forEach((key, i) => {
    const bh = i === 0 ? h - band * (SKY.length - 1) : band;
    r.rect(0, y, w, bh, r.c(key));
    if (i > 0) {
      const prev = r.c(SKY[i - 1]!);
      for (let x = 0; x < w; x += 2) r.rect(x + (y % 2), y, 1, 1, prev);
    }
    y += bh;
  });
}

function stars(r: PixelRenderer, w: number, h: number): void {
  const rng = mulberry32(42);
  const color = r.c('star');
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = Math.floor(rng() * w);
    const y = Math.floor(rng() * h * 0.5);
    r.rect(x, y, 1, 1, color);
    if (rng() < 0.12) {
      r.rect(x - 1, y, 3, 1, r.c('muted'));
      r.rect(x, y - 1, 1, 3, r.c('muted'));
      r.rect(x, y, 1, 1, color);
    }
  }
}

function mountains(r: PixelRenderer, w: number, h: number, seed: number, key: string, base: number, amp: number): void {
  const rng = mulberry32(seed);
  let y = base;
  for (let x = 0; x < w; x += 2) {
    y += Math.round((rng() - 0.5) * 3);
    y = Math.max(base - amp, Math.min(base + amp / 3, y));
    r.rect(x, y, 2, h - y, r.c(key));
  }
}

export const mdStageStyle: PixelStyle = {
  outline: '#000000',
  groundHeight: 12,
  backdrop(r, w, h) {
    sky(r, w, h);
    stars(r, w, h);
    mountains(r, w, h, 7, 'mountain-far', Math.round(h * 0.7), 14);
    mountains(r, w, h, 11, 'mountain', Math.round(h * 0.8), 9);
  },
  ground(r, x, y, w) {
    r.rect(x - 2, y, w + 4, 2, r.c('grass-light'));
    r.rect(x - 2, y + 2, w + 4, 2, r.c('grass'));
    const size = 4;
    for (let gx = 0; gx < w + 4; gx += size) {
      for (let gy = 0; gy < 8; gy += size) {
        r.rect(x - 2 + gx, y + 4 + gy, size, size, r.c((gx / size + gy / size) % 2 ? 'ground-b' : 'ground-a'));
      }
    }
  },
};
