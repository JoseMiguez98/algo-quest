import '../ui/layout.css';
import { algorithms } from '../algorithms/registry';
import { settings } from '../core/settings';
import { t } from '../i18n';
import { applyTheme } from '../themes';
import { h } from '../ui/dom';
import { ui } from '../ui/components';

/** Temporary index until the cartridge-select home (phase 5) lands. */
async function mount(root: HTMLElement): Promise<void> {
  applyTheme();
  document.documentElement.lang = settings.get().lang;
  const items = await Promise.all(
    algorithms.map(async (a) => {
      const c = (await a.content[settings.get().lang]()).default;
      return h('li', {}, h('a', { class: 'ui-button', href: `${import.meta.env.BASE_URL}visualizer.html?algo=${a.id}` }, h('span', { class: 'ui-button__label' }, c.name)));
    }),
  );
  root.replaceChildren(
    h('main', { class: 'home-temp' },
      h('h1', { class: 'app-bar__name' }, t('app.name')),
      h('p', { class: 'app-bar__tagline' }, t('app.tagline')),
      ui.window(null, h('ul', { class: 'home-temp__list' }, ...items)),
    ),
  );
}

void mount(document.getElementById('app')!);
