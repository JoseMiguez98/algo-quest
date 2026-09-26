import type { Graph } from '../algorithms/graph/model';
import type { GraphInput } from '../algorithms/graph/types';
import type { AlgorithmDef } from '../core/algorithm';
import type { Primitive } from '../core/types';

type Def = AlgorithmDef<never>;

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

interface Packed {
  n: [string, number, number][];
  e: [number, number, number][];
  d: 0 | 1;
  s: number;
  t: number | null;
  g?: [number, number, number[]];
}

export function encodeState(def: Def, input: unknown, options: Record<string, Primitive>): string {
  const q = new URLSearchParams();
  if (def.input.kind === 'array') q.set('d', (input as number[]).join(','));
  else {
    const { graph, start, target } = input as GraphInput;
    const p: Packed = {
      n: graph.nodes.map((n) => [n.label, n.x, n.y]),
      e: graph.edges.map((e) => [e.from, e.to, e.weight]),
      d: graph.directed ? 1 : 0,
      s: start,
      t: target,
      g: graph.grid ? [graph.grid.cols, graph.grid.rows, graph.grid.walls] : undefined,
    };
    q.set('g', b64(JSON.stringify(p)));
  }
  const defaults = def.options ?? [];
  const changed = defaults.filter((o) => options[o.id] !== o.default).map((o) => `${o.id}:${options[o.id]}`);
  if (changed.length) q.set('o', changed.join(';'));
  return q.toString();
}

/** Parses shared state; anything malformed or out of spec is ignored rather than trusted. */
export function decodeState(def: Def, search: string): { input?: unknown; options: Record<string, Primitive> } {
  const q = new URLSearchParams(search);
  const options: Record<string, Primitive> = {};
  for (const pair of (q.get('o') ?? '').split(';').filter(Boolean)) {
    const [k, v] = pair.split(':');
    const spec = def.options?.find((o) => o.id === k);
    const value = spec && spec.values.find((x) => String(x) === v);
    if (spec && value !== undefined) options[spec.id] = value;
  }
  try {
    if (def.input.kind === 'array' && q.get('d')) {
      const spec = def.input;
      const values = q.get('d')!.split(',').map(Number);
      if (values.length >= 1 && values.length <= spec.maxN && values.every((v) => Number.isInteger(v) && v >= spec.min && v <= spec.max)) return { input: values, options };
    }
    if (def.input.kind === 'graph' && q.get('g')) {
      const p = JSON.parse(unb64(q.get('g')!)) as Packed;
      const n = p.n.length;
      if (n < 1 || n > (def.input.maxNodes ?? 80) || p.s < 0 || p.s >= n || (p.t !== null && (p.t < 0 || p.t >= n))) return { options };
      if (p.e.some(([a, b, w]) => !(a >= 0 && a < n && b >= 0 && b < n && Number.isFinite(w)))) return { options };
      const graph: Graph = {
        nodes: p.n.map(([label, x, y]) => ({ label: String(label).slice(0, 3), x: Number(x), y: Number(y) })),
        edges: p.e.map(([from, to, weight]) => ({ from, to, weight })),
        directed: !!p.d,
        grid: p.g ? { cols: p.g[0], rows: p.g[1], walls: p.g[2] } : undefined,
      };
      if (def.input.gridOnly && !graph.grid) return { options };
      return { input: { graph, start: p.s, target: p.t } satisfies GraphInput, options };
    }
  } catch {
    /* ignore malformed shared state */
  }
  return { options };
}
