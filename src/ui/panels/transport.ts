import type { Player } from '../../core/player';
import { phases } from '../../core/trace';
import type { Step } from '../../core/types';
import { t } from '../../i18n';
import { setButtonIcon, ui } from '../components';
import { clear, h } from '../dom';

/** Transport laid out as a gamepad: d-pad steps/speed, face buttons play/reset. */
export function createTransport(player: Player, steps: () => readonly Step<unknown>[], onAction?: (action: 'step-back' | 'seek') => void) {
  const pad = (b: HTMLButtonElement, slot: string, glyph?: string) => {
    b.dataset.pad = slot;
    if (glyph) b.dataset.glyph = glyph;
    return b;
  };
  const back = pad(ui.button({ label: t('transport.back'), icon: 'back', iconOnly: true, shortcut: '←', onClick: () => { player.stepBack(); onAction?.('step-back'); } }), 'left');
  const forward = pad(ui.button({ label: t('transport.forward'), icon: 'forward', iconOnly: true, shortcut: '→', onClick: () => player.stepForward() }), 'right');
  const faster = pad(ui.button({ label: `${t('transport.speed')} +`, icon: 'plus', iconOnly: true, shortcut: '↑', onClick: () => player.faster() }), 'up');
  const slower = pad(ui.button({ label: `${t('transport.speed')} −`, icon: 'minus', iconOnly: true, shortcut: '↓', onClick: () => player.slower() }), 'down');
  const reset = pad(ui.button({ label: t('transport.reset'), icon: 'reset', iconOnly: true, shortcut: 'R', onClick: () => player.reset() }), 'a', 'A');
  const play = pad(ui.button({ label: t('transport.play'), icon: 'play', iconOnly: true, variant: 'primary', shortcut: 'Space', onClick: () => player.toggle() }), 'start', 'START');

  const range = h('input', { type: 'range', min: 0, max: 0, value: 0, step: 1, 'aria-label': t('transport.timeline') });
  range.addEventListener('input', () => player.seek(Number(range.value)));
  range.addEventListener('change', () => onAction?.('seek'));
  const marks = h('div', { class: 'timeline__marks', 'aria-hidden': 'true' });
  const count = h('span', { class: 'transport__count' });
  const speedValue = h('span', { class: 'transport__speed-value', 'aria-live': 'polite' });

  const el = h('div', { class: 'transport ui-window' },
    h('div', { class: 'pad pad--dpad', role: 'group', 'aria-label': `${t('transport.back')} / ${t('transport.forward')} / ${t('transport.speed')}` }, faster, back, forward, slower),
    h('div', { class: 'transport__center' },
      h('div', { class: 'timeline' }, range, marks),
      h('div', { class: 'transport__readout' }, count, h('span', { class: 'transport__speed' }, t('transport.speed'), ' ', speedValue)),
    ),
    h('div', { class: 'pad pad--face' }, reset, play),
  );

  const load = () => {
    const all = steps();
    range.max = String(Math.max(0, all.length - 1));
    clear(marks);
    const last = Math.max(1, all.length - 1);
    for (const m of phases(all)) marks.append(h('span', { class: 'timeline__mark', style: `left:${(m.index / last) * 100}%` }));
  };

  const update = () => {
    range.value = String(player.index);
    range.style.setProperty('--progress', `${(player.index / Math.max(1, player.length - 1)) * 100}%`);
    count.textContent = t('transport.step', { i: player.index + 1, n: player.length });
    const playing = player.status === 'playing';
    setButtonIcon(play, playing ? 'pause' : 'play', t(playing ? 'transport.pause' : 'transport.play'));
    back.disabled = player.index === 0;
    forward.disabled = player.atEnd;
    speedValue.textContent = `${player.speed}×`;
  };

  return { el, load, update };
}
