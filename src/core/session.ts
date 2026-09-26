import type { GraphInput } from '../algorithms/graph/types';
import type { RadixExtra } from '../algorithms/sorting/radix-sort/algorithm';
import type { ArrayState } from '../algorithms/sorting/types';
import { legacyGraphs } from '../data/legacy-graphs';
import { BarsScene } from '../scenes/bars';
import { GraphScene } from '../scenes/graph';
import { BAR_LAYERS } from '../scenes/layers';
import type { Scene, SceneFrame } from '../scenes/scene';
import type { AlgorithmDef } from './algorithm';
import { mulberry32, randomInt } from './rng';
import { record } from './trace';
import type { Primitive, Step } from './types';

type Def = AlgorithmDef<never>;

/** Everything needed to run and draw one algorithm on one input; shared by every page. */
export function defaultOptions(def: Def): Record<string, Primitive> {
  return Object.fromEntries((def.options ?? []).map((o) => [o.id, o.default]));
}

export function initialInput(def: Def, seed: number | null, fixture?: string): unknown {
  if (def.input.kind === 'array') {
    const spec = def.input;
    if (seed === null) return spec.preset.slice();
    const rng = mulberry32(seed);
    return spec.preset.map(() => randomInt(rng, spec.min, spec.max));
  }
  const f = legacyGraphs[fixture ?? def.input.fixture];
  if (!f) throw new Error(`unknown fixture ${fixture ?? def.input.fixture}`);
  return { graph: f.graph, start: f.start, target: f.target } satisfies GraphInput;
}

export function sceneFor(def: Def, input: unknown, o: { maxValue?: number } = {}): Scene<unknown> {
  if (def.scene === 'graph') return new GraphScene(input as GraphInput, def.layers ?? []) as Scene<unknown>;
  const spec = def.input.kind === 'array' ? { ...def.input, max: o.maxValue ?? def.input.max } : null;
  const layers = (def.layers ?? []).flatMap((id) => (BAR_LAYERS[id] ? [BAR_LAYERS[id]] : []));
  const label = def.layers?.includes('digits') ? radixLabel : undefined;
  return new BarsScene(layers, { maxValue: spec?.max, label }) as Scene<unknown>;
}

export function traceFor(def: Def, input: unknown, options = defaultOptions(def)): Step<unknown>[] {
  return record(def.run(input as never, options));
}

function radixLabel(value: number, f: SceneFrame<ArrayState<unknown>>): { text: string; highlight?: number } {
  const x = f.step.state.extra as RadixExtra;
  const text = value.toString(x.base).toUpperCase().padStart(Math.max(1, x.passes), '0');
  const active = x.pass > 0 && f.step.event !== 'done';
  return { text, highlight: active ? text.length - x.pass : undefined };
}
