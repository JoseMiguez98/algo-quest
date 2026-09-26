import type { StageRenderer, TextOptions, ThemeTokens, VisualState } from '../contract';
import { ADVANCE, GLYPH_H, GLYPH_W, glyph, textWidth } from './bitmap-font';

const hex = (c: string): [number, number, number] => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (c: string, to: string, t: number): string => {
  const [a, b] = [hex(c), hex(to)];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * t)).join(',')})`;
};

/**
 * Draws into a low-resolution offscreen canvas and presents it with nearest-neighbour
 * integer scaling, so every logical pixel is a crisp square.
 */
export class NesRenderer implements StageRenderer {
  readonly lineHeight = GLYPH_H + 3;
  private readonly off = document.createElement('canvas');
  private readonly g = this.off.getContext('2d')!;
  private readonly glyphs = new Map<string, HTMLCanvasElement>();
  private w = 0;
  private h = 0;

  constructor(private readonly tokens: ThemeTokens) {}

  private c(key: string): string {
    return this.tokens.color[key] ?? '#FF00FF';
  }

  color(state: VisualState): string {
    return this.tokens.state[state];
  }

  begin(width: number, height: number): void {
    if (this.off.width !== width || this.off.height !== height) {
      this.off.width = width;
      this.off.height = height;
    }
    this.w = width;
    this.h = height;
    this.g.imageSmoothingEnabled = false;
    this.rect(0, 0, width, height, this.c('stage'));
  }

  present(target: HTMLCanvasElement): void {
    const t = target.getContext('2d')!;
    t.imageSmoothingEnabled = false;
    const scale = Math.max(1, Math.floor(Math.min(target.width / this.w, target.height / this.h)));
    const dw = this.w * scale;
    const dh = this.h * scale;
    t.fillStyle = this.c('stage');
    t.fillRect(0, 0, target.width, target.height);
    t.drawImage(this.off, Math.floor((target.width - dw) / 2), Math.floor((target.height - dh) / 2), dw, dh);
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    if (w <= 0 || h <= 0) return;
    this.g.fillStyle = color;
    this.g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  private px(x: number, y: number): void {
    this.g.fillRect(x, y, 1, 1);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, dashed = false, thick = 1): void {
    this.g.fillStyle = color;
    let [x, y] = [Math.round(x1), Math.round(y1)];
    const [ex, ey] = [Math.round(x2), Math.round(y2)];
    const dx = Math.abs(ex - x);
    const dy = -Math.abs(ey - y);
    const sx = x < ex ? 1 : -1;
    const sy = y < ey ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; ; i++) {
      if (!dashed || i % 4 < 2) {
        this.px(x, y);
        if (thick > 1) (dx > -dy ? this.px(x, y + 1) : this.px(x + 1, y));
      }
      if (x === ex && y === ey) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  }

  measure(s: string, scale = 1): number {
    return textWidth(s, scale);
  }

  private glyphCanvas(ch: string, color: string): HTMLCanvasElement {
    const key = `${color}|${ch}`;
    let cv = this.glyphs.get(key);
    if (!cv) {
      cv = document.createElement('canvas');
      cv.width = GLYPH_W;
      cv.height = GLYPH_H;
      const gc = cv.getContext('2d')!;
      gc.fillStyle = color;
      const bits = glyph(ch);
      for (let i = 0; i < bits.length; i++) if (bits[i]) gc.fillRect(i % GLYPH_W, Math.floor(i / GLYPH_W), 1, 1);
      this.glyphs.set(key, cv);
    }
    return cv;
  }

  text(s: string, x: number, y: number, o: TextOptions = {}): void {
    const scale = o.scale ?? 1;
    const color = o.color ?? this.c(o.tone === 'muted' ? 'muted' : o.tone === 'accent' ? 'accent' : o.tone === 'inverse' ? 'bg' : 'text');
    const w = textWidth(s, scale);
    let cx = Math.round(o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x);
    const cy = Math.round(y);
    for (const ch of s) {
      if (ch !== ' ') this.g.drawImage(this.glyphCanvas(ch, color), cx, cy, GLYPH_W * scale, GLYPH_H * scale);
      cx += ADVANCE * scale;
    }
  }

  bar(x: number, y: number, w: number, h: number, state: VisualState, o: { ghost?: boolean } = {}): void {
    const base = this.color(state);
    [x, y, w, h] = [Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))];
    if (o.ghost) {
      this.frame(x, y, w, h, mix(base, '#000000', 0.45), true);
      return;
    }
    this.rect(x, y, w, h, base);
    if (w >= 3 && h >= 2) {
      this.rect(x, y, w, 1, mix(base, '#FFFFFF', 0.45));
      this.rect(x, y + 1, 1, h - 1, mix(base, '#FFFFFF', 0.2));
      this.rect(x + w - 1, y + 1, 1, h - 1, mix(base, '#000000', 0.35));
    }
  }

  private frame(x: number, y: number, w: number, h: number, color: string, dashed = false): void {
    this.line(x, y, x + w - 1, y, color, dashed);
    this.line(x, y + h - 1, x + w - 1, y + h - 1, color, dashed);
    this.line(x, y, x, y + h - 1, color, dashed);
    this.line(x + w - 1, y, x + w - 1, y + h - 1, color, dashed);
  }

  slot(x: number, y: number, w: number, h: number, o: { active?: boolean } = {}): void {
    this.frame(Math.round(x), Math.round(y), Math.round(w), Math.round(h), o.active ? this.c('accent') : this.c('dim'), true);
  }

  private disc(cx: number, cy: number, r: number, color: string): void {
    this.g.fillStyle = color;
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
      this.g.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
    }
  }

  node(cx: number, cy: number, r: number, state: VisualState, label: string, o: { ring?: 'start' | 'target' | null } = {}): void {
    [cx, cy, r] = [Math.round(cx), Math.round(cy), Math.round(r)];
    if (o.ring) this.disc(cx, cy, r + 2, o.ring === 'start' ? this.c('border') : this.c('accent'));
    this.disc(cx, cy, r + 1, this.c('bg'));
    const fill = state === 'default' ? this.c('window') : this.color(state);
    this.disc(cx, cy, r, state === 'default' ? this.c('muted') : mix(fill, '#000000', 0.3));
    this.disc(cx, cy, r - 1, fill);
    this.g.fillStyle = mix(fill, '#FFFFFF', 0.5);
    this.g.fillRect(cx - Math.floor(r / 2), cy - r + 1, 2, 1);
    const dark = state !== 'default' && state !== 'dead' && state !== 'visited-b' && state !== 'pivot';
    this.text(label, cx + 1, cy - 3, { align: 'center', color: dark ? this.c('bg') : this.c('text') });
  }

  edge(x1: number, y1: number, x2: number, y2: number, state: VisualState, o: { directed?: boolean; trim?: number; weight?: string; bend?: number } = {}): void {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
    const trim = o.trim ?? 0;
    const bend = o.bend ?? 0;
    const [nx, ny] = [-uy * bend, ux * bend];
    const a = [x1 + ux * trim + nx, y1 + uy * trim + ny] as const;
    const b = [x2 - ux * trim + nx, y2 - uy * trim + ny] as const;
    const color = state === 'default' ? this.c('dim') : this.color(state);
    const thick = state === 'path' || state === 'active' || state === 'relaxed' || state === 'cycle' ? 2 : 1;
    this.line(a[0], a[1], b[0], b[1], color, state === 'rejected', thick);
    if (o.directed) {
      const [tx, ty] = [b[0], b[1]];
      for (let i = 1; i <= 4; i++) {
        const bx = tx - ux * i;
        const by = ty - uy * i;
        this.line(bx - uy * i * 0.7, by + ux * i * 0.7, bx + uy * i * 0.7, by - ux * i * 0.7, color);
      }
    }
    if (o.weight !== undefined) {
      const mx = (a[0] + b[0]) / 2 + nx * 0.5;
      const my = (a[1] + b[1]) / 2 + ny * 0.5;
      const w = textWidth(o.weight) + 3;
      this.rect(mx - w / 2, my - 5, w, 9, this.c('bg'));
      this.text(o.weight, mx + 0.5, my - 4, { align: 'center', color: state === 'default' ? this.c('muted') : color });
    }
  }

  cell(x: number, y: number, size: number, state: VisualState | 'wall' | 'open', label?: string): void {
    [x, y, size] = [Math.round(x), Math.round(y), Math.round(size)];
    if (state === 'wall') {
      this.rect(x, y, size, size, this.c('brick'));
      const mortar = this.c('bg');
      const half = Math.floor(size / 2);
      this.rect(x, y + half, size, 1, mortar);
      this.rect(x, y + size - 1, size, 1, mortar);
      this.rect(x + half, y, 1, half, mortar);
      this.rect(x + Math.floor(size / 4), y + half, 1, size - half, mortar);
      this.rect(x, y, size, 1, mix(this.c('brick'), '#FFFFFF', 0.35));
      return;
    }
    if (state === 'open' || state === 'default') {
      this.rect(x, y, size, size, this.c('window-deep'));
      this.rect(x + size - 1, y, 1, size, this.c('bg'));
      this.rect(x, y + size - 1, size, 1, this.c('bg'));
    } else {
      this.bar(x, y, size - 1, size - 1, state);
    }
    if (label) {
      const dark = state !== 'open' && state !== 'default' && state !== 'dead';
      this.text(label, x + size / 2, y + (size - GLYPH_H) / 2, { align: 'center', color: dark ? this.c('bg') : this.c('muted') });
    }
  }

  pointer(x: number, y: number, label: string, o: { up?: boolean; state?: VisualState } = {}): void {
    const color = o.state ? this.color(o.state) : this.c('text');
    x = Math.round(x);
    y = Math.round(y);
    this.g.fillStyle = color;
    for (let i = 0; i < 3; i++) this.g.fillRect(x - i, o.up ? y + i : y + 2 - i, i * 2 + 1, 1);
    this.text(label, x + 1, o.up ? y + 4 : y - 9, { align: 'center', color });
  }

  panel(x: number, y: number, w: number, h: number, title?: string): void {
    [x, y, w, h] = [Math.round(x), Math.round(y), Math.round(w), Math.round(h)];
    this.rect(x + 1, y + 1, w - 2, h - 2, this.c('window'));
    const b = this.c('border');
    this.rect(x + 2, y, w - 4, 1, b);
    this.rect(x + 2, y + h - 1, w - 4, 1, b);
    this.rect(x, y + 2, 1, h - 4, b);
    this.rect(x + w - 1, y + 2, 1, h - 4, b);
    this.rect(x + 1, y + 1, 1, 1, b);
    this.rect(x + w - 2, y + 1, 1, 1, b);
    this.rect(x + 1, y + h - 2, 1, 1, b);
    this.rect(x + w - 2, y + h - 2, 1, 1, b);
    if (title) {
      const tw = textWidth(title) + 4;
      this.rect(x + 5, y - 3, tw, 7, this.c('window'));
      this.text(title, x + 7, y - 3, { tone: 'muted' });
    }
  }

  tag(x: number, y: number, s: string, state: VisualState, o: { align?: 'left' | 'center' | 'right' } = {}): void {
    const w = textWidth(s) + 4;
    const left = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    this.rect(left, y, w, GLYPH_H + 2, this.color(state));
    this.text(s, left + 2, y + 1, { color: this.c('bg') });
  }
}
