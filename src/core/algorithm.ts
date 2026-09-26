import type { VisualState } from '../themes/contract';
import type { Cue } from './sound';
import type { Lang } from './settings';
import type { Primitive, Pseudocode, Step } from './types';

export type Category = 'sorting' | 'graph';

export interface ArrayInputSpec {
  kind: 'array';
  min: number;
  max: number;
  minN: number;
  maxN: number;
  preset: number[];
}

export interface GraphInputSpec {
  kind: 'graph';
  /** Default dataset id from src/data. */
  fixture: string;
  needsTarget: boolean;
  weighted: boolean;
  directed?: boolean;
  negativeWeights?: boolean;
  gridOnly?: boolean;
}

export interface OptionSpec {
  id: string;
  values: readonly Primitive[];
  default: Primitive;
}

export interface Reference {
  title: string;
  url: string;
}

export interface AlgorithmContent {
  name: string;
  tagline: string;
  summary: string;
  steps: string[];
  whenToUse: string;
  references: Reference[];
  /** Narration templates keyed by step narration key; `{param}` placeholders. */
  narration: Record<string, string>;
  /** Overrides for legend labels of states this algorithm uses. */
  legend?: Partial<Record<VisualState, string>>;
  /** Labels for options, keyed `<optionId>` and `<optionId>.<value>`. */
  options?: Record<string, string>;
}

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface Traits {
  stable?: boolean;
  inPlace?: boolean;
  comparison?: boolean;
  optimal?: boolean;
  weighted?: boolean;
  negativeWeights?: boolean;
}

export interface AlgorithmDef<I = unknown> {
  id: string;
  category: Category;
  scene: 'bars' | 'graph';
  /** Optional scene features, e.g. 'aux-row', 'heap-tree', 'counts', 'buckets', 'matrix'. */
  layers?: string[];
  input: ArrayInputSpec | GraphInputSpec;
  options?: OptionSpec[];
  run(input: I, options: Record<string, Primitive>): Iterable<Step<unknown>>;
  pseudocode: Pseudocode;
  complexity: Complexity;
  traits: Traits;
  /** Counters shown in the stats panel, in order. */
  counters: string[];
  /** States that can appear, for the legend. */
  legend: VisualState[];
  durations?: Partial<Record<string, number>>;
  cues?: Partial<Record<string, Cue | null>>;
  content: Record<Lang, () => Promise<{ default: AlgorithmContent }>>;
}

export const defineAlgorithm = <I>(def: AlgorithmDef<I>): AlgorithmDef<I> => def;

export function interpolate(template: string, params: Record<string, Primitive> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k] ?? '—') : `{${k}}`));
}
