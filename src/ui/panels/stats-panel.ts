import type { AlgorithmDef } from '../../core/algorithm';
import type { Step } from '../../core/types';
import { has, t } from '../../i18n';
import { clear, h } from '../dom';

export interface StructureView {
  title: string;
  kind: 'queue' | 'stack' | 'list';
  items: (step: Step<unknown>) => string[];
}

export function createStatsPanel(def: AlgorithmDef<never>, structures: StructureView[]) {
  const values = new Map<string, HTMLElement>();
  const stats = h('dl', { class: 'stats' });
  for (const c of def.counters) {
    const key = `counter.${c}`;
    const dd = h('dd', {}, '0');
    values.set(c, dd);
    stats.append(h('dt', {}, has(key) ? t(key) : c), dd);
  }
  const lists = structures.map((s) => ({ view: s, list: h('ul', { class: `structure structure--${s.kind}` }) }));
  const el = h('div', { class: 'stats-panel' }, h('section', {}, h('h3', { class: 'section-title' }, t('stats.measured')), stats));
  const strip = lists.length
    ? h('div', { class: 'structures' }, ...lists.map(({ view, list }) => h('div', { class: 'structures__row' }, h('span', { class: 'structures__title' }, view.title), list)))
    : null;
  const live = h('dl', { class: 'live-counters', 'aria-live': 'off' });
  const liveValues = new Map<string, HTMLElement>();
  for (const c of def.counters.slice(0, 3)) {
    const dd = h('dd', {}, '0');
    liveValues.set(c, dd);
    live.append(h('div', {}, h('dt', {}, has(`counter.${c}`) ? t(`counter.${c}` as never) : c), dd));
  }

  const update = (step: Step<unknown>) => {
    for (const [c, dd] of values) dd.textContent = String(step.counters[c] ?? 0);
    for (const [c, dd] of liveValues) dd.textContent = String(step.counters[c] ?? 0).padStart(3, '0');
    for (const { view, list } of lists) {
      clear(list);
      const items = view.items(step);
      if (!items.length) list.append(h('li', { class: 'structure__empty' }, t('structure.empty')));
      for (const it of items) list.append(h('li', {}, it));
    }
  };

  return { el, strip, live, update };
}
