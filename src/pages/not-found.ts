import '../ui/layout.css';
import { trackPage } from '../core/analytics';
import { homeUrl } from '../core/routes';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import { t } from '../i18n';
import { applyTheme } from '../themes';
import { ui } from '../ui/components';
import { h } from '../ui/dom';
import { createSiteFooter } from '../ui/site-footer';

function mount(root: HTMLElement): void {
  applyTheme();
  document.documentElement.lang = settings.get().lang;
  document.title = `${t('notFound.title')} · ${t('app.name')}`;
  trackPage('/404/');
  const home = h('a', { class: 'ui-button ui-button--primary', href: homeUrl() }, h('span', { class: 'ui-button__label' }, t('notFound.continue')));
  home.addEventListener('click', () => sound.play('ui-select'));
  root.replaceChildren(h('main', { class: 'not-found' },
    ui.window(null,
      h('h1', { class: 'logo not-found__title' }, t('notFound.title')),
      h('p', {}, t('notFound.body', { path: location.pathname })),
      home,
    ),
  ), createSiteFooter());
  home.focus();
}

mount(document.getElementById('app')!);
