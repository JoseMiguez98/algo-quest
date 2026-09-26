import type { MergeExtra } from '../../algorithms/sorting/merge-sort/algorithm';
import type { BarsLayer } from '../bars';
import { miniBar, rowLabel } from './common';

/** Merge sort: the auxiliary buffer B and the two halves being merged. */
export const auxRow: BarsLayer = {
  height: 48,
  draw(r, f, layout, top) {
    const x = f.step.state.extra as MergeExtra;
    const base = top + 38;
    rowLabel(r, 'B', 6, top + 16);
    if (x.halves) {
      const { lo, mid, hi } = x.halves;
      const y = layout.baseY + r.groundHeight + 1;
      r.rect(layout.x(lo), y, layout.x(mid) + layout.barW - layout.x(lo), 1, r.color('compare'));
      r.rect(layout.x(mid + 1), y, layout.x(hi) + layout.barW - layout.x(mid + 1), 1, r.color('key'));
    }
    x.aux.forEach((it, i) => {
      const px = layout.x(i);
      if (it) miniBar(r, px, base, layout.barW, 24, it, layout.maxValue, 'write');
      else r.slot(px, base - 3, layout.barW, 3, { active: !!x.halves && i >= x.halves.lo && i <= x.halves.hi });
    });
  },
};
