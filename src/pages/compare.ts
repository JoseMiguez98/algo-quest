import '../ui/layout.css';
import { algorithms, byId } from '../algorithms/registry';
import type { GraphInput, GraphState } from '../algorithms/graph/types';
import { cheapestCost } from '../algorithms/graph/model';
import { interpolate, type AlgorithmContent, type AlgorithmDef, type Category } from '../core/algorithm';
import { mazeFor, mergedArraySpec, pairSteps, randomArray, sharedGraph, type CompareMode, type Pair } from '../core/compare';
import { bindHotkeys } from '../core/hotkeys';
import { Player } from '../core/player';
import { algorithmUrl, homeUrl } from '../core/routes';
import { defaultOptions, sceneFor, traceFor } from '../core/session';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import type { Step } from '../core/types';
import { has, t } from '../i18n';
import { Stage } from '../scenes/stage';
import { applyTheme, stageRenderer } from '../themes';
import { createAppTools, onLanguageOrThemeChange } from '../ui/app-tools';
import { ui } from '../ui/components';
import { clear, h } from '../ui/dom';
import { icon } from '../ui/icons';
import { createHelp } from '../ui/panels/help';
import { createTransport } from '../ui/panels/transport';

type Def = AlgorithmDef<never>;

interface Fighter {
  def: Def;
  content: AlgorithmContent;
  steps: Step<unknown>[];
  stage: Stage;
  narration: HTMLElement;
  counters: HTMLElement;
  badge: HTMLElement;
  el: HTMLElement;
  last: number;
}

const DEFAULTS: Record<Category, [string, string]> = { sorting: ['bubble-sort', 'quick-sort'], graph: ['dijkstra', 'a-star'] };

async function mount(root: HTMLElement): Promise<void> {
  applyTheme();
  const lang = settings.get().lang;
  document.documentElement.lang = lang;
  document.title = `${t('compare.title')} · ${t('app.name')}`;

  const q = new URLSearchParams(location.search);
  let a = byId(q.get('a') ?? '') ?? byId(DEFAULTS.sorting[0])!;
  let b = byId(q.get('b') ?? '') ?? algorithms.find((x) => x.category === a.category && x.id !== a.id)!;
  if (b.category !== a.category) b = byId(DEFAULTS[a.category].find((id) => id !== a.id)!)!;
  let mode: CompareMode = q.get('mode') === 'sync' ? 'sync' : 'race';
  let seed = 1;
  let useMaze = false;
  let current: unknown = null;

  const player = new Player({ speed: settings.get().speed });
  let pairs: Step<Pair>[] = [];
  const transport = createTransport(player as Player, () => pairs as Step<unknown>[]);
  const help = createHelp();
  const tools = createAppTools([ui.button({ label: t('help.title'), icon: 'help', iconOnly: true, shortcut: '?', onClick: () => help.toggle() })]);
  const bar = h('header', { class: 'app-bar' },
    h('a', { class: 'ui-button', href: homeUrl() }, icon('menu'), h('span', { class: 'ui-button__label' }, t('nav.menu'))),
    h('div', { class: 'app-bar__title' }, h('h1', { class: 'app-bar__name' }, t('compare.title')), h('p', { class: 'app-bar__tagline' }, t('compare.subtitle'))),
    tools.el,
  );

  const contents = new Map<string, AlgorithmContent>();
  await Promise.all(algorithms.map(async (d) => contents.set(d.id, (await d.content[lang]()).default)));
  const name = (d: Def) => contents.get(d.id)!.name;

  const catBtns = (['sorting', 'graph'] as Category[]).map((c) => ui.button({ label: t(`category.${c}`), variant: 'ghost', pressed: a.category === c, onClick: () => {
    if (a.category === c) return;
    a = byId(DEFAULTS[c][0])!;
    b = byId(DEFAULTS[c][1])!;
    sound.play('ui-toggle');
    rebuild();
  } }));
  const select = (value: Def, onChange: (d: Def) => void, label: string) => {
    const sel = h('select', { class: 'theme-select fighter-select', 'aria-label': label },
      ...algorithms.filter((d) => d.category === a.category).map((d) => h('option', { value: d.id, selected: d.id === value.id }, name(d))));
    sel.addEventListener('change', () => { onChange(byId(sel.value)!); sound.play('ui-select'); rebuild(); });
    return sel;
  };
  const modeBtns = (['race', 'sync'] as CompareMode[]).map((m) => ui.button({ label: t(m === 'race' ? 'compare.race' : 'compare.sync'), variant: 'ghost', pressed: mode === m, onClick: () => {
    mode = m;
    modeBtns.forEach((btn, i) => btn.setAttribute('aria-pressed', String(['race', 'sync'][i] === m)));
    modeHint.textContent = t(m === 'race' ? 'compare.raceHint' : 'compare.syncHint');
    sound.play('ui-toggle');
    load();
  } }));
  const modeHint = h('p', { class: 'edit-hint' }, t(mode === 'race' ? 'compare.raceHint' : 'compare.syncHint'));
  const dataBtn = ui.button({ label: t('data.shuffle'), icon: 'shuffle', shortcut: 'N', onClick: () => newData() });
  const warnings = h('div', { class: 'edit-warnings', 'aria-live': 'polite' });
  const setup = ui.window(null, h('div', { class: 'compare-setup' },
    h('div', { class: 'filters', role: 'group' }, ...catBtns),
    h('div', { class: 'versus' }, h('span', { class: 'versus__slot' }), h('span', { class: 'versus__vs', 'aria-hidden': 'true' }, t('compare.vs')), h('span', { class: 'versus__slot' })),
    h('div', { class: 'compare-setup__row' }, h('span', { class: 'picker__label' }, t('compare.mode')), h('div', { class: 'filters' }, ...modeBtns), dataBtn),
    modeHint,
    warnings,
  ));
  setup.classList.add('setup-window');
  const slots = setup.querySelectorAll('.versus__slot');

  const arena = h('div', { class: 'arena' });
  const results = ui.window(t('compare.results'));
  results.classList.add('results-window');
  const app = h('div', { class: 'compare' }, bar, setup, arena, transport.el, results);
  clear(root);
  root.append(app, help.el);

  let fighters: Fighter[] = [];

  function fighter(def: Def, slot: string): Fighter {
    const host = h('div', { class: `stage${settings.get().scanlines ? ' is-scanlines' : ''}` });
    const narration = h('p', { class: 'narration__text', 'aria-live': 'off' });
    const counters = h('dl', { class: 'live-counters' });
    const badge = ui.chip(`✓ ${t('compare.finished')}`, 'good');
    badge.hidden = true;
    const el = ui.window(null,
      h('div', { class: 'fighter__head' }, ui.chip(slot, 'warn'), h('a', { class: 'fighter__name', href: algorithmUrl(def) }, name(def)), badge),
      counters,
      host,
      h('div', { class: 'narration' }, narration),
    );
    el.classList.add('fighter');
    const stage = new Stage(host, stageRenderer(), sceneFor(def, []));
    stage.setLabel(`${slot}: ${name(def)}`);
    return { def, content: contents.get(def.id)!, steps: [], stage, narration, counters, badge, el, last: -1 };
  }

  function rebuild(): void {
    fighters.forEach((f) => f.stage.destroy());
    catBtns.forEach((btn, i) => btn.setAttribute('aria-pressed', String(['sorting', 'graph'][i] === a.category)));
    slots[0]!.replaceChildren(select(a, (d) => (a = d), t('compare.a')));
    slots[1]!.replaceChildren(select(b, (d) => (b = d), t('compare.b')));
    arena.replaceChildren();
    fighters = [fighter(a, t('compare.a')), fighter(b, t('compare.b'))];
    arena.append(...fighters.map((f) => f.el));
    useMaze = false;
    load();
  }

  function inputs(): unknown {
    if (a.category === 'sorting') {
      const spec = mergedArraySpec(a.input as never, b.input as never);
      return seed === 1 ? spec.preset : randomArray(spec, seed);
    }
    if (useMaze) return mazeFor(seed);
    const choice = sharedGraph(a, b, seed);
    warnings.replaceChildren(...choice.warnings.map((w) => ui.chip(t(w.key, { name: name(w.name) }), 'warn')));
    return choice.input;
  }

  function load(): void {
    if (a.category === 'sorting') warnings.replaceChildren();
    const input = inputs();
    current = input;
    for (const f of fighters) {
      f.steps = traceFor(f.def, structuredClone(input), defaultOptions(f.def));
      const maxValue = a.category === 'sorting' ? mergedArraySpec(a.input as never, b.input as never).max : undefined;
      f.stage.setScene(sceneFor(f.def, structuredClone(input), { maxValue }), false);
      f.last = -1;
    }
    pairs = pairSteps(fighters[0]!.steps, fighters[1]!.steps, mode);
    history.replaceState(null, '', `${location.pathname}?a=${a.id}&b=${b.id}${mode === 'sync' ? '&mode=sync' : ''}`);
    dataBtn.hidden = a.category === 'graph' && [a, b].some((d) => (d.input as { gridOnly?: boolean }).gridOnly);
    player.load(pairs as Step<unknown>[]);
    transport.load();
  }

  function newData(): void {
    sound.unlock();
    sound.play('ui-select');
    seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
    if (a.category === 'graph') {
      const gridOk = [a, b].every((d) => !(d.input as { negativeWeights?: boolean }).negativeWeights && !(d.input as { maxNodes?: number }).maxNodes);
      useMaze = gridOk;
      if (!gridOk) seed = 1;
    }
    load();
  }

  function narrate(f: Fighter, s: Step<unknown>): string {
    const tpl = f.content.narration[s.narration.key];
    return tpl ? interpolate(tpl, s.narration.params) : s.narration.key;
  }

  function render(): void {
    const cur = player.current as Step<Pair> | undefined;
    if (!cur) return;
    const prev = player.previous as Step<Pair> | undefined;
    const sides = [cur.state.a, cur.state.b];
    const prevSides = [prev?.state.a, prev?.state.b];
    fighters.forEach((f, i) => f.stage.render(sides[i]!, prevSides[i] === sides[i] ? undefined : prevSides[i], player.progress));
  }

  function onStep(direction: number): void {
    const cur = player.current as Step<Pair> | undefined;
    if (!cur) return;
    render();
    const idx = [cur.state.aIndex, cur.state.bIndex];
    fighters.forEach((f, i) => {
      const s = i === 0 ? cur.state.a : cur.state.b;
      f.narration.textContent = narrate(f, s);
      f.counters.replaceChildren(...f.def.counters.slice(0, 3).map((c) => h('div', {}, h('dt', {}, has(`counter.${c}`) ? t(`counter.${c}` as never) : c), h('dd', {}, String(s.counters[c] ?? 0).padStart(3, '0')))));
      const done = idx[i] === f.steps.length - 1;
      f.badge.hidden = !done;
      f.el.classList.toggle('is-done', done);
      if (direction === 1 && idx[i] !== f.last) sound.forEvent(s.event, s.tone, f.def.cues);
      f.last = idx[i]!;
    });
    transport.update();
    renderResults(cur.state);
  }

  function renderResults(p: Pair): void {
    const [fa, fb] = fighters as [Fighter, Fighter];
    const keys = [...new Set([...fa.def.counters, ...fb.def.counters])];
    const rows: [string, number | null, number | null, string?, string?][] = keys.map((k) => [has(`counter.${k}`) ? t(`counter.${k}` as never) : k, p.a.counters[k] ?? null, p.b.counters[k] ?? null]);
    rows.push([t('compare.steps'), p.aIndex + 1, p.bIndex + 1]);
    if (a.category === 'graph') {
      const input = current as GraphInput;
      const cost = (s: Step<unknown>) => {
        const st = s.state as GraphState<{ negativeCycle?: unknown }>;
        if (st.extra && (st.extra as { negativeCycle?: unknown }).negativeCycle) return [null, t('compare.cycle')] as const;
        return st.path ? ([cheapestCost(input.graph, st.path), undefined] as const) : ([null, s.event === 'done' ? t('compare.noPath') : '—'] as const);
      };
      const [ca, ta] = cost(p.a);
      const [cb, tb] = cost(p.b);
      rows.push([t('compare.pathCost'), ca, cb, ta, tb]);
    }
    const table = h('table', { class: 'results' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, t('compare.metric')), h('th', { scope: 'col' }, name(fa.def)), h('th', { scope: 'col' }, name(fb.def)))),
      h('tbody', {}, ...rows.map(([label, va, vb, ta, tb]) => {
        const better = va !== null && vb !== null && va !== vb ? (va < vb ? 0 : 1) : -1;
        return h('tr', {}, h('th', { scope: 'row' }, label),
          h('td', { class: better === 0 ? 'is-better' : undefined }, ta ?? (va === null ? '—' : String(va))),
          h('td', { class: better === 1 ? 'is-better' : undefined }, tb ?? (vb === null ? '—' : String(vb))));
      })),
    );
    results.replaceChildren(h('h2', { class: 'ui-window__title' }, t('compare.results')), table, h('p', { class: 'edit-hint' }, t('compare.lower')));
  }

  player.on('step', ({ direction }) => onStep(direction));
  player.on('frame', () => render());
  player.on('status', () => transport.update());
  player.on('speed', (s) => { settings.set({ speed: s }); transport.update(); });

  const unbind = bindHotkeys({
    toggle: () => player.toggle(),
    forward: () => player.stepForward(),
    back: () => player.stepBack(),
    start: () => player.seek(0),
    end: () => player.seek(player.length - 1),
    reset: () => player.reset(),
    shuffle: newData,
    faster: () => player.faster(),
    slower: () => player.slower(),
    mute: tools.toggleMute,
    help: () => help.toggle(),
    close: () => help.close(),
  });
  const unlock = () => sound.unlock();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  onLanguageOrThemeChange(() => { unbind(); player.destroy(); fighters.forEach((f) => f.stage.destroy()); void mount(root); }, tools.sync);

  rebuild();
}

void mount(document.getElementById('app')!);
