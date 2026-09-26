import type { AlgorithmContent, AlgorithmDef } from '../../core/algorithm';
import { has, t } from '../../i18n';
import type { StageRenderer } from '../../themes/contract';
import { h } from '../dom';

export function createLegend(def: AlgorithmDef<never>, c: AlgorithmContent, r: StageRenderer): HTMLElement {
  const list = h('ul', { class: 'legend', 'aria-label': t('legend.title') });
  for (const state of def.legend) {
    const key = `legend.${state}`;
    const label = c.legend?.[state] ?? (has(key) ? t(key) : state);
    const swatch = state === 'default' && def.category === 'graph' ? 'background:var(--color-node);box-shadow:0 0 0 2px var(--color-node-border)' : `background:${r.color(state)}`;
    list.append(h('li', {}, h('span', { class: 'legend__swatch', style: swatch }), label));
  }
  return list;
}
