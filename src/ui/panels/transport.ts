import type { Player } from '../../core/player';
import { phases } from '../../core/trace';
import type { Step } from '../../core/types';
import { t } from '../../i18n';
import { setButtonIcon, ui } from '../components';
import { clear, h } from '../dom';

export function createTransport(player: Player, steps: () => readonly Step<unknown>[]) {
  const reset = ui.button({ label: t('transport.reset'), icon: 'reset', iconOnly: true, shortcut: 'R', onClick: () => player.reset() });
  const back = ui.button({ label: t('transport.back'), icon: 'back', iconOnly: true, shortcut: '←', onClick: () => player.stepBack() });
  const play = ui.button({ label: t('transport.play'), icon: 'play', iconOnly: true, variant: 'primary', shortcut: 'Space', onClick: () => player.toggle() });
  const forward = ui.button({ label: t('transport.forward'), icon: 'forward', iconOnly: true, shortcut: '→', onClick: () => player.stepForward() });
  const range = h('input', { type: 'range', min: 0, max: 0, value: 0, step: 1, 'aria-label': t('transport.timeline') });
  range.addEventListener('input', () => player.seek(Number(range.value)));
  const marks = h('div', { class: 'timeline__marks', 'aria-hidden': 'true' });
  const count = h('span', { class: 'transport__count', 'aria-live': 'off' });
  const speedValue = h('span', { class: 'transport__speed-value', 'aria-live': 'polite' });
  const slower = ui.button({ label: `${t('transport.speed')} −`, icon: 'minus', iconOnly: true, shortcut: '−', onClick: () => player.slower() });
  const faster = ui.button({ label: `${t('transport.speed')} +`, icon: 'plus', iconOnly: true, shortcut: '+', onClick: () => player.faster() });

  const el = h('div', { class: 'transport ui-window' },
    h('div', { class: 'transport__buttons' }, reset, back, play, forward),
    h('div', { class: 'timeline' }, range, marks),
    count,
    h('div', { class: 'transport__speed', role: 'group', 'aria-label': t('transport.speed') }, slower, speedValue, faster),
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
    count.textContent = `${player.index + 1}/${player.length}`;
    const playing = player.status === 'playing';
    setButtonIcon(play, playing ? 'pause' : 'play', t(playing ? 'transport.pause' : 'transport.play'));
    back.disabled = player.index === 0;
    forward.disabled = player.atEnd;
    speedValue.textContent = `${player.speed}×`;
  };

  return { el, load, update };
}
