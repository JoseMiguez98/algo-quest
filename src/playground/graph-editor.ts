import { findEdge, gridGraph } from '../algorithms/graph/model';
import type { GraphInput, GraphState } from '../algorithms/graph/types';
import type { AlgorithmDef, GraphInputSpec } from '../core/algorithm';
import { mulberry32 } from '../core/rng';
import { sound } from '../core/sound';
import { defaultWeight, generatorsFor, gridInput, nextLabel, randomGraph, withNegativeCycle, type GraphGenerator } from '../data/generators';
import { legacyGraphs } from '../data/legacy-graphs';
import { t } from '../i18n';
import type { GraphScene } from '../scenes/graph';
import type { Stage } from '../scenes/stage';
import { ui } from '../ui/components';
import { h } from '../ui/dom';
import type { Editor, EditorHost } from './editor';

type Tool = 'move' | 'node' | 'edge' | 'erase' | 'start' | 'target' | 'wall';

const clone = (i: GraphInput): GraphInput => structuredClone(i);

export function createGraphEditor(def: AlgorithmDef<never>, initial: GraphInput, host: EditorHost): Editor {
  const spec = def.input as GraphInputSpec;
  let input = clone(initial);
  let stage: Stage | null = null;
  let tool: Tool = input.graph.grid ? 'wall' : 'move';
  let selectedNode: number | null = null;
  let selectedEdge: number | null = null;
  let dragNode: number | null = null;
  let paint: boolean | null = null;

  const toolRow = h('div', { class: 'tool-row', role: 'radiogroup', 'aria-label': t('edit.title') });
  const weight = h('input', { type: 'number', class: 'search weight-input', step: 1, disabled: true, 'aria-label': t('edit.weight') });
  const weightPicker = h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, t('edit.weight')), weight);
  const gens = generatorsFor(spec);
  const genSelect = h('select', { class: 'theme-select', 'aria-label': t('edit.generator') },
    h('option', { value: 'classic' }, t('gen.classic')), ...gens.map((g) => h('option', { value: g }, t(`gen.${g}` as never))));
  const warnings = h('div', { class: 'edit-warnings', 'aria-live': 'polite' });
  const hint = h('p', { class: 'edit-hint' });
  const tools = h('div', { class: 'edit-tools' },
    toolRow,
    weightPicker,
    h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, t('edit.generator')), genSelect),
    ui.button({ label: t('edit.generate'), icon: 'shuffle', onClick: () => generate(genSelect.value as GraphGenerator | 'classic') }),
    warnings,
    hint,
  );

  function renderTools(): void {
    const list: Tool[] = input.graph.grid ? ['wall', 'start', 'target'] : ['move', 'node', 'edge', 'erase', 'start', 'target'];
    if (!list.includes(tool)) tool = list[0]!;
    toolRow.replaceChildren(...list.map((id) => {
      const b = ui.button({ label: t(`tool.${id}` as never), pressed: tool === id, onClick: () => { tool = id; selectedNode = null; sound.play('ui-toggle'); renderTools(); host.changed(); } });
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(tool === id));
      return b;
    }));
    weightPicker.hidden = !!input.graph.grid || !spec.weighted;
    hint.textContent = t(input.graph.grid ? 'edit.hintGrid' : 'edit.hintGraph');
  }

  function validate(): void {
    const w: string[] = [];
    const g = input.graph;
    if (spec.maxNodes && g.nodes.length > spec.maxNodes) w.push(t('edit.tooMany', { n: spec.maxNodes }));
    if (def.id === 'dijkstra' && g.edges.some((e) => e.weight < 0)) w.push(t('edit.negative'));
    warnings.replaceChildren(...w.map((m) => ui.chip(m, 'warn')));
  }

  function changed(rebuild = false): void {
    validate();
    if (rebuild) host.rebuilt();
    else host.changed();
  }

  function generate(kind: GraphGenerator | 'classic'): void {
    const rng = mulberry32((Math.random() * 2 ** 32) >>> 0);
    sound.play('ui-select');
    if (kind === 'classic') {
      const f = legacyGraphs[spec.fixture]!;
      input = clone({ graph: f.graph, start: f.start, target: f.target });
    } else if (kind === 'random') input = randomGraph(spec, rng);
    else if (kind === 'negative-cycle') input = withNegativeCycle(spec, rng);
    else input = gridInput(kind, rng);
    if (!spec.needsTarget && legacyGraphs[spec.fixture]?.target === null) input.target = null;
    selectedNode = selectedEdge = null;
    renderTools();
    syncWeight();
    changed(true);
  }

  function syncWeight(): void {
    weight.disabled = selectedEdge === null;
    weight.value = selectedEdge === null ? '' : String(input.graph.edges[selectedEdge]!.weight);
    weight.min = spec.negativeWeights ? '-20' : '1';
  }
  weight.addEventListener('input', () => {
    if (selectedEdge === null || weight.value === '') return;
    const v = Math.round(Number(weight.value));
    const min = spec.negativeWeights ? -20 : 1;
    input.graph.edges[selectedEdge]!.weight = Math.max(min, Math.min(99, v));
    changed();
  });

  const scene = () => stage?.currentScene as GraphScene | undefined;

  function removeNode(u: number): void {
    const g = input.graph;
    if (g.nodes.length <= 2 || u === input.start || u === input.target) { sound.play('error'); return; }
    g.nodes.splice(u, 1);
    g.edges = g.edges.filter((e) => e.from !== u && e.to !== u).map((e) => ({ ...e, from: e.from > u ? e.from - 1 : e.from, to: e.to > u ? e.to - 1 : e.to }));
    if (input.start > u) input.start--;
    if (input.target !== null && input.target > u) input.target--;
    sound.play('reject');
  }

  function setWalls(cell: number, wall: boolean): void {
    const grid = input.graph.grid!;
    if (cell === input.start || cell === input.target) return;
    const walls = new Set(grid.walls);
    if (wall === walls.has(cell)) return;
    if (wall) walls.add(cell);
    else walls.delete(cell);
    input.graph = gridGraph(grid.cols, grid.rows, walls);
    sound.play(wall ? 'write' : 'reject');
    changed(true);
  }

  const onDown = (e: PointerEvent) => {
    const sc = scene();
    if (!stage || !sc) return;
    const p = stage.toLogical(e.clientX, e.clientY);
    const g = input.graph;
    if (g.grid) {
      const cell = sc.cellAt(p.x, p.y);
      if (cell === null) return;
      const isWall = g.grid.walls.includes(cell);
      if (tool === 'wall') {
        paint = !isWall;
        stage.canvas.setPointerCapture(e.pointerId);
        setWalls(cell, paint);
      } else if (!isWall) {
        if (tool === 'start' && cell !== input.target) input.start = cell;
        if (tool === 'target' && cell !== input.start) input.target = cell;
        sound.play('select');
        changed();
      }
      return;
    }
    const node = sc.nodeAt(p.x, p.y);
    const edge = node === null ? sc.edgeAt(p.x, p.y) : null;
    switch (tool) {
      case 'move':
        if (node !== null) { dragNode = node; stage.canvas.setPointerCapture(e.pointerId); }
        selectedEdge = edge;
        syncWeight();
        if (edge !== null) { sound.play('select'); weight.focus(); }
        changed();
        break;
      case 'node': {
        if (node !== null || (spec.maxNodes && g.nodes.length >= spec.maxNodes)) { sound.play('error'); break; }
        const q = sc.toGraph(p.x, p.y);
        g.nodes.push({ label: nextLabel(g), x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 });
        sound.play('discover');
        changed(true);
        break;
      }
      case 'edge':
        if (edge !== null && node === null) { selectedEdge = edge; syncWeight(); weight.focus(); changed(); break; }
        if (node === null) { selectedNode = null; changed(); break; }
        if (selectedNode === null || selectedNode === node) { selectedNode = node; sound.play('select'); changed(); break; }
        {
          const existing = findEdge(g, selectedNode, node);
          if (existing >= 0) { g.edges.splice(existing, 1); selectedEdge = null; sound.play('reject'); }
          else {
            g.edges.push({ from: selectedNode, to: node, weight: defaultWeight(g, selectedNode, node, spec) });
            selectedEdge = g.edges.length - 1;
            sound.play('swap');
          }
          selectedNode = null;
          syncWeight();
          changed(true);
        }
        break;
      case 'erase':
        if (node !== null) { removeNode(node); selectedEdge = null; syncWeight(); changed(true); }
        else if (edge !== null) { g.edges.splice(edge, 1); selectedEdge = null; syncWeight(); sound.play('reject'); changed(true); }
        break;
      case 'start':
      case 'target':
        if (node === null) break;
        if (tool === 'start' && node !== input.target) input.start = node;
        if (tool === 'target' && node !== input.start) input.target = node;
        sound.play('select');
        changed();
        break;
      case 'wall':
        break;
    }
  };
  const onMove = (e: PointerEvent) => {
    const sc = scene();
    if (!stage || !sc) return;
    const p = stage.toLogical(e.clientX, e.clientY);
    if (input.graph.grid && paint !== null) {
      const cell = sc.cellAt(p.x, p.y);
      if (cell !== null) setWalls(cell, paint);
      return;
    }
    if (dragNode === null) return;
    const q = sc.toGraph(p.x, p.y);
    const n = input.graph.nodes[dragNode]!;
    n.x = Math.round(q.x * 10) / 10;
    n.y = Math.round(q.y * 10) / 10;
    changed();
  };
  const onUp = () => {
    if (dragNode !== null) changed(true);
    dragNode = null;
    paint = null;
  };

  renderTools();
  validate();

  return {
    tools,
    value: () => clone(input),
    decorate(step) {
      const s = step.state as GraphState<unknown>;
      if (selectedNode === null && selectedEdge === null) return step;
      const nodes = s.nodes.slice();
      const edges = s.edges.slice();
      if (selectedNode !== null) nodes[selectedNode] = 'focus';
      if (selectedEdge !== null) edges[selectedEdge] = 'active';
      return { ...step, state: { ...s, nodes, edges } };
    },
    attach(s) {
      stage = s;
      s.canvas.addEventListener('pointerdown', onDown);
      s.canvas.addEventListener('pointermove', onMove);
      s.canvas.addEventListener('pointerup', onUp);
      s.canvas.classList.add('is-editable');
    },
    detach() {
      stage?.canvas.removeEventListener('pointerdown', onDown);
      stage?.canvas.removeEventListener('pointermove', onMove);
      stage?.canvas.removeEventListener('pointerup', onUp);
      stage?.canvas.classList.remove('is-editable');
      stage = null;
    },
  };
}
