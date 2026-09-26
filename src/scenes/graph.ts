import type { GraphInput, GraphState } from '../algorithms/graph/types';
import type { Graph } from '../algorithms/graph/model';
import type { StageRenderer, VisualState } from '../themes/contract';
import type { Scene, SceneFrame } from './scene';

type S = GraphState<unknown>;

interface Placed {
  x: number;
  y: number;
}

/** Renders any Graph: free layouts as nodes and edges, grid graphs as cells. */
export class GraphScene implements Scene<S> {
  readonly logicalHeight = 160;
  readonly minWidth = 220;
  readonly maxWidth = 720;

  constructor(
    private readonly input: GraphInput,
    private readonly layers: readonly string[] = [],
  ) {}

  draw(r: StageRenderer, f: SceneFrame<S>): void {
    if (this.input.graph.grid) return this.drawGrid(r, f);
    if (this.layers.includes('matrix')) {
      const split = Math.round(f.width * 0.46);
      this.drawFree(r, { ...f, width: split });
      drawMatrix(r, f, this.input, split, f.width - split);
      return;
    }
    this.drawFree(r, f);
  }

  private place(g: Graph, width: number, height: number, pad: number): Placed[] {
    const xs = g.nodes.map((n) => n.x);
    const ys = g.nodes.map((n) => n.y);
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const sx = (width - pad * 2) / Math.max(1, maxX - minX);
    const sy = (height - pad * 2) / Math.max(1, maxY - minY);
    const s = Math.min(sx, sy);
    const ox = (width - (maxX - minX) * s) / 2;
    const oy = (height - (maxY - minY) * s) / 2;
    return g.nodes.map((n) => ({ x: ox + (n.x - minX) * s, y: oy + (n.y - minY) * s }));
  }

  private drawFree(r: StageRenderer, { step, prev, t, width, height }: SceneFrame<S>): void {
    const { graph, start, target } = this.input;
    const s = step.state;
    const pos = this.place(graph, width, height, 16);
    const weighted = graph.edges.some((e) => e.weight !== 1);
    const radius = 7;
    const reverse = new Set(graph.edges.map((e, i) => (graph.directed && graph.edges.some((o) => o.from === e.to && o.to === e.from) ? i : -1)));
    const order = graph.edges.map((_, i) => i).sort((a, b) => rank(s.edges[a] ?? null) - rank(s.edges[b] ?? null));
    for (const i of order) {
      const e = graph.edges[i]!;
      const a = pos[e.from]!;
      const b = pos[e.to]!;
      r.edge(a.x, a.y, b.x, b.y, s.edges[i] ?? 'default', {
        directed: graph.directed,
        trim: radius + 2,
        weight: weighted ? String(e.weight) : undefined,
        bend: reverse.has(i) ? 4 : 0,
      });
    }
    graph.nodes.forEach((n, i) => {
      const p = pos[i]!;
      const state: VisualState = s.nodes[i] ?? 'default';
      const changed = prev && (prev.state.nodes[i] ?? 'default') !== state && t < 1;
      const rr = radius + (changed ? Math.round(Math.sin(t * Math.PI) * 2) : 0);
      r.node(p.x, p.y, rr, state, n.label, { ring: i === start ? 'start' : i === target ? 'target' : null });
      const badge = s.badges[i];
      if (badge !== null && badge !== undefined) r.tag(p.x + radius - 1, p.y - radius - 8, badge, state === 'default' ? 'inactive' : state);
    });
  }

  private drawGrid(r: StageRenderer, { step, width, height }: SceneFrame<S>): void {
    const { graph, start, target } = this.input;
    const grid = graph.grid!;
    const walls = new Set(grid.walls);
    const s = step.state;
    const size = Math.floor(Math.min((width - 16) / grid.cols, (height - 16) / grid.rows));
    const ox = Math.round((width - size * grid.cols) / 2);
    const oy = Math.round((height - size * grid.rows) / 2);
    for (let i = 0; i < graph.nodes.length; i++) {
      const c = i % grid.cols;
      const row = Math.floor(i / grid.cols);
      const x = ox + c * size;
      const y = oy + row * size;
      if (walls.has(i)) {
        r.cell(x, y, size, 'wall');
        continue;
      }
      const state = s.nodes[i];
      const label = i === start ? 'S' : i === target ? 'E' : size >= 14 ? (s.badges[i] ?? undefined) : undefined;
      r.cell(x, y, size, state ?? 'open', label);
    }
  }
}

const rank = (m: string | null): number => (m === null ? 0 : m === 'rejected' ? 1 : m === 'tree' || m === 'tree-b' ? 2 : 3);

interface MatrixExtra {
  dist: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  updated: [number, number] | null;
}

function drawMatrix(r: StageRenderer, f: SceneFrame<S>, input: GraphInput, x0: number, w: number): void {
  const x = f.step.state.extra as unknown as MatrixExtra;
  const n = x.dist.length;
  const labels = input.graph.nodes.map((nd) => nd.label);
  const cell = Math.max(12, Math.min(22, Math.floor((Math.min(w - 16, f.height - 24)) / (n + 1))));
  const left = x0 + Math.round((w - cell * (n + 1)) / 2);
  const top = Math.round((f.height - cell * (n + 1)) / 2);
  const fmtCell = (d: number) => (d === Infinity ? '∞' : String(d));
  for (let c = 0; c < n; c++) {
    const on = c === x.j || c === x.k;
    r.text(labels[c]!, left + cell * (c + 1) + cell / 2 + 1, top + (cell - 7) / 2, { align: 'center', color: c === x.k ? r.color('current') : c === x.j ? r.color('frontier-b') : undefined, tone: on ? 'normal' : 'muted' });
  }
  for (let row = 0; row < n; row++) {
    const y = top + cell * (row + 1);
    r.text(labels[row]!, left + cell / 2 + 1, y + (cell - 7) / 2, { align: 'center', color: row === x.k ? r.color('current') : row === x.i ? r.color('frontier') : undefined, tone: row === x.i || row === x.k ? 'normal' : 'muted' });
    for (let c = 0; c < n; c++) {
      const d = x.dist[row]![c]!;
      let state: VisualState | 'open' = 'open';
      if (row === c && d < 0) state = 'cycle';
      else if (x.updated && x.updated[0] === row && x.updated[1] === c) state = 'write';
      else if (row === x.i && c === x.j) state = 'active';
      else if ((row === x.i && c === x.k) || (row === x.k && c === x.j)) state = 'compare';
      r.cell(left + cell * (c + 1), y, cell, state, fmtCell(d));
    }
  }
}
