import '../ui/layout.css';
import { byId, algorithms } from '../algorithms/registry';
import { interpolate, type AlgorithmContent } from '../core/algorithm';
import { track, trackPage } from '../core/analytics';
import { bindHotkeys } from '../core/hotkeys';
import { Player } from '../core/player';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import type { Step } from '../core/types';
import { t } from '../i18n';
import { Stage } from '../scenes/stage';
import { applyTheme, stageRenderer } from '../themes';
import { defaultOptions, initialInput, sceneFor, traceFor } from '../core/session';
import { algorithmIdFromLocation, compareUrl, homeUrl } from '../core/routes';
import { createAppTools, onLanguageOrThemeChange } from '../ui/app-tools';
import { setButtonIcon, ui } from '../ui/components';
import { decodeState, encodeState } from '../playground/url-state';
import type { Editor } from '../playground/editor';
import { createArrayEditor } from '../playground/array-editor';
import { createGraphEditor } from '../playground/graph-editor';
import type { GraphInput } from '../algorithms/graph/types';
import { clear, h } from '../ui/dom';
import { mountDesktopHint } from '../ui/desktop-hint';
import { createSiteFooter } from '../ui/site-footer';
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
  trackPage(`/${def.category}/${def.id}/`);
  const ev = (name: string) => track(`algo/${def.id}/${name}`);

  let seed: number | null = null;
  let fixture: string | undefined;
  const shared = decodeState(def, location.search);
  const options = { ...defaultOptions(def), ...shared.options };
  let custom: unknown | null = shared.input ?? null;
  let input = custom ?? initialInput(def, seed);
  let editing = false;
  let editor: Editor | null = null;
  let steps: Step<unknown>[] = [];
  const player = new Player({ durations: def.durations, speed: settings.get().speed });
  const renderer = stageRenderer();

  const stageHost = h('div', { class: `stage${settings.get().scanlines ? ' is-scanlines' : ''}` });
  const stage = new Stage(stageHost, renderer, sceneFor(def, input));
  stage.setLabel(`${content.name}: ${content.tagline}`);
  const narration = h('p', { class: 'narration__text', 'aria-live': 'polite' });
  const narrationBox = h('div', { class: 'narration is-waiting' }, narration, h('span', { class: 'narration__caret', 'aria-hidden': 'true' }, '▼'));
  const code = createCodePanel(def.pseudocode);
  const stats = createStatsPanel(def, structureViews(def.layers ?? [], () => input));
  const transport = createTransport(player, () => steps, ev);
  const help = createHelp();

  const legend = createLegend(def, content, renderer);
  if (def.category === 'graph') {
    legend.append(
      h('li', {}, h('span', { class: 'legend__swatch', style: 'box-shadow: 0 0 0 2px var(--color-border); background: var(--color-bg)' }), t('legend.start')),
      h('li', {}, h('span', { class: 'legend__swatch', style: 'box-shadow: 0 0 0 2px var(--color-accent); background: var(--color-bg)' }), t('legend.target')),
    );
  }

  const shuffleBtn = ui.button({ label: t('data.shuffle'), icon: 'shuffle', shortcut: 'N', onClick: () => shuffle() });
  const presetBtn = ui.button({ label: t('data.preset'), variant: 'ghost', onClick: () => { custom = null; loadInput(null); } });
  const editBtn = ui.button({ label: t('edit.start'), icon: 'edit', shortcut: 'E', onClick: () => toggleEdit() });
  const shareBtn = ui.button({ label: t('edit.share'), icon: 'link', iconOnly: true, onClick: () => share() });
  const editPanel = h('div', { class: 'edit-panel', hidden: true });
  const compareLink = h('a', { class: 'ui-button', href: compareUrl(def.id) }, h('span', { class: 'ui-button__label' }, t('compare.open')));
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
      custom = null;
      sound.unlock();
      sound.play('ui-select');
      loadInput(null);
    });
    pickers.append(h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, t('data.dataset')), sel));
  }
  const toolbar = h('div', { class: 'stage-toolbar' },
    stats.live,
    h('div', { class: 'stage-toolbar__group' }, pickers, def.input.kind === 'array' ? shuffleBtn : null, def.input.kind === 'array' ? presetBtn : null, editBtn, shareBtn, compareLink),
  );
  const stageWindow = ui.window(null, toolbar, editPanel, stageHost, stats.strip, narrationBox, legend);
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
  for (const [k, v] of Object.entries(tabs) as [Tab, (typeof tabs)[Tab]][]) v.button.addEventListener('click', () => { selectTab(k); track(`panel/${k}`); });
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

  const app = h('div', { class: 'app' }, bar, stageWindow, transport.el, side);
  clear(root);
  root.append(app, createSiteFooter(), help.el);
  mountDesktopHint(root);
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
    input = custom ?? initialInput(def!, seed, fixture);
    syncUrl();
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
    if (def!.input.kind !== 'array' || editing) return;
    sound.unlock();
    sound.play('ui-select');
    custom = null;
    loadInput((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  }

  function syncUrl(): void {
    const q = new URLSearchParams(location.search);
    ['d', 'g', 'o'].forEach((k) => q.delete(k));
    const state = new URLSearchParams(encodeState(def!, input, options));
    if (!custom) { state.delete('d'); state.delete('g'); }
    state.forEach((v, k) => q.set(k, v));
    const qs = q.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
  }

  function share(): void {
    sound.unlock();
    custom ??= input;
    syncUrl();
    ev('share');
    void navigator.clipboard?.writeText(location.href).then(() => {
      sound.play('ui-select');
      narration.textContent = t('edit.copied');
    });
  }

  function preview(): void {
    if (!editor) return;
    const value = editor.value();
    input = value;
    stage.setScene(sceneFor(def!, value), false);
    try {
      const first = def!.run(value as never, options)[Symbol.iterator]().next().value as Step<unknown> | undefined;
      if (first) stage.render(editor.decorate(first), undefined, 1);
      narration.textContent = t('edit.title');
    } catch (e) {
      narration.textContent = t('error.input', { msg: (e as Error).message });
    }
  }

  function toggleEdit(): void {
    sound.unlock();
    if (!editing) {
      player.pause();
      editing = true;
      const host = { changed: preview, rebuilt: preview };
      editor = def!.input.kind === 'array'
        ? createArrayEditor(def!.input, input as number[], host)
        : createGraphEditor(def!, input as GraphInput, host);
      editPanel.replaceChildren(editor.tools);
      editPanel.hidden = false;
      app.classList.add('is-editing');
      transport.el.inert = true;
      setButtonIcon(editBtn, 'play', t('edit.done'));
      editBtn.classList.add('ui-button--primary');
      editor.attach(stage);
      ev('edit');
      sound.play('ui-select');
      preview();
      return;
    }
    editing = false;
    custom = editor!.value();
    editor!.detach();
    editor = null;
    editPanel.hidden = true;
    app.classList.remove('is-editing');
    transport.el.inert = false;
    setButtonIcon(editBtn, 'edit', t('edit.start'));
    editBtn.classList.remove('ui-button--primary');
    sound.play('ui-back');
    loadInput(seed);
  }

  player.on('step', ({ direction }) => onStep(direction));
  player.on('frame', () => render());
  player.on('status', (s) => {
    if (s === 'playing') ev('play');
    if (s === 'ended') ev('complete');
    narrationBox.classList.toggle('is-waiting', s !== 'playing');
    transport.update();
  });
  player.on('speed', (s) => {
    settings.set({ speed: s });
    transport.update();
  });

  const idle = (fn: () => void) => () => { if (!editing) fn(); };
  const unbind = bindHotkeys({
    toggle: idle(() => player.toggle()),
    forward: idle(() => player.stepForward()),
    back: idle(() => { player.stepBack(); ev('step-back'); }),
    start: idle(() => { player.seek(0); ev('seek'); }),
    end: idle(() => { player.seek(player.length - 1); ev('seek'); }),
    reset: idle(() => player.reset()),
    shuffle,
    faster: idle(() => player.faster()),
    slower: idle(() => player.slower()),
    edit: () => toggleEdit(),
    mute: tools.toggleMute,
    code: () => { selectTab('code'); track('panel/code'); },
    info: () => { selectTab('info'); track('panel/info'); },
    help: () => help.toggle(),
    close: () => (help.isOpen ? help.close() : editing ? toggleEdit() : undefined),
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
