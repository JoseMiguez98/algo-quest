import '../ui/layout.css';
import { algorithms } from '../algorithms/registry';
import type { AlgorithmContent, AlgorithmDef, Category } from '../core/algorithm';
import { Player } from '../core/player';
import { algorithmUrl, compareUrl } from '../core/routes';
import { initialInput, sceneFor, traceFor } from '../core/session';
import { settings } from '../core/settings';
import { sound } from '../core/sound';
import type { Step } from '../core/types';
import { t } from '../i18n';
import { Stage } from '../scenes/stage';
import { applyTheme, stageRenderer } from '../themes';
import { createAppTools, onLanguageOrThemeChange } from '../ui/app-tools';
import { ui } from '../ui/components';
import { h } from '../ui/dom';

type Def = AlgorithmDef<never>;
interface Entry {
  def: Def;
  content: AlgorithmContent;
  level: string;
  steps: Step<unknown>[];
}

const WORLDS: Category[] = ['sorting', 'graph'];

async function mount(root: HTMLElement): Promise<void> {
  applyTheme();
  const lang = settings.get().lang;
  document.documentElement.lang = lang;
  document.title = `${t('app.name')} · ${t('app.tagline')}`;
  const entries: Entry[] = await Promise.all(
    algorithms.map(async (def) => {
      const world = WORLDS.indexOf(def.category) + 1;
      const inWorld = algorithms.filter((a) => a.category === def.category);
      const steps = traceFor(def, initialInput(def, null));
      return { def, content: (await def.content[lang]()).default, level: `${world}-${inWorld.indexOf(def) + 1}`, steps };
    }),
  );

  const cleanups: (() => void)[] = [];
  const tools = createAppTools();
  const bar = h('header', { class: 'app-bar home-bar' }, h('span', { class: 'home-bar__brand' }, t('app.name')), tools.el);

  const demo = createDemo(entries);
  cleanups.push(demo.destroy);
  const start = ui.button({ label: t('home.press'), variant: 'primary', onClick: () => {
    sound.unlock();
    sound.play('ui-select');
    grid.querySelector<HTMLElement>('.cart:not([hidden])')?.focus();
    grid.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  } });
  start.classList.add('press-start');
  const hero = h('section', { class: 'hero' },
    h('div', { class: 'hero__copy' },
      h('h1', { class: 'logo', 'aria-label': t('app.name') }, ...t('app.name').split(' ').map((w) => h('span', { class: 'logo__word' }, w))),
      h('p', { class: 'hero__tagline' }, t('app.tagline')),
      h('p', { class: 'hero__intro' }, t('home.intro')),
      start,
      h('p', { class: 'hero__hint' }, t('home.hint')),
    ),
    demo.el,
  );

  let filter: Category | 'all' = 'all';
  let query = '';
  const filters = h('div', { class: 'filters', role: 'group' });
  const filterBtns = (['all', ...WORLDS] as const).map((c) => {
    const b = ui.button({ label: c === 'all' ? t('home.all') : t(`category.${c}`), variant: 'ghost', pressed: c === 'all', onClick: () => {
      filter = c;
      filterBtns.forEach((x, i) => x.setAttribute('aria-pressed', String((['all', ...WORLDS] as const)[i] === c)));
      sound.unlock();
      sound.play('ui-toggle');
      apply();
    } });
    return b;
  });
  const search = h('input', { type: 'search', class: 'search', placeholder: t('home.search'), 'aria-label': t('home.search') });
  search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); apply(); });
  filters.append(...filterBtns, search, h('a', { class: 'ui-button', href: compareUrl() }, h('span', { class: 'ui-button__label' }, `${t('compare.vs')} · ${t('compare.open')}`)));

  const empty = h('div', { class: 'empty', hidden: true });
  const grid = h('div', { class: 'worlds' });
  const cards: { entry: Entry; el: HTMLAnchorElement }[] = [];
  WORLDS.forEach((cat, wi) => {
    const list = h('ul', { class: 'carts' });
    for (const entry of entries.filter((e) => e.def.category === cat)) {
      const el = createCartridge(entry);
      cards.push({ entry, el });
      list.append(h('li', {}, el));
    }
    grid.append(h('section', { class: 'world', 'data-world': cat },
      h('h2', { class: 'world__title' }, h('span', { class: 'world__num' }, t('home.world', { n: wi + 1 })), t(cat === 'sorting' ? 'home.worldSorting' : 'home.worldGraph')),
      list,
    ));
  });

  function apply(): void {
    let shown = 0;
    for (const { entry, el } of cards) {
      const hay = `${entry.content.name} ${entry.def.id} ${entry.content.tagline}`.toLowerCase();
      const visible = (filter === 'all' || entry.def.category === filter) && (!query || hay.includes(query));
      el.parentElement!.hidden = !visible;
      if (visible) shown++;
    }
    grid.querySelectorAll<HTMLElement>('.world').forEach((w) => (w.hidden = !w.querySelector('li:not([hidden])')));
    empty.hidden = shown > 0;
    empty.replaceChildren(h('p', {}, t('home.empty', { q: search.value })), ui.button({ label: t('home.clear'), onClick: () => { search.value = ''; query = ''; apply(); search.focus(); } }));
  }

  grid.addEventListener('keydown', (e) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];
    if (!keys.includes(e.key)) return;
    const visible = cards.map((c) => c.el).filter((el) => !el.parentElement!.hidden);
    const i = visible.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    e.preventDefault();
    const next = neighbour(visible, i, e.key);
    if (next && next !== visible[i]) {
      next.focus();
      sound.play('ui-move');
    }
  });

  const footer = h('footer', { class: 'home-footer' }, h('p', {}, t('home.footer')), h('p', { class: 'home-footer__count' }, t('home.count', { n: entries.length })));
  root.replaceChildren(h('div', { class: 'home' }, bar, hero, ui.window(null, filters, grid, empty), footer));
  for (const w of root.querySelectorAll('.home > .ui-window')) w.classList.add('select-window');

  const unlock = () => sound.unlock();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  onLanguageOrThemeChange(() => {
    cleanups.forEach((c) => c());
    cards.forEach((c) => (c.el as unknown as { cleanup?: () => void }).cleanup?.());
    void mount(root);
  }, tools.sync);
}

/** Picks the card visually closest in the arrow's direction, so navigation works for any column count. */
function neighbour(items: HTMLElement[], i: number, key: string): HTMLElement | undefined {
  const r = items[i]!.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  let best: HTMLElement | undefined;
  let bestScore = Infinity;
  items.forEach((el, j) => {
    if (j === i) return;
    const o = el.getBoundingClientRect();
    const dx = o.left + o.width / 2 - cx;
    const dy = o.top + o.height / 2 - cy;
    const ok = key === 'ArrowRight' ? dx > 4 && Math.abs(dy) < r.height / 2 : key === 'ArrowLeft' ? dx < -4 && Math.abs(dy) < r.height / 2 : key === 'ArrowDown' ? dy > 4 : dy < -4;
    if (!ok) return;
    const score = key === 'ArrowRight' || key === 'ArrowLeft' ? Math.abs(dx) : Math.abs(dy) * 4 + Math.abs(dx);
    if (score < bestScore) { bestScore = score; best = el; }
  });
  if (!best && (key === 'ArrowRight' || key === 'ArrowLeft')) best = items[key === 'ArrowRight' ? i + 1 : i - 1];
  return best;
}

function createCartridge(entry: Entry): HTMLAnchorElement {
  const { def, content, level, steps } = entry;
  const screen = h('div', { class: 'cart__screen', 'aria-hidden': 'true' });
  const tr = def.traits;
  const chips = h('div', { class: 'cart__chips' },
    ui.chip(def.complexity.average, 'info'),
    tr.stable !== undefined ? ui.chip(t(tr.stable ? 'trait.stable' : 'trait.unstable'), tr.stable ? 'good' : 'default') : null,
    tr.optimal !== undefined ? ui.chip(t(tr.optimal ? 'trait.optimal' : 'trait.notOptimal'), tr.optimal ? 'good' : 'warn') : null,
    tr.negativeWeights ? ui.chip(t('trait.negative'), 'info') : null,
  );
  const el = h('a', { class: 'cart', href: algorithmUrl(def), 'data-id': def.id },
    h('span', { class: 'cart__level' }, level),
    screen,
    h('span', { class: 'cart__label' }, h('span', { class: 'cart__name' }, content.name), h('span', { class: 'cart__tagline' }, content.tagline), chips),
  );
  const input = initialInput(def, null);
  let stage: Stage | null = null;
  let player: Player | null = null;
  const still = steps[Math.floor(steps.length * 0.45)] ?? steps[0]!;
  requestAnimationFrame(() => {
    stage = new Stage(screen, stageRenderer(), sceneFor(def, input));
    stage.setLabel(content.name);
    stage.render(still, undefined, 1);
  });
  const play = () => {
    if (!stage || player) return;
    player = new Player({ durations: def.durations, speed: 4 });
    player.on('step', () => stage!.render(player!.current!, player!.previous, player!.progress));
    player.on('frame', () => stage!.render(player!.current!, player!.previous, player!.progress));
    player.load(steps);
    player.seek(Math.floor(steps.length * 0.2));
    player.play();
  };
  const stop = () => {
    player?.destroy();
    player = null;
    stage?.render(still, undefined, 1);
  };
  el.addEventListener('mouseenter', play);
  el.addEventListener('focus', play);
  el.addEventListener('mouseleave', () => document.activeElement !== el && stop());
  el.addEventListener('blur', stop);
  el.addEventListener('click', () => sound.play('ui-select'));
  (el as unknown as { cleanup: () => void }).cleanup = () => { stop(); stage?.destroy(); };
  return el;
}

/** Arcade "attract mode": plays random algorithms back to back behind the title. */
function createDemo(entries: Entry[]) {
  const screen = h('div', { class: 'demo__screen' });
  const caption = h('p', { class: 'demo__caption' });
  const el = h('div', { class: 'demo', 'aria-hidden': 'true' }, h('span', { class: 'demo__badge' }, t('home.demo')), screen, caption);
  let stage: Stage | null = null;
  const player = new Player({ speed: 2 });
  let timer = 0;
  let order = [...entries].sort(() => Math.random() - 0.5);
  let k = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const next = () => {
    if (k >= order.length) { order = [...entries].sort(() => Math.random() - 0.5); k = 0; }
    const e = order[k++]!;
    const input = initialInput(e.def, null);
    if (!stage) stage = new Stage(screen, stageRenderer(), sceneFor(e.def, input));
    else stage.setScene(sceneFor(e.def, input));
    stage.setLabel(`${t('home.demo')}: ${e.content.name}`);
    caption.textContent = `${e.level} · ${e.content.name}`;
    player.load(e.steps);
    if (reduced) {
      player.seek(e.steps.length - 1);
      timer = window.setTimeout(next, 4000);
    } else player.play();
  };
  player.on('step', () => player.current && stage?.render(player.current, player.previous, player.progress));
  player.on('frame', () => player.current && stage?.render(player.current, player.previous, player.progress));
  player.on('status', (s) => { if (s === 'ended') timer = window.setTimeout(next, 1600); });
  requestAnimationFrame(next);
  return { el, destroy: () => { clearTimeout(timer); player.destroy(); stage?.destroy(); } };
}

void mount(document.getElementById('app')!);
