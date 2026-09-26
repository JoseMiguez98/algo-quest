import type { HeapExtra } from '../../algorithms/sorting/heap-sort/algorithm';
import type { VisualState } from '../../themes/contract';
import type { BarsLayer } from '../bars';

/** Heap sort: the implicit binary tree of A[0..heapSize), in sync with the array marks. */
export const heapTree: BarsLayer = {
  height: 74,
  draw(r, f, layout, top) {
    const s = f.step.state;
    const { heapSize } = s.extra as HeapExtra;
    const n = s.items.length;
    const left = layout.x(0);
    const width = layout.x(n - 1) + layout.barW - left;
    const pos = (i: number) => {
      const d = Math.floor(Math.log2(i + 1));
      const p = i - (2 ** d - 1);
      return { x: left + ((p + 0.5) * width) / 2 ** d, y: top + 10 + d * 17 };
    };
    for (let i = 1; i < n; i++) {
      if (i >= heapSize) continue;
      const a = pos(Math.floor((i - 1) / 2));
      const b = pos(i);
      const m = s.marks[i];
      r.edge(a.x, a.y, b.x, b.y, m === 'swap' ? 'active' : 'default', { trim: 6 });
    }
    for (let i = 0; i < n; i++) {
      const it = s.items[i];
      if (!it) continue;
      const { x, y } = pos(i);
      const inHeap = i < heapSize;
      const state: VisualState = inHeap ? (s.marks[i] ?? 'default') : 'sorted';
      if (!inHeap && s.marks[i] !== 'swap') {
        r.text(String(it.value), x + 1, y - 3, { align: 'center', color: r.color('inactive') });
        continue;
      }
      r.node(x, y, 6, state === 'default' ? 'default' : state, String(it.value));
    }
  },
};
