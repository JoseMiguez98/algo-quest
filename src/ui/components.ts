import { h } from './dom';
import { icon, type IconName } from './icons';

/**
 * Theme-agnostic component factories. Structure and behaviour live here; themes only style
 * the `ui-*` classes, or replace a factory through `registerComponents`.
 */
export interface ButtonProps {
  label: string;
  icon?: IconName;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'default';
  iconOnly?: boolean;
  shortcut?: string;
  pressed?: boolean;
}

export interface ComponentSet {
  button(p: ButtonProps): HTMLButtonElement;
  window(title: string | null, ...children: (Node | null)[]): HTMLElement;
  chip(text: string, tone?: 'default' | 'good' | 'warn' | 'info'): HTMLElement;
}

const defaults: ComponentSet = {
  button({ label, icon: ic, onClick, variant = 'default', iconOnly, shortcut, pressed }) {
    const b = h('button', {
      type: 'button',
      class: `ui-button ui-button--${variant}${iconOnly ? ' ui-button--icon' : ''}`,
      'aria-label': iconOnly ? label : undefined,
      title: shortcut ? `${label} (${shortcut})` : iconOnly ? label : undefined,
      'aria-pressed': pressed === undefined ? undefined : String(pressed),
      onclick: onClick ? () => onClick() : undefined,
    });
    if (ic) b.append(icon(ic));
    if (!iconOnly) b.append(h('span', { class: 'ui-button__label' }, label));
    return b;
  },
  window(title, ...children) {
    return h('section', { class: 'ui-window' }, title ? h('h2', { class: 'ui-window__title' }, title) : null, ...children);
  },
  chip(text, tone = 'default') {
    return h('span', { class: `ui-chip ui-chip--${tone}` }, text);
  },
};

let active: ComponentSet = defaults;

export const ui = new Proxy({} as ComponentSet, { get: (_, k: keyof ComponentSet) => active[k] });

export function registerComponents(overrides: Partial<ComponentSet>): void {
  active = { ...defaults, ...overrides };
}

export function setButtonIcon(b: HTMLButtonElement, name: IconName, label: string): void {
  b.querySelector('.ui-icon')?.replaceWith(icon(name));
  if (b.classList.contains('ui-button--icon')) b.setAttribute('aria-label', label);
  const l = b.querySelector('.ui-button__label');
  if (l) l.textContent = label;
  b.title = label;
}
