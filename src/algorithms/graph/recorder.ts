import type { Graph } from './model';
import type { EdgeMark, GraphStep, GraphStepOptions, NodeMark } from './types';

export class GraphRecorder<X> {
  readonly nodes: (NodeMark | null)[];
  readonly edges: (EdgeMark | null)[];
  readonly badges: (string | null)[];
  readonly counters: Record<string, number>;
  path: number[] | null = null;

  constructor(
    readonly graph: Graph,
    public extra: X,
    counterNames: readonly string[],
  ) {
    this.nodes = graph.nodes.map(() => null);
    this.edges = graph.edges.map(() => null);
    this.badges = graph.nodes.map(() => null);
    this.counters = Object.fromEntries(counterNames.map((c) => [c, 0]));
  }

  count(name: string, by = 1): void {
    this.counters[name] = (this.counters[name] ?? 0) + by;
  }

  peak(name: string, value: number): void {
    this.counters[name] = Math.max(this.counters[name] ?? 0, value);
  }

  label(u: number): string {
    return this.graph.nodes[u]!.label;
  }

  tone(u: number): number {
    return this.graph.nodes.length < 2 ? 0.5 : u / (this.graph.nodes.length - 1);
  }

  markPath(path: readonly number[], edgeOf: (u: number, v: number) => number): void {
    this.path = [...path];
    path.forEach((u, i) => {
      this.nodes[u] = 'path';
      if (i > 0) {
        const e = edgeOf(path[i - 1]!, u);
        if (e >= 0) this.edges[e] = 'path';
      }
    });
  }

  step(event: string, line: string | null, narration: string, o: GraphStepOptions = {}): GraphStep<X> {
    const nodes = this.nodes.slice();
    const edges = this.edges.slice();
    for (const [k, m] of Object.entries(o.nodes ?? {})) nodes[Number(k)] = m;
    for (const [k, m] of Object.entries(o.edges ?? {})) edges[Number(k)] = m;
    return {
      event,
      line,
      state: { nodes, edges, badges: this.badges.slice(), path: this.path ? [...this.path] : null, extra: structuredClone(this.extra) },
      vars: o.vars ?? {},
      counters: { ...this.counters },
      narration: { key: narration, params: o.params },
      phase: o.phase,
      tone: o.tone,
    };
  }
}

export function walkParents(parent: readonly number[], target: number): number[] {
  const path: number[] = [];
  for (let v = target; v !== -1; v = parent[v]!) {
    path.push(v);
    if (path.length > parent.length) throw new Error('parent cycle');
  }
  return path.reverse();
}
