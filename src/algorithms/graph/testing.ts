import fc from 'fast-check';
import { expect } from 'vitest';
import type { Pseudocode } from '../../core/types';
import { euclidean, findEdge, gridGraph, type Graph } from './model';
import { INF, type GraphInput, type GraphStep } from './types';

export function collect<X>(gen: Generator<GraphStep<X>>): GraphStep<X>[] {
  const steps: GraphStep<X>[] = [];
  const frozen: string[] = [];
  for (const s of gen) {
    steps.push(s);
    frozen.push(JSON.stringify(s));
  }
  steps.forEach((s, i) => {
    if (JSON.stringify(s) !== frozen[i]) throw new Error(`step ${i} (${s.event}) was mutated after being emitted`);
  });
  return steps;
}

export function checkContract<X>(input: GraphInput, steps: GraphStep<X>[], pseudocode: Pseudocode): void {
  const lines = new Set(pseudocode.map((l) => l.id));
  expect(steps[0]!.event).toBe('start');
  expect(steps.at(-1)!.event).toBe('done');
  for (const s of steps) {
    if (s.line !== null) expect(lines, `unknown line ${s.line}`).toContain(s.line);
    expect(s.state.nodes.length).toBe(input.graph.nodes.length);
    expect(s.state.edges.length).toBe(input.graph.edges.length);
    if (s.tone !== undefined) expect(s.tone >= 0 && s.tone <= 1).toBe(true);
  }
  for (let i = 1; i < steps.length; i++) {
    for (const [k, v] of Object.entries(steps[i]!.counters)) expect(v).toBeGreaterThanOrEqual(steps[i - 1]!.counters[k]!);
  }
  const path = steps.at(-1)!.state.path;
  if (path) expectValidPath(input, path);
}

export function expectValidPath({ graph, start, target }: GraphInput, path: readonly number[]): void {
  expect(path[0]).toBe(start);
  if (target !== null) expect(path.at(-1)).toBe(target);
  for (let i = 1; i < path.length; i++) {
    const ok = graph.edges.some((e) => (e.from === path[i - 1] && e.to === path[i]) || (!graph.directed && e.to === path[i - 1] && e.from === path[i]));
    expect(ok, `edge ${path[i - 1]}→${path[i]}`).toBe(true);
  }
  expect(new Set(path).size).toBe(path.length);
}

/** Cheapest cost along the path, choosing the lightest parallel edge. */
export function cheapestPathCost(graph: Graph, path: readonly number[]): number {
  let c = 0;
  for (let i = 1; i < path.length; i++) {
    const [a, b] = [path[i - 1]!, path[i]!];
    c += Math.min(...graph.edges.filter((e) => (e.from === a && e.to === b) || (!graph.directed && e.from === b && e.to === a)).map((e) => e.weight));
  }
  return c;
}

export function refFloyd(graph: Graph): number[][] {
  const n = graph.nodes.length;
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)));
  for (const e of graph.edges) {
    d[e.from]![e.to] = Math.min(d[e.from]![e.to]!, e.weight);
    if (!graph.directed) d[e.to]![e.from] = Math.min(d[e.to]![e.from]!, e.weight);
  }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (d[i]![k]! + d[k]![j]! < d[i]![j]!) d[i]![j] = d[i]![k]! + d[k]![j]!;
  }
  return d;
}

export function refDijkstra(graph: Graph, s: number): number[] {
  const n = graph.nodes.length;
  const dist = new Array(n).fill(INF);
  const done = new Array(n).fill(false);
  dist[s] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!done[v] && dist[v] < INF && (u < 0 || dist[v] < dist[u])) u = v;
    if (u < 0) break;
    done[u] = true;
    for (const e of graph.edges) {
      if (e.from === u && dist[u] + e.weight < dist[e.to]) dist[e.to] = dist[u] + e.weight;
      if (!graph.directed && e.to === u && dist[u] + e.weight < dist[e.from]) dist[e.from] = dist[u] + e.weight;
    }
  }
  return dist;
}

export function refHops(graph: Graph, s: number): number[] {
  const unit = { ...graph, edges: graph.edges.map((e) => ({ ...e, weight: 1 })) };
  return refDijkstra(unit, s);
}

interface GenOptions {
  directed?: boolean;
  minWeight?: number;
  maxWeight?: number;
  /** Make every weight ≥ Euclidean distance so Euclidean h is admissible and consistent. */
  metric?: boolean;
}

export const randomGraph = (o: GenOptions = {}): fc.Arbitrary<GraphInput> =>
  fc.integer({ min: 1, max: 12 }).chain((n) =>
    fc.record({
      pos: fc.array(fc.tuple(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 })), { minLength: n, maxLength: n }),
      raw: fc.array(fc.tuple(fc.nat(n - 1), fc.nat(n - 1), fc.integer({ min: o.minWeight ?? 1, max: o.maxWeight ?? 9 })), { maxLength: n * 3 }),
      start: fc.nat(n - 1),
      target: fc.nat(n - 1),
    }).map(({ pos, raw, start, target }) => {
      const nodes = pos.map(([x, y], i) => ({ label: String.fromCharCode(65 + i), x, y }));
      const graph: Graph = { nodes, edges: [], directed: o.directed ?? false };
      for (const [a, b, w] of raw) {
        if (a === b || findEdge(graph, a, b) >= 0) continue;
        const weight = o.metric ? Math.ceil(euclidean(graph, a, b)) + Math.abs(w) : w;
        graph.edges.push({ from: a, to: b, weight });
      }
      return { graph, start, target };
    }),
  );

export const randomGrid: fc.Arbitrary<GraphInput> = fc
  .record({ cols: fc.integer({ min: 2, max: 8 }), rows: fc.integer({ min: 2, max: 8 }) })
  .chain(({ cols, rows }) =>
    fc.record({
      walls: fc.array(fc.boolean(), { minLength: cols * rows, maxLength: cols * rows }),
      start: fc.nat(cols * rows - 1),
      target: fc.nat(cols * rows - 1),
    }).map(({ walls, start, target }) => {
      const wallIdx = walls.flatMap((w, i) => (w && i !== start && i !== target ? [i] : [])).filter((_, k) => k % 2 === 0);
      return { graph: gridGraph(cols, rows, wallIdx), start, target };
    }),
  );
