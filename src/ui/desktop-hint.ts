import { settings } from '../core/settings';
import { t } from '../i18n';
import { px } from '../themes/pixel/svg';
import { ui } from './components';
import { h, html } from './dom';

const W = 20;
const H = 16;

/** A pixel monitor whose screen shows a sorted bar chart, drawn in theme colors. */
function monitorArt(): DocumentFragment {
  const frame = 'currentColor';
  const bars = 'var(--color-accent)';
  const rects = [px(0, 0, frame, W, 1), px(0, 11, frame, W, 1), px(0, 0, frame, 1, 12), px(W - 1, 0, frame, 1, 12), px(8, 12, frame, 4, 2), px(5, 14, frame, 10, 2)];
  for (let i = 0; i < 8; i++) rects.push(px(2 + i * 2, 9 - i, bars, 1, i + 2));
  return html(`<svg class="desktop-hint__art" viewBox="0 0 ${W} ${H}" aria-hidden="true" shape-rendering="crispEdges">${rects.join('')}</svg>`);
}

/** Prepends a small, dismissible note for phones and tablets, until the visitor closes it. */
export function mountDesktopHint(root: HTMLElement): void {
  if (settings.get().desktopHintDismissed || !matchMedia('(max-width: 960px)').matches) return;
  const close = ui.button({ label: t('hint.close'), icon: 'close', iconOnly: true, variant: 'ghost', onClick: () => {
    settings.set({ desktopHintDismissed: true });
    el.remove();
  } });
  const el = ui.window(null, monitorArt(), h('p', { class: 'desktop-hint__text' }, t('hint.desktop')), close);
  el.classList.add('desktop-hint');
  el.setAttribute('aria-label', t('hint.label'));
  root.prepend(el);
}
