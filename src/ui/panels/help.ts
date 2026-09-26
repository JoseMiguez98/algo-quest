import { BINDINGS, type Action } from '../../core/hotkeys';
import { t } from '../../i18n';
import { ui } from '../components';
import { h } from '../dom';

const LABELS: Partial<Record<Action, () => string>> = {
  toggle: () => `${t('transport.play')} / ${t('transport.pause')}`,
  forward: () => t('transport.forward'),
  back: () => t('transport.back'),
  reset: () => t('transport.reset'),
  shuffle: () => t('data.shuffle'),
  faster: () => `${t('transport.speed')} +`,
  slower: () => `${t('transport.speed')} −`,
  mute: () => `${t('sound.on')} / ${t('sound.off')}`,
  code: () => t('panel.code'),
  info: () => t('panel.info'),
  help: () => t('help.title'),
};

export function createHelp() {
  const keys = h('dl', { class: 'keys' });
  for (const b of BINDINGS) {
    const label = LABELS[b.action];
    if (label) keys.append(h('dt', {}, b.display), h('dd', {}, label()));
  }
  const closeBtn = ui.button({ label: t('help.close'), onClick: () => close() });
  const dialog = ui.window(t('help.title'), keys, closeBtn);
  dialog.classList.add('overlay__dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const el = h('div', { class: 'overlay', hidden: true, onclick: (e: Event) => e.target === el && close() }, dialog);
  let returnFocus: Element | null = null;
  const open = () => {
    returnFocus = document.activeElement;
    el.hidden = false;
    closeBtn.focus();
  };
  const close = () => {
    if (el.hidden) return;
    el.hidden = true;
    (returnFocus as HTMLElement | null)?.focus?.();
  };
  return { el, open, close, toggle: () => (el.hidden ? open() : close()), get isOpen() { return !el.hidden; } };
}
