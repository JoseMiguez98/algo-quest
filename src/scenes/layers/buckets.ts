import type { BucketExtra } from '../../algorithms/sorting/bucket-sort/algorithm';
import type { VisualState } from '../../themes/contract';
import type { BarsLayer } from '../bars';

/** Bucket sort: one box per bucket with its value range and its items as mini bars. */
export const buckets: BarsLayer = {
  height: 62,
  draw(r, f, layout, top) {
    const x = f.step.state.extra as BucketExtra;
    const k = x.buckets.length;
    if (!k) return;
    const left = layout.x(0);
    const width = layout.x(f.step.state.items.length - 1) + layout.barW - left;
    const gap = 4;
    const bw = Math.floor((width - gap * (k - 1)) / k);
    const base = top + 44;
    x.buckets.forEach((items, b) => {
      const bx = left + b * (bw + gap);
      r.slot(bx, top + 2, bw, 44, { active: x.activeBucket === b });
      const [lo, hi] = x.ranges[b]!;
      r.text(`${lo}-${hi}`, bx + bw / 2, base + 4, { align: 'center', tone: x.activeBucket === b ? 'accent' : 'muted' });
      const mw = Math.max(2, Math.min(10, Math.floor((bw - 4) / Math.max(1, items.length)) - 1));
      items.forEach((it, i) => {
        const focus = x.focus.find((fc) => fc.bucket === b && fc.index === i);
        const state: VisualState = focus ? focus.mark : 'default';
        const h = Math.max(2, Math.round((it.value / layout.maxValue) * 34));
        r.bar(bx + 2 + i * (mw + 1), base - h - 1, mw, h, state);
      });
    });
  },
};
