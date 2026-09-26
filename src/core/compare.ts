import type { GraphInput } from '../algorithms/graph/types';
import { legacyGraphs } from '../data/legacy-graphs';
import { gridInput } from '../data/generators';
import type { AlgorithmDef, ArrayInputSpec, GraphInputSpec } from './algorithm';
import { mulberry32, randomInt } from './rng';
import type { Step } from './types';

type Def = AlgorithmDef<never>;

export type CompareMode = 'race' | 'sync';

export interface Pair {
  a: Step<unknown>;
  b: Step<unknown>;
  aIndex: number;
  bIndex: number;
}

/** Merges two traces into one timeline; the composite drives a single Player. */
export function pairSteps(a: Step<unknown>[], b: Step<unknown>[], mode: CompareMode): Step<Pair>[] {
  const len = Math.max(a.length, b.length);
  const at = (steps: Step<unknown>[], k: number) =>
    mode === 'race' ? Math.min(k, steps.length - 1) : Math.round((k * (steps.length - 1)) / Math.max(1, len - 1));
  return Array.from({ length: len }, (_, k) => {
    const ai = at(a, k);
    const bi = at(b, k);
    const sa = a[ai]!;
    const sb = b[bi]!;
    return {
      event: 'compare-tick',
      line: null,
      state: { a: sa, b: sb, aIndex: ai, bIndex: bi },
      vars: {},
      counters: {},
      narration: { key: '' },
      phase: sa.phase ?? sb.phase,
    };
  });
}

/** Common array spec: the intersection of both value ranges and size limits. */
export function mergedArraySpec(a: ArrayInputSpec, b: ArrayInputSpec): ArrayInputSpec {
  const min = Math.max(a.min, b.min);
  const max = Math.min(a.max, b.max);
  const safe = min <= max ? { min, max } : { min: Math.min(a.min, b.min), max: Math.min(a.max, b.max) };
  const maxN = Math.min(a.maxN, b.maxN);
  const n = Math.min(maxN, Math.max(a.minN, b.minN, Math.min(a.preset.length, b.preset.length)));
  return { kind: 'array', ...safe, minN: Math.max(a.minN, b.minN), maxN, preset: a.preset.slice(0, n).map((v) => Math.max(safe.min, Math.min(safe.max, v))) };
}

export function randomArray(spec: ArrayInputSpec, seed: number, n = spec.preset.length): number[] {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, () => randomInt(rng, spec.min, spec.max));
}

export interface GraphChoice {
  input: GraphInput;
  warnings: { key: 'compare.warnNegative' | 'compare.warnAllPairs' | 'compare.warnGrid'; name: Def }[];
}

/** Picks the first dataset both algorithms can run on, preferring each one's own. */
export function sharedGraph(a: Def, b: Def, seed: number): GraphChoice {
  const sa = a.input as GraphInputSpec;
  const sb = b.input as GraphInputSpec;
  const warnings: GraphChoice['warnings'] = [];
  for (const d of [a, b]) if (d.id === 'floyd-warshall') warnings.push({ key: 'compare.warnAllPairs', name: d });
  const grid = [a, b].find((d) => (d.input as GraphInputSpec).gridOnly);
  if (grid) {
    warnings.push({ key: 'compare.warnGrid', name: grid });
    const f = legacyGraphs[(grid.input as GraphInputSpec).fixture]!;
    return { input: structuredClone({ graph: f.graph, start: f.start, target: f.target }), warnings };
  }
  const maxNodes = Math.min(sa.maxNodes ?? Infinity, sb.maxNodes ?? Infinity);
  const candidates = [sa.fixture, sb.fixture, ...(sa.alternatives ?? []), ...(sb.alternatives ?? [])];
  const fits = (id: string) => {
    const f = legacyGraphs[id]!;
    const negative = f.graph.edges.some((e) => e.weight < 0);
    return !f.graph.grid && f.graph.nodes.length <= maxNodes && f.target !== null && (!negative || (sa.negativeWeights && sb.negativeWeights));
  };
  const id = candidates.find(fits) ?? candidates.find((c) => legacyGraphs[c]!.target !== null && legacyGraphs[c]!.graph.nodes.length <= maxNodes) ?? sa.fixture;
  const f = legacyGraphs[id]!;
  if (f.graph.edges.some((e) => e.weight < 0)) for (const d of [a, b]) if (!(d.input as GraphInputSpec).negativeWeights) warnings.push({ key: 'compare.warnNegative', name: d });
  void seed;
  return { input: structuredClone({ graph: f.graph, start: f.start, target: f.target ?? f.graph.nodes.length - 1 }), warnings };
}

export const mazeFor = (seed: number): GraphInput => gridInput('maze', mulberry32(seed));
