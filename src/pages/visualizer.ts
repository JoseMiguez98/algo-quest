import '../ui/layout.css';
import { legacyGraphs } from '../data/legacy-graphs';
import { byId, algorithms } from '../algorithms/registry';
import type { GraphInput } from '../algorithms/graph/types';
import { interpolate, type AlgorithmContent, type AlgorithmDef } from '../core/algorithm';
import { bindHotkeys } from '../core/hotkeys';
import { Player } from '../core/player';
import { mulberry32, randomInt } from '../core/rng';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import { record } from '../core/trace';
import type { Step } from '../core/types';
import { t } from '../i18n';
import { BarsScene } from '../scenes/bars';
import { GraphScene } from '../scenes/graph';
import type { Scene } from '../scenes/scene';
import { Stage } from '../scenes/stage';
import { applyTheme, stageRenderer } from '../themes';
import { setButtonIcon, ui } from '../ui/components';
import { clear, h } from '../ui/dom';
import { icon } from '../ui/icons';
import { createCodePanel } from '../ui/panels/code-panel';
import { createHelp } from '../ui/panels/help';
import { createInfoPanel } from '../ui/panels/info-panel';
import { createLegend } from '../ui/panels/legend';
import { createStatsPanel } from '../ui/panels/stats-panel';
import { createTransport } from '../ui/panels/transport';
import { structureViews } from '../ui/structures';

type Def = AlgorithmDef<never>;
type Tab = 'code' | 'info' | 'stats';

function resolveId(): string {
  const q = new URLSearchParams(location.search).get('algo');
  if (q) return q;
  const parts = location.pathname.split('/').filter(Boolean);
  return parts.at(-1) ?? algorithms[0]!.id;
}

function initialInput(def: Def, seed: number | null): unknown {
  if (def.input.kind === 'array') {
    const spec = def.input;
    if (seed === null) return spec.preset.slice();
    const rng = mulberry32(seed);
    return spec.preset.map(() => randomInt(rng, spec.min, spec.max));
  }
  const f = legacyGraphs[def.input.fixture];
  if (!f) throw new Error(`unknown fixture ${def.input.fixture}`);
  return { graph: f.graph, start: f.start, target: def.input.needsTarget ? f.target : f.target } satisfies GraphInput;
}

function sceneFor(def: Def, input: unknown): Scene<unknown> {
  if (def.scene === 'graph') return new GraphScene(input as GraphInput) as Scene<unknown>;
  const spec = def.input.kind === 'array' ? def.input : null;
  return new BarsScene([], spec?.max) as Scene<unknown>;
}

async function mount(root: HTMLElement): Promise<void> {
  applyTheme();
  const def = byId(resolveId());
  if (!def) {
    root.replaceChildren(h('p', {}, 'Unknown algorithm'));
    return;
  }
  const content: AlgorithmContent = (await def.content[settings.get().lang]()).default;
  document.title = `${content.name} · ${t('app.name')}`;
  document.documentElement.lang = settings.get().lang;

  let seed: number | null = null;
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
  const toolbar = h('div', { class: 'stage-toolbar' },
    stats.live,
    def.input.kind === 'array' ? h('div', { class: 'stage-toolbar__group' }, shuffleBtn, presetBtn) : null,
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

  const soundBtn = ui.button({ label: '', icon: 'sound', iconOnly: true, shortcut: 'M', onClick: () => toggleMute() });
  const volume = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: settings.get().volume, 'aria-label': t('sound.volume') });
  volume.addEventListener('input', () => settings.set({ volume: Number(volume.value), muted: false }));
  const langBtns = (['es', 'en'] as const).map((l) => ui.button({ label: l.toUpperCase(), variant: settings.get().lang === l ? 'default' : 'ghost', pressed: settings.get().lang === l, onClick: () => settings.get().lang !== l && settings.set({ lang: l }) }));
  const bar = h('header', { class: 'app-bar' },
    h('a', { class: 'ui-button', href: import.meta.env.BASE_URL }, icon('menu'), h('span', { class: 'ui-button__label' }, t('nav.menu'))),
    h('div', { class: 'app-bar__title' }, h('h1', { class: 'app-bar__name' }, content.name), h('p', { class: 'app-bar__tagline' }, content.tagline)),
    h('div', { class: 'app-bar__tools' },
      h('div', { class: 'lang-switch', role: 'group', 'aria-label': t('lang.label') }, ...langBtns),
      h('div', { class: 'volume' }, soundBtn, volume),
      ui.button({ label: t('help.title'), icon: 'help', iconOnly: true, shortcut: '?', onClick: () => help.toggle() }),
    ),
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

  function syncSound(): void {
    const { muted } = settings.get();
    setButtonIcon(soundBtn, muted ? 'mute' : 'sound', t(muted ? 'sound.off' : 'sound.on'));
    soundBtn.setAttribute('aria-pressed', String(!muted));
  }

  function toggleMute(): void {
    sound.unlock();
    settings.set({ muted: !settings.get().muted });
    sound.play('ui-toggle');
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
    input = initialInput(def!, seed);
    try {
      steps = record(def!.run(input as never, {}));
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
    mute: toggleMute,
    code: () => selectTab('code'),
    info: () => selectTab('info'),
    help: () => help.toggle(),
    close: () => help.close(),
  });
  const unlock = () => sound.unlock();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  const offSettings = settings.on('change', (s) => {
    syncSound();
    volume.value = String(s.volume);
    if (s.lang !== document.documentElement.lang) {
      unbind();
      offSettings();
      player.destroy();
      stage.destroy();
      void mount(root);
    }
  });

  syncSound();
  loadInput(null);
}

void mount(document.getElementById('app')!);
