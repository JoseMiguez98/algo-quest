import type { Primitive, Pseudocode, Step } from '../../core/types';
import { t } from '../../i18n';
import { clear, h } from '../dom';

export function createCodePanel(pseudocode: Pseudocode) {
  const lines = new Map<string, HTMLElement>();
  const list = h('ol', { class: 'code', 'aria-label': t('panel.code') });
  for (const line of pseudocode) {
    const li = h('li', { class: 'code__line', 'data-line': line.id }, h('span', { class: 'code__text', style: `padding-left:${line.indent * 1.4}em` }, line.text));
    lines.set(line.id, li);
    list.append(li);
  }
  const vars = h('dl', { class: 'vars' });
  const el = h('div', { class: 'code-panel' }, list, h('h3', { class: 'section-title' }, t('panel.vars')), vars);
  let active: HTMLElement | null = null;

  // Not scrollIntoView: on mobile the panel doesn't scroll, so that would scroll the whole page.
  const reveal = (line: HTMLElement) => {
    const box = el.closest<HTMLElement>('.tab-panels');
    if (!box || box.scrollHeight <= box.clientHeight) return;
    const top = line.getBoundingClientRect().top - box.getBoundingClientRect().top;
    const bottom = top + line.offsetHeight - box.clientHeight;
    if (top < 0) box.scrollTop += top;
    else if (bottom > 0) box.scrollTop += bottom;
  };

  const update = (step: Step<unknown>, prev?: Step<unknown>) => {
    active?.classList.remove('is-active');
    active = step.line ? (lines.get(step.line) ?? null) : null;
    active?.classList.add('is-active');
    if (active) reveal(active);
    clear(vars);
    for (const [k, v] of Object.entries(step.vars)) {
      const changed = prev && prev.vars[k] !== undefined && prev.vars[k] !== v;
      vars.append(h('div', { class: changed ? 'is-changed' : undefined }, h('dt', {}, k), h('dd', {}, show(v))));
    }
  };

  return { el, update };
}

const show = (v: Primitive): string => (v === true ? 'true' : v === false ? 'false' : v === null ? 'nil' : String(v));
