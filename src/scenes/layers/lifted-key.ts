import type { SortItem } from '../../algorithms/sorting/types';
import type { BarsLayer } from '../bars';

/** Insertion sort: draws the lifted key floating above the hole it will fill. */
export const liftedKey: BarsLayer = {
  height: 0,
  draw(r, f, layout) {
    const key = (f.step.state.extra as { key?: SortItem | null }).key;
    const hole = f.step.state.items.indexOf(null);
    if (!key || hole < 0) return;
    const h = Math.max(2, Math.round((key.value / layout.maxValue) * layout.maxH));
    const lift = 8;
    r.bar(layout.x(hole), layout.baseY - h - lift, layout.barW, h, 'key');
    r.text('KEY', layout.x(hole) + layout.barW / 2 + 1, layout.baseY - h - lift - 9, { align: 'center', color: r.color('key') });
  },
};
