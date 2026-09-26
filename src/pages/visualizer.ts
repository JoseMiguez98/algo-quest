import '../ui/layout.css';
import { byId, algorithms } from '../algorithms/registry';
import { interpolate, type AlgorithmContent } from '../core/algorithm';
import { bindHotkeys } from '../core/hotkeys';
import { Player } from '../core/player';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import type { Step } from '../core/types';
import { t } from '../i18n';
import { Stage } from '../scenes/stage';
import { applyTheme, stageRenderer } from '../themes';
import { defaultOptions, initialInput, sceneFor, traceFor } from '../core/session';
import { algorithmIdFromLocation, homeUrl } from '../core/routes';
import { createAppTools, onLanguageOrThemeChange } from '../ui/app-tools';
import { ui } from '../ui/components';
import { clear, h } from '../ui/dom';
import { icon } from '../ui/icons';
import { createCodePanel } from '../ui/panels/code-panel';
import { createHelp } from '../ui/panels/help';
import { createInfoPanel } from '../ui/panels/info-panel';
import { createLegend } from '../ui/panels/legend';
import { createStatsPanel } from '../ui/panels/stats-panel';
import { createTransport } from '../ui/panels/transport';
import { structureViews } from '../ui/structures';

type Tab = 'code' | 'info' | 'stats';

async function mount(root: HTMLElement): Promise<void> {
  applyTheme();
  const def = byId(algorithmIdFromLocation(algorithms[0]!.id));
  if (!def) {
    root.replaceChildren(h('p', {}, 'Unknown algorithm'));
    return;
  }
  const content: AlgorithmContent = (await def.content[settings.get().lang]()).default;
  document.title = `${content.name} · ${t('app.name')}`;
  document.documentElement.lang = settings.get().lang;

  let seed: number | null = null;
  let fixture: string | undefined;
  const options = defaultOptions(def);
  let input = initialInput(def, seed);
  let steps: Step<unknown>[] = [];
  const player = new Player({ durations: def.durations, speed: settings.get().speed });
  const renderer = stageRenderer();

  const stageHost = h('div', { class: `stage${settings.get().scanlines ? ' is-scanlines' : ''}` });
  const stage = new Stage(stageHost, renderer, sceneFor(def, input));
  const narration = h('p', { class: 'narration__text', 'aria-live': 'polite' });
  const narrationBox = h('div', { class: 'narration is-waiting' }, narration, h('span', { class: 'narration__caret', 'aria-hidden': 'true' }, '▼'));
  const code = createCodePanel(def.pseudocode);
  const stats = createStatsPanel(def, structureViews(def.layers ?? [], input));
  const transport = createTransport(player, () => steps);
  const help = createHelp();

  const legend = createLegend(def, content, renderer);
  if (def.category === 'graph') {
    legend.append(
      h('li', {}, h('span', { class: 'legend__swatch', style: 'box-shadow: 0 0 0 2px var(--color-border); background: var(--color-bg)' }), t('legend.start')),
      h('li', {}, h('span', { class: 'legend__swatch', style: 'box-shadow: 0 0 0 2px var(--color-accent); background: var(--color-bg)' }), t('legend.target')),
    );
  }

  const shuffleBtn = ui.button({ label: t('data.shuffle'), icon: 'shuffle', shortcut: 'N', onClick: () => shuffle() });
  const presetBtn = ui.button({ label: t('data.preset'), variant: 'ghost', onClick: () => loadInput(null) });
  const pickers = h('div', { class: 'stage-toolbar__group' });
  for (const o of def.options ?? []) {
    const sel = h('select', { class: 'theme-select', 'aria-label': content.options?.[o.id] ?? o.id },
      ...o.values.map((v) => h('option', { value: String(v), selected: v === options[o.id] }, content.options?.[`${o.id}.${v}`] ?? String(v))));
    sel.addEventListener('change', () => {
      options[o.id] = typeof o.default === 'number' ? Number(sel.value) : sel.value;
      sound.unlock();
      sound.play('ui-select');
      loadInput(seed);
    });
    pickers.append(h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, content.options?.[o.id] ?? o.id), sel));
  }
  if (def.input.kind === 'graph' && def.input.alternatives?.length) {
    const ids = [def.input.fixture, ...def.input.alternatives];
    const sel = h('select', { class: 'theme-select', 'aria-label': t('data.dataset') },
      ...ids.map((id, i) => h('option', { value: id }, i === 0 ? t('data.classic') : t(id.endsWith('negative-cycle') ? 'data.negativeCycle' : 'data.classic'))));
    sel.addEventListener('change', () => {
      fixture = sel.value;
      sound.unlock();
      sound.play('ui-select');
      loadInput(null);
    });
    pickers.append(h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, t('data.dataset')), sel));
  }
  const toolbar = h('div', { class: 'stage-toolbar' },
    stats.live,
    h('div', { class: 'stage-toolbar__group' }, pickers, def.input.kind === 'array' ? shuffleBtn : null, def.input.kind === 'array' ? presetBtn : null),
  );
  const stageWindow = ui.window(null, toolbar, stageHost, stats.strip, narrationBox, legend);
  stageWindow.classList.add('stage-window');

  const tabs: Record<Tab, { button: HTMLButtonElement; panel: HTMLElement }> = {
    code: { button: tabButton('code', t('panel.code')), panel: h('div', { class: 'tab-panel', role: 'tabpanel', id: 'panel-code' }, code.el) },
    info: { button: tabButton('info', t('panel.info')), panel: h('div', { class: 'tab-panel', role: 'tabpanel', id: 'panel-info' }, createInfoPanel(def, content)) },
    stats: { button: tabButton('stats', t('panel.stats')), panel: h('div', { class: 'tab-panel', role: 'tabpanel', id: 'panel-stats' }, stats.el) },
  };
  const selectTab = (tab: Tab) => {
    for (const [k, v] of Object.entries(tabs) as [Tab, (typeof tabs)[Tab]][]) {
      v.button.setAttribute('aria-selected', String(k === tab));
      v.button.tabIndex = k === tab ? 0 : -1;
      v.panel.hidden = k !== tab;
    }
    settings.set({ panel: tab });
  };
  for (const [k, v] of Object.entries(tabs) as [Tab, (typeof tabs)[Tab]][]) v.button.addEventListener('click', () => selectTab(k));
  const side = ui.window(null,
    h('div', { class: 'tabs', role: 'tablist' }, tabs.code.button, tabs.info.button, tabs.stats.button),
    h('div', { class: 'tab-panels' }, tabs.code.panel, tabs.info.panel, tabs.stats.panel),
  );
  side.classList.add('side-window');

  const tools = createAppTools([ui.button({ label: t('help.title'), icon: 'help', iconOnly: true, shortcut: '?', onClick: () => help.toggle() })]);
  const bar = h('header', { class: 'app-bar' },
    h('a', { class: 'ui-button', href: homeUrl() }, icon('menu'), h('span', { class: 'ui-button__label' }, t('nav.menu'))),
    h('div', { class: 'app-bar__title' }, h('h1', { class: 'app-bar__name' }, content.name), h('p', { class: 'app-bar__tagline' }, content.tagline)),
    tools.el,
  );

  clear(root);
  root.append(h('div', { class: 'app' }, bar, stageWindow, transport.el, side), help.el);
  selectTab(settings.get().panel);

  function tabButton(id: Tab, label: string): HTMLButtonElement {
    return h('button', { type: 'button', class: 'tab', role: 'tab', id: `tab-${id}`, 'aria-controls': `panel-${id}` }, label);
  }

  function narrate(step: Step<unknown>): string {
    const tpl = content.narration[step.narration.key];
    return tpl ? interpolate(tpl, step.narration.params) : step.narration.key;
  }

  function render(): void {
    const step = player.current;
    if (!step) return;
    stage.render(step, player.previous, player.progress);
  }

  function onStep(direction: number): void {
    const step = player.current;
    if (!step) return;
    render();
    narration.textContent = player.status === 'idle' && player.index === 0 ? `${narrate(step)} ${t('status.ready')}` : narrate(step);
    code.update(step, player.previous);
    stats.update(step);
    transport.update();
    if (direction === 1) sound.forEvent(step.event, step.tone, def!.cues);
  }

  function loadInput(nextSeed: number | null): void {
    seed = nextSeed;
    input = initialInput(def!, seed, fixture);
    try {
      steps = traceFor(def!, input, options);
    } catch (e) {
      narration.textContent = t('error.input', { msg: (e as Error).message });
      return;
    }
    stage.setScene(sceneFor(def!, input));
    player.load(steps);
    transport.load();
  }

  function shuffle(): void {
    if (def!.input.kind !== 'array') return;
    sound.unlock();
    sound.play('ui-select');
    loadInput((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  }

  player.on('step', ({ direction }) => onStep(direction));
  player.on('frame', () => render());
  player.on('status', (s) => {
    narrationBox.classList.toggle('is-waiting', s !== 'playing');
    transport.update();
  });
  player.on('speed', (s) => {
    settings.set({ speed: s });
    transport.update();
  });

  const unbind = bindHotkeys({
    toggle: () => player.toggle(),
    forward: () => player.stepForward(),
    back: () => player.stepBack(),
    start: () => player.seek(0),
    end: () => player.seek(player.length - 1),
    reset: () => player.reset(),
    shuffle,
    faster: () => player.faster(),
    slower: () => player.slower(),
    mute: tools.toggleMute,
    code: () => selectTab('code'),
    info: () => selectTab('info'),
    help: () => help.toggle(),
    close: () => help.close(),
  });
  const unlock = () => sound.unlock();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  onLanguageOrThemeChange(() => {
    unbind();
    player.destroy();
    stage.destroy();
    void mount(root);
  }, tools.sync);

  loadInput(null);
}

void mount(document.getElementById('app')!);
