import type { AlgorithmContent, AlgorithmDef } from '../../core/algorithm';
import { t } from '../../i18n';
import { ui } from '../components';
import { h } from '../dom';

export function createInfoPanel(def: AlgorithmDef<never>, c: AlgorithmContent): HTMLElement {
  const tr = def.traits;
  const traits = h('div', { class: 'traits' });
  if (tr.stable !== undefined) traits.append(ui.chip(t(tr.stable ? 'trait.stable' : 'trait.unstable'), tr.stable ? 'good' : 'default'));
  if (tr.inPlace !== undefined) traits.append(ui.chip(t(tr.inPlace ? 'trait.inPlace' : 'trait.outOfPlace'), tr.inPlace ? 'good' : 'default'));
  if (tr.optimal !== undefined) traits.append(ui.chip(t(tr.optimal ? 'trait.optimal' : 'trait.notOptimal'), tr.optimal ? 'good' : 'warn'));
  if (tr.weighted !== undefined) traits.append(ui.chip(t(tr.weighted ? 'trait.weighted' : 'trait.unweighted'), 'info'));
  if (tr.negativeWeights) traits.append(ui.chip(t('trait.negative'), 'info'));
  const cx = def.complexity;
  return h('div', { class: 'info' },
    h('p', {}, c.summary),
    traits,
    h('section', {}, h('h3', { class: 'section-title' }, t('info.how')), h('ol', { class: 'info-list' }, ...c.steps.map((s) => h('li', {}, s)))),
    h('section', {}, h('h3', { class: 'section-title' }, t('info.complexity')), h('dl', { class: 'complexity' },
      h('dt', {}, t('complexity.best')), h('dd', {}, cx.best),
      h('dt', {}, t('complexity.average')), h('dd', {}, cx.average),
      h('dt', {}, t('complexity.worst')), h('dd', {}, cx.worst),
      h('dt', {}, t('complexity.space')), h('dd', {}, cx.space),
    )),
    h('section', {}, h('h3', { class: 'section-title' }, t('info.when')), h('p', {}, c.whenToUse)),
    h('section', {}, h('h3', { class: 'section-title' }, t('info.refs')), h('ul', { class: 'refs' },
      ...c.references.map((r) => h('li', {}, h('a', { href: r.url, target: '_blank', rel: 'noopener' }, r.title))))),
  );
}
