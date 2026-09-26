import type { Primitive, Step } from '../../core/types';
import type { Graph } from './model';

export type NodeMark =
  | 'frontier'
  | 'current'
  | 'visited'
  | 'path'
  | 'dead'
  | 'frontier-b'
  | 'visited-b'
  | 'meet'
  | 'focus';

export type EdgeMark = 'active' | 'tree' | 'tree-b' | 'path' | 'rejected' | 'relaxed' | 'cycle';

export interface GraphInput {
  graph: Graph;
  start: number;
  target: number | null;
}

export interface GraphState<X> {
  nodes: readonly (NodeMark | null)[];
  edges: readonly (EdgeMark | null)[];
  /** Short per-node annotation such as a distance; null hides it. */
  badges: readonly (string | null)[];
  path: readonly number[] | null;
  extra: X;
}

export type GraphStep<X = unknown> = Step<GraphState<X>>;

export interface GraphStepOptions {
  nodes?: Record<number, NodeMark>;
  edges?: Record<number, EdgeMark>;
  vars?: Record<string, Primitive>;
  params?: Record<string, Primitive>;
  phase?: string;
  tone?: number;
}

export const INF = Number.POSITIVE_INFINITY;
export const fmt = (d: number): string => (d === INF ? '∞' : d === -INF ? '−∞' : String(d));
