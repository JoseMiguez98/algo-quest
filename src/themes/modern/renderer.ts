import type { StageRenderer, TextOptions, ThemeTokens, VisualState } from '../contract';

/**
 * Vector renderer: draws with antialiasing into a supersampled buffer sized from the last
 * target, so the modern theme looks smooth instead of pixelated.
 */
export class VectorRenderer implements StageRenderer {
  readonly lineHeight = 10;
  readonly groundHeight = 2;
  transform = { scale: 1, dx: 0, dy: 0 };
  private readonly off = document.createElement('canvas');
  private readonly g = this.off.getContext('2d')!;
  private w = 0;
  private h = 0;
  private s = 3;

  constructor(private readonly tokens: ThemeTokens) {}

  private c(k: string): string {
    return this.tokens.color[k] ?? '#FF00FF';
  }

  color(state: VisualState): string {
    return this.tokens.state[state];
  }

  begin(width: number, height: number): void {
    this.w = width;
    this.h = height;
    const W = Math.round(width * this.s);
    const H = Math.round(height * this.s);
    if (this.off.width !== W || this.off.height !== H) {
      this.off.width = W;
      this.off.height = H;
    }
    this.g.setTransform(this.s, 0, 0, this.s, 0, 0);
    this.g.fillStyle = this.c('stage');
    this.g.fillRect(0, 0, width, height);
    this.g.lineCap = 'round';
    this.g.lineJoin = 'round';
  }

  present(target: HTMLCanvasElement): void {
    const t = target.getContext('2d')!;
    const scale = Math.min(target.width / this.w, target.height / this.h);
    const dw = this.w * scale;
    const dh = this.h * scale;
    const dx = (target.width - dw) / 2;
    const dy = (target.height - dh) / 2;
    this.transform = { scale, dx, dy };
    this.s = Math.max(2, Math.min(6, Math.ceil(scale)));
    t.imageSmoothingEnabled = true;
    t.imageSmoothingQuality = 'high';
    t.fillStyle = this.c('stage');
    t.fillRect(0, 0, target.width, target.height);
    t.drawImage(this.off, dx, dy, dw, dh);
  }

  private round(x: number, y: number, w: number, h: number, r: number): void {
    this.g.beginPath();
    this.g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    this.g.fillStyle = color;
    this.g.fillRect(x, y, w, h);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, dashed = false): void {
    this.g.strokeStyle = color;
    this.g.lineWidth = 0.8;
    this.g.setLineDash(dashed ? [2, 2] : []);
    this.g.beginPath();
    this.g.moveTo(x1, y1);
    this.g.lineTo(x2, y2);
    this.g.stroke();
    this.g.setLineDash([]);
  }

  private font(scale = 1, weight = 600): void {
    this.g.font = `${weight} ${7.5 * scale}px Inter, system-ui, sans-serif`;
  }

  measure(s: string, scale = 1): number {
    this.font(scale);
    return this.g.measureText(s).width;
  }

  text(s: string, x: number, y: number, o: TextOptions = {}): void {
    this.font(o.scale);
    this.g.fillStyle = o.color ?? this.c(o.tone === 'muted' ? 'muted' : o.tone === 'accent' ? 'accent' : o.tone === 'inverse' ? 'surface' : 'text');
    this.g.textAlign = o.align ?? 'left';
    this.g.textBaseline = 'top';
    this.g.fillText(s, x, y);
  }

  ground(x: number, y: number, w: number): void {
    this.round(x, y, w, 1.5, 1);
    this.g.fillStyle = this.c('border');
    this.g.fill();
  }

  bar(x: number, y: number, w: number, h: number, state: VisualState, o: { ghost?: boolean } = {}): void {
    this.round(x + 0.3, y, Math.max(1, w - 0.6), h, Math.min(3, w / 3));
    if (o.ghost) {
      this.g.strokeStyle = this.color(state);
      this.g.lineWidth = 0.8;
      this.g.stroke();
      return;
    }
    this.g.fillStyle = this.color(state);
    this.g.fill();
  }

  slot(x: number, y: number, w: number, h: number, o: { active?: boolean } = {}): void {
    this.round(x, y, w, h, 2);
    this.g.strokeStyle = o.active ? this.c('accent') : this.c('dim');
    this.g.lineWidth = 0.7;
    this.g.setLineDash([2, 1.5]);
    this.g.stroke();
    this.g.setLineDash([]);
  }

  node(cx: number, cy: number, r: number, state: VisualState, label: string, o: { ring?: 'start' | 'target' | null } = {}): void {
    if (o.ring) {
      this.g.beginPath();
      this.g.arc(cx, cy, r + 2.2, 0, Math.PI * 2);
      this.g.strokeStyle = o.ring === 'start' ? this.c('text') : this.c('accent');
      this.g.lineWidth = 1.2;
      this.g.stroke();
    }
    this.g.beginPath();
    this.g.arc(cx, cy, r, 0, Math.PI * 2);
    this.g.fillStyle = state === 'default' ? this.c('node') : this.color(state);
    this.g.fill();
    this.g.strokeStyle = state === 'default' ? this.c('node-border') : 'rgba(0,0,0,.12)';
    this.g.lineWidth = 0.9;
    this.g.stroke();
    this.font(r >= 7 ? 1 : 0.85, 700);
    this.g.fillStyle = state === 'default' ? this.c('text') : '#FFFFFF';
    this.g.textAlign = 'center';
    this.g.textBaseline = 'middle';
    this.g.fillText(label, cx, cy + 0.4);
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
    this.g.strokeStyle = color;
    this.g.lineWidth = state === 'path' ? 2.2 : state === 'default' ? 0.8 : 1.4;
    this.g.setLineDash(state === 'rejected' ? [2, 2] : []);
    this.g.beginPath();
    this.g.moveTo(a[0], a[1]);
    this.g.lineTo(b[0], b[1]);
    this.g.stroke();
    this.g.setLineDash([]);
    if (o.directed) {
      this.g.beginPath();
      this.g.moveTo(b[0], b[1]);
      this.g.lineTo(b[0] - ux * 4 - uy * 2.2, b[1] - uy * 4 + ux * 2.2);
      this.g.lineTo(b[0] - ux * 4 + uy * 2.2, b[1] - uy * 4 - ux * 2.2);
      this.g.closePath();
      this.g.fillStyle = color;
      this.g.fill();
    }
    if (o.weight !== undefined) {
      const mx = (a[0] + b[0]) / 2 + nx * 0.5;
      const my = (a[1] + b[1]) / 2 + ny * 0.5;
      const w = this.measure(o.weight, 0.85) + 4;
      this.round(mx - w / 2, my - 4, w, 8, 4);
      this.g.fillStyle = this.c('surface');
      this.g.fill();
      this.g.strokeStyle = state === 'default' ? this.c('border') : color;
      this.g.lineWidth = 0.6;
      this.g.stroke();
      this.font(0.85);
      this.g.fillStyle = state === 'default' ? this.c('muted') : color;
      this.g.textAlign = 'center';
      this.g.textBaseline = 'middle';
      this.g.fillText(o.weight, mx, my + 0.3);
    }
  }

  cell(x: number, y: number, size: number, state: VisualState | 'wall' | 'open', label?: string): void {
    this.round(x + 0.4, y + 0.4, size - 0.8, size - 0.8, 1.6);
    this.g.fillStyle = state === 'wall' ? this.c('brick') : state === 'open' || state === 'default' ? this.c('cell') : this.color(state);
    this.g.fill();
    if (state === 'open') {
      this.g.strokeStyle = this.c('border');
      this.g.lineWidth = 0.5;
      this.g.stroke();
    }
    if (label) {
      this.font(Math.min(1, size / 12), 600);
      this.g.fillStyle = state === 'open' || state === 'default' ? this.c('muted') : '#FFFFFF';
      this.g.textAlign = 'center';
      this.g.textBaseline = 'middle';
      this.g.fillText(label, x + size / 2, y + size / 2 + 0.3);
    }
  }

  pointer(x: number, y: number, label: string, o: { up?: boolean; state?: VisualState } = {}): void {
    const color = o.state ? this.color(o.state) : this.c('text');
    this.g.beginPath();
    this.g.moveTo(x, o.up ? y : y + 3);
    this.g.lineTo(x - 2.5, o.up ? y + 3 : y);
    this.g.lineTo(x + 2.5, o.up ? y + 3 : y);
    this.g.closePath();
    this.g.fillStyle = color;
    this.g.fill();
    this.text(label, x, o.up ? y + 4 : y - 9, { align: 'center', color, scale: 0.9 });
  }

  panel(x: number, y: number, w: number, h: number, title?: string): void {
    this.round(x, y, w, h, 5);
    this.g.fillStyle = this.c('surface');
    this.g.fill();
    this.g.strokeStyle = this.c('border');
    this.g.lineWidth = 0.6;
    this.g.stroke();
    if (title) this.text(title, x + 6, y + 3, { tone: 'muted', scale: 0.85 });
  }

  tag(x: number, y: number, s: string, state: VisualState, o: { align?: 'left' | 'center' | 'right' } = {}): void {
    const w = this.measure(s, 0.85) + 5;
    const left = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    this.round(left, y, w, 8.5, 4.2);
    this.g.fillStyle = this.color(state);
    this.g.fill();
    this.font(0.85, 700);
    this.g.fillStyle = '#FFFFFF';
    this.g.textAlign = 'left';
    this.g.textBaseline = 'middle';
    this.g.fillText(s, left + 2.5, y + 4.5);
  }
}
