import { sound } from '../core/sound';
import { settings } from '../core/settings';
import type { StageRenderer, Theme } from './contract';
import { megaDriveTheme } from './megadrive';
import { modernTheme } from './modern';
import { rpgTheme } from './rpg';

const themes: Record<string, Theme> = { [megaDriveTheme.id]: megaDriveTheme, [rpgTheme.id]: rpgTheme, [modernTheme.id]: modernTheme };

export const allThemes = (): Theme[] => Object.values(themes);

export function registerTheme(theme: Theme): void {
  themes[theme.id] = theme;
}

export function currentTheme(): Theme {
  return themes[settings.get().theme] ?? megaDriveTheme;
}

let renderer: StageRenderer | null = null;
let rendererTheme = '';

export function stageRenderer(): StageRenderer {
  const theme = currentTheme();
  if (!renderer || rendererTheme !== theme.id) {
    renderer = theme.createRenderer();
    rendererTheme = theme.id;
  }
  return renderer;
}

/** Injects the theme's tokens as CSS custom properties plus its stylesheet and fonts. */
export function applyTheme(theme = currentTheme()): void {
  const vars = [
    ...Object.entries(theme.tokens.color).map(([k, v]) => `--color-${k}: ${v};`),
    ...Object.entries(theme.tokens.state).map(([k, v]) => `--state-${k}: ${v};`),
    `--font-display: ${theme.tokens.font.display};`,
    `--font-body: ${theme.tokens.font.body};`,
    ...Object.entries(theme.frames ?? {}).map(([k, v]) => `--frame-${k}: ${v};`),
  ];
  style('theme-tokens').textContent = `:root{${vars.join('')}}\n${theme.css}`;
  for (const url of theme.tokens.fontUrls) {
    if (document.querySelector(`link[href="${url}"]`)) continue;
    document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url }));
  }
  document.documentElement.dataset.theme = theme.id;
  sound.use(theme.sounds);
}

function style(id: string): HTMLStyleElement {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = Object.assign(document.createElement('style'), { id });
    document.head.append(el);
  }
  return el;
}
