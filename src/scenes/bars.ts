import type { ArrayState, SortItem } from '../algorithms/sorting/types';
import type { StageRenderer, VisualState } from '../themes/contract';
import { lerp, type Scene, type SceneFrame } from './scene';

type S = ArrayState<unknown>;

export interface BarsLayout {
  x: (index: number) => number;
  barW: number;
  baseY: number;
  maxH: number;
  maxValue: number;
}

/** Extra drawing hooks used by algorithm-specific layers (aux rows, trees, buckets). */
export interface BarsLayer {
  /** Logical pixels this layer needs below the main bars; 0 draws over the main area. */
  height: number;
  draw(r: StageRenderer, f: SceneFrame<S>, layout: BarsLayout, top: number): void;
}

export interface BarsOptions {
  maxValue?: number;
  /** Custom value label, optionally highlighting one character (e.g. the current radix digit). */
  label?: (value: number, f: SceneFrame<S>) => { text: string; highlight?: number };
}


export class BarsScene implements Scene<S> {
  readonly logicalHeight: number;
  readonly minWidth = 180;
  readonly maxWidth = 720;

  private readonly maxValue?: number;

  constructor(
    private readonly layers: BarsLayer[] = [],
    private readonly options: BarsOptions = {},
  ) {
    this.maxValue = options.maxValue;
    this.logicalHeight = 160 + layers.reduce((h, l) => h + l.height, 0) + (layers.some((l) => l.height) ? 4 : 0);
  }

  draw(r: StageRenderer, f: SceneFrame<S>): void {
    const { step, prev, t, width } = f;
    const s = step.state;
    const n = s.items.length;
    const all = s.items.filter((x): x is SortItem => !!x);
    const maxValue = this.maxValue ?? Math.max(1, ...all.map((x) => x.value), ...collectExtraValues(s));
    if (maxValue <= 0) return;
    const pad = 10;
    const gap = n > 18 ? 1 : 2;
    const barW = Math.max(2, Math.floor((width - pad * 2 - gap * (n - 1)) / Math.max(1, n)));
    const total = barW * n + gap * (n - 1);
    const left = Math.round((width - total) / 2);
    const top = 16;
    const baseY = 112;
    const labelY = baseY + r.groundHeight + 3;
    const maxH = baseY - top;
    const layout: BarsLayout = { x: (i) => left + i * (barW + gap), barW, baseY, maxH, maxValue };
    const duplicates = duplicateIds(all);

    r.ground(left - 6, baseY, total + 12);

    if (s.range) {
      const [lo, hi] = s.range;
      const x0 = layout.x(lo) - 1;
      const x1 = layout.x(hi) + barW;
      r.rect(x0, top - 6, x1 - x0 + 1, 1, r.color('inactive'));
      r.rect(x0, top - 6, 1, 3, r.color('inactive'));
      r.rect(x1, top - 6, 1, 3, r.color('inactive'));
    }

    const prevIndex = new Map<number, number>();
    prev?.state.items.forEach((it, i) => it && prevIndex.set(it.id, i));

    s.items.forEach((it, i) => {
      const x = layout.x(i);
      if (!it) {
        r.slot(x, baseY - 8, barW, 8);
        return;
      }
      const from = prevIndex.get(it.id);
      const px = from === undefined ? x : lerp(layout.x(from), x, t);
      const h = Math.max(2, Math.round((it.value / maxValue) * maxH));
      const state: VisualState = s.marks[i] ?? 'default';
      const lift = state === 'swap' && from !== undefined && from !== i ? Math.round(Math.sin(t * Math.PI) * 6) : 0;
      r.bar(px, baseY - h - lift, barW, h, state);
      if (barW >= 11) this.drawLabel(r, f, it.value, px + barW / 2 + 1, labelY, state);
      if (duplicates.has(it.id) && barW >= 7) r.text(String(duplicates.get(it.id)! + 1), px + barW / 2 + 1, baseY - h - lift - 9, { align: 'center', tone: 'muted' });
    });

    for (const p of s.pointers) r.pointer(layout.x(p.index) + barW / 2, labelY + 10, p.label, { up: true, state: 'active' });

    const below = this.layers.reduce((h, l) => h + l.height, 0);
    if (below) r.panel(2, 158, width - 4, below);
    let y = 160;
    for (const layer of this.layers) {
      layer.draw(r, f, layout, layer.height ? y : 0);
      y += layer.height;
    }
  }

  private drawLabel(r: StageRenderer, f: SceneFrame<S>, value: number, cx: number, y: number, state: VisualState): void {
    const color = state === 'default' ? r.color('inactive') : r.color(state);
    const custom = this.options.label?.(value, f);
    if (!custom) {
      r.text(String(value), cx, y, { align: 'center', tone: state === 'default' ? 'muted' : 'normal', color: state === 'default' ? undefined : color });
      return;
    }
    const w = r.measure(custom.text);
    let x = Math.round(cx - w / 2);
    [...custom.text].forEach((ch, i) => {
      r.text(ch, x, y, { color: i === custom.highlight ? r.color('compare') : state === 'default' ? undefined : color, tone: 'muted' });
      x += r.measure(ch) + 1;
    });
  }
}

/** Items sharing a value get a/b/c tags (by original order) so stability is visible. */
function duplicateIds(items: SortItem[]): Map<number, number> {
  const groups = new Map<number, SortItem[]>();
  for (const it of items) groups.set(it.value, [...(groups.get(it.value) ?? []), it]);
  const out = new Map<number, number>();
  for (const g of groups.values()) if (g.length > 1) g.sort((a, b) => a.id - b.id).forEach((it, k) => out.set(it.id, k));
  return out;
}

function collectExtraValues(s: S): number[] {
  const x = s.extra as { key?: SortItem | null; aux?: (SortItem | null)[] } | null;
  const vals: number[] = [];
  if (x?.key) vals.push(x.key.value);
  x?.aux?.forEach((a) => a && vals.push(a.value));
  return vals;
}
