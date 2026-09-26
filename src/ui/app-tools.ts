import { isDevEnvironment, track } from '../core/analytics';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import { t } from '../i18n';
import { allThemes } from '../themes';
import { setButtonIcon, ui } from './components';
import { h } from './dom';

/** Language, style, sound, music and volume controls shared by every page's top bar. */
export function createAppTools(extra: HTMLElement[] = []) {
  const soundBtn = ui.button({ label: '', icon: 'sound', iconOnly: true, shortcut: 'M', onClick: () => toggleMute() });
  const musicBtn = ui.button({ label: '', icon: 'music', iconOnly: true, onClick: () => { sound.unlock(); settings.set({ music: !settings.get().music }); } });
  musicBtn.hidden = !sound.hasMusic;
  const volume = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: settings.get().volume, 'aria-label': t('sound.volume') });
  volume.addEventListener('input', () => settings.set({ volume: Number(volume.value), muted: false }));
  const themeSelect = h('select', { class: 'theme-select', 'aria-label': t('theme.label') },
    ...allThemes().map((th) => h('option', { value: th.id, selected: th.id === settings.get().theme }, th.name)));
  themeSelect.addEventListener('change', () => { track(`theme/${themeSelect.value}`); settings.set({ theme: themeSelect.value }); });
  const langBtns = (['es', 'en'] as const).map((l) =>
    ui.button({ label: l.toUpperCase(), variant: settings.get().lang === l ? 'default' : 'ghost', pressed: settings.get().lang === l, onClick: () => { if (settings.get().lang === l) return; track(`lang/${l}`); settings.set({ lang: l }); } }));

  const el = h('div', { class: 'app-bar__tools' },
    isDevEnvironment ? h('span', { class: 'env-badge', title: t('env.dev') }, 'DEV') : null,
    h('div', { class: 'lang-switch', role: 'group', 'aria-label': t('lang.label') }, ...langBtns),
    themeSelect,
    h('div', { class: 'volume' }, soundBtn, musicBtn, volume),
    ...extra,
  );

  function toggleMute(): void {
    sound.unlock();
    settings.set({ muted: !settings.get().muted });
    if (settings.get().muted) track('sound/off');
    sound.play('ui-toggle');
  }

  function sync(): void {
    const { muted, music, volume: v } = settings.get();
    setButtonIcon(soundBtn, muted ? 'mute' : 'sound', t(muted ? 'sound.off' : 'sound.on'));
    soundBtn.setAttribute('aria-pressed', String(!muted));
    musicBtn.title = t(music ? 'music.on' : 'music.off');
    musicBtn.setAttribute('aria-label', musicBtn.title);
    musicBtn.setAttribute('aria-pressed', String(music));
    volume.value = String(v);
  }
  sync();

  return { el, sync, toggleMute };
}

/** Rebuilds the page when language or theme change, since both affect every string and pixel. */
export function onLanguageOrThemeChange(rebuild: () => void, sync: () => void): () => void {
  const off = settings.on('change', (s) => {
    sync();
    if (s.lang !== document.documentElement.lang || s.theme !== document.documentElement.dataset.theme) {
      off();
      rebuild();
    }
  });
  return off;
}
