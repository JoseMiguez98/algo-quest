import { euclidean, findEdge, gridGraph, manhattan, type Graph } from '../algorithms/graph/model';
import type { GraphInput } from '../algorithms/graph/types';
import type { ArrayInputSpec, GraphInputSpec } from '../core/algorithm';
import { randomInt, shuffle, type Rng } from '../core/rng';

export type ArrayPreset = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique' | 'all-equal' | 'sorted';
export const ARRAY_PRESETS: ArrayPreset[] = ['random', 'nearly-sorted', 'reversed', 'few-unique', 'all-equal', 'sorted'];

export function arrayPreset(kind: ArrayPreset, n: number, spec: ArrayInputSpec, rng: Rng): number[] {
  const rand = () => randomInt(rng, spec.min, spec.max);
  const sorted = Array.from({ length: n }, rand).sort((a, b) => a - b);
  switch (kind) {
    case 'random': return Array.from({ length: n }, rand);
    case 'sorted': return sorted;
    case 'reversed': return sorted.reverse();
    case 'nearly-sorted': {
      const a = sorted.slice();
      for (let k = 0; n > 1 && k < Math.max(1, Math.floor(n / 6)); k++) {
        const i = randomInt(rng, 0, n - 2);
        [a[i], a[i + 1]] = [a[i + 1]!, a[i]!];
      }
      return a;
    }
    case 'few-unique': {
      const pool = Array.from({ length: 3 }, rand);
      return Array.from({ length: n }, () => pool[randomInt(rng, 0, pool.length - 1)]!);
    }
    case 'all-equal': {
      const v = rand();
      return Array.from({ length: n }, () => v);
    }
  }
}

export type GraphGenerator = 'random' | 'maze' | 'walls' | 'empty-grid' | 'negative-cycle';

export function generatorsFor(spec: GraphInputSpec): GraphGenerator[] {
  if (spec.gridOnly) return ['maze', 'walls', 'empty-grid'];
  const out: GraphGenerator[] = ['random'];
  if (!spec.negativeWeights && !spec.directed) out.push('maze', 'walls', 'empty-grid');
  if (spec.negativeWeights) out.push('negative-cycle');
  return out;
}

const label = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));

/** Weight for a new edge: metric (≥ straight-line distance) so A*'s heuristic stays admissible. */
export function defaultWeight(g: Graph, a: number, b: number, spec: GraphInputSpec, rng?: Rng): number {
  if (!spec.weighted) return 1;
  const base = Math.max(1, Math.ceil(Math.max(euclidean(g, a, b), manhattan(g, a, b) * (g.grid ? 1 : 0))));
  return base + (rng ? randomInt(rng, 0, 2) : 0);
}

export function randomGraph(spec: GraphInputSpec, rng: Rng, n = randomInt(rng, 9, Math.min(14, spec.maxNodes ?? 14))): GraphInput {
  const cols = Math.ceil(Math.sqrt(n * 1.6));
  const cells = shuffle(rng, Array.from({ length: cols * Math.ceil(n / cols + 1) }, (_, i) => i)).slice(0, n).sort((a, b) => a - b);
  const nodes = cells.map((c, i) => ({ label: label(i), x: (c % cols) * 4 + randomInt(rng, 0, 1), y: Math.floor(c / cols) * 4 + randomInt(rng, 0, 1) }));
  const g: Graph = { nodes, edges: [], directed: !!spec.directed };
  const byDistance = (u: number) => nodes.map((_, v) => v).filter((v) => v !== u).sort((a, b) => euclidean(g, u, a) - euclidean(g, u, b));
  const order = shuffle(rng, nodes.map((_, i) => i));
  for (let k = 1; k < order.length; k++) {
    const v = order[k]!;
    const u = byDistance(v).find((x) => order.indexOf(x) < k)!;
    addEdge(g, u, v, spec, rng);
  }
  for (let u = 0; u < n; u++) {
    for (const v of byDistance(u).slice(0, 3)) if (rng() < 0.45 && findEdge(g, u, v) < 0 && findEdge(g, v, u) < 0) addEdge(g, u, v, spec, rng);
  }
  if (spec.negativeWeights) reweightWithPotentials(g, rng);
  const [start, target] = farthestPair(g);
  return { graph: g, start, target: spec.needsTarget || spec.weighted ? target : null };
}

function addEdge(g: Graph, u: number, v: number, spec: GraphInputSpec, rng: Rng): void {
  const [from, to] = g.directed && rng() < 0.5 ? [v, u] : [u, v];
  g.edges.push({ from, to, weight: defaultWeight(g, from, to, spec, rng) });
}

/** w(u,v) = w' + p(u) − p(v): some edges turn negative, yet every cycle keeps its non-negative sum. */
function reweightWithPotentials(g: Graph, rng: Rng): void {
  if (!g.edges.length) return;
  const p = g.nodes.map(() => randomInt(rng, 0, 10));
  const base = g.edges.map((e) => e.weight - 1);
  const reduced = () => g.edges.map((e, i) => base[i]! + p[e.from]! - p[e.to]!);
  if (!reduced().some((w) => w < 0)) {
    const e = g.edges[0]!;
    p[e.to]! += base[0]! + p[e.from]! - p[e.to]! + 2;
  }
  reduced().forEach((w, i) => (g.edges[i]!.weight = w));
}

export function withNegativeCycle(spec: GraphInputSpec, rng: Rng): GraphInput {
  const input = randomGraph({ ...spec, negativeWeights: false }, rng);
  const g = input.graph;
  const cyc = shuffle(rng, g.nodes.map((_, i) => i).filter((i) => i !== input.start)).slice(0, 3);
  cyc.forEach((u, i) => {
    const v = cyc[(i + 1) % cyc.length]!;
    const e = findEdge(g, u, v);
    if (e >= 0) g.edges.splice(e, 1);
    g.edges.push({ from: u, to: v, weight: i === 0 ? -8 : 2 });
  });
  const e = findEdge(g, input.start, cyc[0]!);
  if (e < 0) g.edges.push({ from: input.start, to: cyc[0]!, weight: 3 });
  return input;
}

function farthestPair(g: Graph): [number, number] {
  let best: [number, number] = [0, Math.max(0, g.nodes.length - 1)];
  let d = -1;
  g.nodes.forEach((_, a) => g.nodes.forEach((__, b) => {
    const x = euclidean(g, a, b);
    if (x > d) { d = x; best = [a, b]; }
  }));
  return best[0] <= best[1] ? best : [best[1], best[0]];
}

/** Recursive-backtracker maze on odd cells; returns wall indices for gridGraph. */
export function maze(cols: number, rows: number, rng: Rng): number[] {
  const open = new Set<number>();
  const id = (c: number, r: number) => r * cols + c;
  const stack: [number, number][] = [[0, 0]];
  open.add(0);
  while (stack.length) {
    const [c, r] = stack.at(-1)!;
    const dirs = shuffle(rng, [[2, 0], [-2, 0], [0, 2], [0, -2]] as [number, number][]).filter(([dc, dr]) => {
      const nc = c + dc;
      const nr = r + dr;
      return nc >= 0 && nr >= 0 && nc < cols && nr < rows && !open.has(id(nc, nr));
    });
    if (!dirs.length) { stack.pop(); continue; }
    const [dc, dr] = dirs[0]!;
    open.add(id(c + dc / 2, r + dr / 2));
    open.add(id(c + dc, r + dr));
    stack.push([c + dc, r + dr]);
  }
  return Array.from({ length: cols * rows }, (_, i) => i).filter((i) => !open.has(i));
}

export function gridInput(kind: 'maze' | 'walls' | 'empty-grid', rng: Rng, cols = 15, rows = 9): GraphInput {
  let walls: number[] = [];
  if (kind === 'maze') walls = maze(cols, rows, rng);
  if (kind === 'walls') walls = Array.from({ length: cols * rows }, (_, i) => i).filter(() => rng() < 0.28);
  const start = 0;
  const target = cols * rows - 1;
  walls = walls.filter((w) => w !== start && w !== target);
  return { graph: gridGraph(cols, rows, walls), start, target };
}

export const nextLabel = (g: Graph): string => {
  const used = new Set(g.nodes.map((n) => n.label));
  for (let i = 0; ; i++) if (!used.has(label(i))) return label(i);
};
