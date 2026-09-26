import type { SortItem } from '../../algorithms/sorting/types';
import type { BarsLayer } from '../bars';
import { rowLabel } from './common';

interface CountsExtra {
  counts: number[];
  output: (SortItem | null)[];
  focus: number | null;
  offset?: number;
}

/** Counting / radix sort: the count table C (indexed by key or digit) and the output array B. */
export const counts: BarsLayer = {
  height: 58,
  draw(r, f, layout, top) {
    const x = f.step.state.extra as CountsExtra;
    const k = x.counts.length;
    if (!k) return;
    const left = layout.x(0);
    const width = layout.x(f.step.state.items.length - 1) + layout.barW - left;
    const cw = Math.min(26, Math.floor(width / k));
    const cx0 = Math.round(left + (width - cw * k) / 2);
    rowLabel(r, 'C', 6, top + 6);
    x.counts.forEach((c, i) => {
      const cx = cx0 + i * cw;
      const on = x.focus === i;
      r.cell(cx, top + 2, cw, on ? 'compare' : 'open', String(c));
      r.text(String(i + (x.offset ?? 0)), cx + cw / 2, top + cw + 4, { align: 'center', tone: on ? 'accent' : 'muted' });
    });
    const by = top + 44;
    rowLabel(r, 'B', 6, by);
    x.output.forEach((it, i) => {
      const px = layout.x(i);
      if (it) r.tag(px + layout.barW / 2, by, String(it.value), 'write', { align: 'center' });
      else r.slot(px, by + 7, layout.barW, 3);
    });
  },
};
