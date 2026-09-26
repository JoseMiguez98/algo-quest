import type { QuickExtra } from '../../algorithms/sorting/quick-sort/algorithm';
import type { BarsLayer } from '../bars';

/** Quick sort (Lomuto): labels the ≤ pivot and > pivot regions of the partition in progress. */
export const partition: BarsLayer = {
  height: 0,
  draw(r, f, layout) {
    const p = (f.step.state.extra as QuickExtra).partition;
    if (!p) return;
    const y = 2;
    const seg = (a: number, b: number, color: string, label: string) => {
      if (b < a) return;
      const x0 = layout.x(a);
      const x1 = layout.x(b) + layout.barW;
      r.rect(x0, y + 8, x1 - x0, 2, color);
      if (x1 - x0 >= r.measure(label)) r.text(label, (x0 + x1) / 2 + 1, y, { align: 'center', color });
    };
    seg(p.lo, p.i, r.color('key'), '≤P');
    seg(p.i + 1, p.j - 1, r.color('visited'), '>P');
  },
};
