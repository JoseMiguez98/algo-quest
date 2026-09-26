import { track } from '../core/analytics';
import { t } from '../i18n';
import { h } from './dom';
import { icon, type IconName } from './icons';

const REPO_URL = 'https://github.com/JoseMiguez98/algo-quest';
const PROFILE_URL = 'https://github.com/JoseMiguez98';

function external(href: string, iconName: IconName, label: string, event: string): HTMLAnchorElement {
  const a = h('a', { class: 'ui-button', href, target: '_blank', rel: 'noopener', 'aria-label': `${label} (${t('footer.newTab')})` },
    icon(iconName), h('span', { class: 'ui-button__label' }, label));
  a.addEventListener('click', () => track(event));
  return a;
}

/** Credits, license and the GitHub star/follow invitation shown at the bottom of every page. */
export function createSiteFooter(): HTMLElement {
  return h('footer', { class: 'site-footer' },
    h('p', { class: 'site-footer__cta' }, t('footer.cta')),
    h('div', { class: 'site-footer__links' },
      external(REPO_URL, 'star', t('footer.star'), 'footer/star'),
      external(PROFILE_URL, 'github', t('footer.follow'), 'footer/follow'),
    ),
    h('p', { class: 'site-footer__legal' },
      h('span', { class: 'site-footer__copy' }, '©'), ' ', t('footer.rights', { year: new Date().getFullYear() }), ' ',
      h('a', { href: `${REPO_URL}/blob/main/LICENSE`, target: '_blank', rel: 'noopener' }, t('footer.license')), '.',
    ),
  );
}
