import type { SortItem } from '../../algorithms/sorting/types';
import type { StageRenderer, VisualState } from '../../themes/contract';

/** Small bar used by auxiliary rows; value label on top when there is room. */
export function miniBar(r: StageRenderer, x: number, baseY: number, w: number, maxH: number, it: SortItem, maxValue: number, state: VisualState): void {
  const h = Math.max(2, Math.round((it.value / maxValue) * maxH));
  r.bar(x, baseY - h, w, h, state);
  if (w >= 11) r.text(String(it.value), x + w / 2 + 1, baseY - h - 8, { align: 'center', tone: 'muted' });
}

export const rowLabel = (r: StageRenderer, text: string, x: number, y: number): void => r.text(text, x, y, { tone: 'muted' });
