export interface GraphNode {
  label: string;
  /** Position in the same units as edge weights, so Euclidean distance can be an admissible heuristic. */
  x: number;
  y: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

export interface GridMeta {
  cols: number;
  rows: number;
  /** Node indices (row * cols + col) that are walls. */
  walls: number[];
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  grid?: GridMeta;
}

export interface Neighbor {
  to: number;
  weight: number;
  edge: number;
}

export type Adjacency = Neighbor[][];

/** Grid neighbours are visited clockwise starting at RIGHT; other graphs by ascending node index. */
export const GRID_DIRECTIONS = [
  { name: 'right', dc: 1, dr: 0 },
  { name: 'down', dc: 0, dr: 1 },
  { name: 'left', dc: -1, dr: 0 },
  { name: 'up', dc: 0, dr: -1 },
] as const;

export function adjacency(g: Graph, reverse = false): Adjacency {
  const adj: Adjacency = g.nodes.map(() => []);
  g.edges.forEach((e, edge) => {
    const [a, b] = reverse && g.directed ? [e.to, e.from] : [e.from, e.to];
    adj[a]!.push({ to: b, weight: e.weight, edge });
    if (!g.directed) adj[b]!.push({ to: a, weight: e.weight, edge });
  });
  const order = g.grid ? gridOrder(g.grid) : (_u: number, n: Neighbor) => n.to;
  adj.forEach((list, u) => list.sort((p, q) => order(u, p) - order(u, q) || p.to - q.to));
  return adj;
}

function gridOrder(grid: GridMeta) {
  return (u: number, n: Neighbor): number => {
    const dc = (n.to % grid.cols) - (u % grid.cols);
    const dr = Math.floor(n.to / grid.cols) - Math.floor(u / grid.cols);
    const i = GRID_DIRECTIONS.findIndex((d) => d.dc === dc && d.dr === dr);
    return i < 0 ? GRID_DIRECTIONS.length : i;
  };
}

export function findEdge(g: Graph, u: number, v: number): number {
  return g.edges.findIndex((e) => (e.from === u && e.to === v) || (!g.directed && e.from === v && e.to === u));
}

export const euclidean = (g: Graph, a: number, b: number): number =>
  Math.hypot(g.nodes[a]!.x - g.nodes[b]!.x, g.nodes[a]!.y - g.nodes[b]!.y);

export const manhattan = (g: Graph, a: number, b: number): number =>
  Math.abs(g.nodes[a]!.x - g.nodes[b]!.x) + Math.abs(g.nodes[a]!.y - g.nodes[b]!.y);

/** Builds a 4-connected unit-weight grid graph; walls are nodes without edges. */
export function gridGraph(cols: number, rows: number, walls: Iterable<number> = []): Graph {
  const wallSet = new Set(walls);
  const nodes: GraphNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) nodes.push({ label: `${c},${r}`, x: c, y: r });
  const edges: GraphEdge[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = r * cols + c;
      if (wallSet.has(u)) continue;
      if (c + 1 < cols && !wallSet.has(u + 1)) edges.push({ from: u, to: u + 1, weight: 1 });
      if (r + 1 < rows && !wallSet.has(u + cols)) edges.push({ from: u, to: u + cols, weight: 1 });
    }
  }
  return { nodes, edges, directed: false, grid: { cols, rows, walls: [...wallSet].sort((a, b) => a - b) } };
}

export function pathCost(g: Graph, path: readonly number[]): number {
  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const e = findEdge(g, path[i - 1]!, path[i]!);
    if (e < 0) throw new Error(`no edge ${path[i - 1]}→${path[i]}`);
    cost += g.edges[e]!.weight;
  }
  return cost;
}
