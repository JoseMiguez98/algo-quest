import { gridGraph, type Graph, type GraphEdge, type GraphNode } from '../algorithms/graph/model';

export interface GraphFixture {
  id: string;
  graph: Graph;
  start: number;
  target: number | null;
  note: string;
}

type Pair = readonly [number, number];
type NamedEdge = readonly [string, string, number];

function nodes(labels: readonly string[], xs: readonly number[], ys: readonly number[]): GraphNode[] {
  return labels.map((label, i) => ({ label, x: xs[i]!, y: ys[i]! }));
}

const unitEdges = (pairs: readonly Pair[]): GraphEdge[] => pairs.map(([from, to]) => ({ from, to, weight: 1 }));

function flatEdges(flat: readonly number[], stride: 2 | 3): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < flat.length; i += stride) {
    edges.push({ from: flat[i]!, to: flat[i + 1]!, weight: stride === 3 ? flat[i + 2]! : 1 });
  }
  return edges;
}

function namedEdges(names: string, defs: readonly NamedEdge[]): GraphEdge[] {
  return defs.map(([a, b, weight]) => {
    const from = names.indexOf(a);
    const to = names.indexOf(b);
    if (from < 0 || to < 0) throw new Error(`unknown node in edge ${a}-${b}`);
    return { from, to, weight };
  });
}

const letters = (s: string): string[] => [...s];

const bfs: Graph = {
  nodes: nodes(
    letters('ABCDEFGHIJKLMNOPQR'),
    [8, 24, 24, 24, 40, 40, 40, 40, 56, 56, 56, 56, 72, 72, 72, 72, 88, 88],
    [37, 19, 37, 55, 14, 28, 42, 58, 14, 28, 42, 58, 14, 28, 42, 58, 21, 50],
  ),
  edges: unitEdges([
    [0, 1], [0, 2], [0, 3], [1, 2], [2, 3],
    [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7],
    [4, 8], [5, 9], [5, 8], [6, 10], [6, 9], [7, 11], [7, 10],
    [8, 9], [10, 11],
    [8, 12], [9, 13], [10, 14], [11, 15], [10, 13],
    [12, 13], [13, 14], [14, 15],
    [12, 16], [13, 16], [14, 17], [15, 17], [16, 17],
  ]),
  directed: false,
};

const dfs: Graph = {
  nodes: nodes(
    letters('ABCDEFGHIJKLMNOP'),
    [10, 28, 46, 82, 10, 46, 64, 82, 10, 28, 46, 82, 28, 46, 64, 82],
    [18, 18, 18, 18, 33, 33, 33, 33, 48, 48, 48, 48, 63, 63, 63, 63],
  ),
  edges: unitEdges([
    [0, 1], [1, 2], [0, 4], [2, 5], [5, 6], [6, 7], [3, 7], [4, 8], [8, 9], [9, 10], [5, 10],
    [9, 12], [10, 13], [12, 13], [13, 14], [14, 15], [11, 15], [7, 11], [1, 9], [6, 14], [2, 6],
  ]),
  directed: false,
};

const bidirectionalBfs: Graph = {
  nodes: nodes(
    letters('SABCDEFGHIJKLMNOPT'),
    [9, 21, 21, 21, 34, 34, 34, 34, 47, 47, 47, 60, 60, 60, 60, 72, 72, 84],
    [39, 24, 39, 54, 16, 31, 46, 61, 24, 39, 54, 16, 31, 46, 61, 24, 54, 39],
  ),
  edges: flatEdges(
    [
      0, 1, 0, 2, 0, 3, 1, 4, 1, 5, 2, 5, 2, 6, 3, 6, 3, 7, 4, 8, 5, 8, 5, 9, 6, 9, 6, 10,
      7, 10, 8, 11, 8, 12, 9, 12, 9, 13, 10, 13, 10, 14, 11, 15, 12, 15, 13, 16, 14, 16,
      15, 17, 16, 17,
    ],
    2,
  ),
  directed: false,
};

const DIJKSTRA_COL = [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4];
const DIJKSTRA_ROW = [1, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 1, 2];
const DIJKSTRA_GX = [8, 27, 46, 65, 84];
const DIJKSTRA_GY = [14, 30, 46, 62];

const dijkstra: Graph = {
  nodes: nodes(
    letters('SBCDEFGHIJKLMT'),
    DIJKSTRA_COL.map((c) => DIJKSTRA_GX[c]!),
    DIJKSTRA_ROW.map((r) => DIJKSTRA_GY[r]!),
  ),
  edges: flatEdges(
    [
      0, 1, 4, 0, 2, 2, 0, 3, 6, 1, 2, 5, 2, 3, 3, 1, 4, 3, 2, 5, 6, 2, 4, 4, 3, 6, 2, 3, 7, 7,
      4, 5, 2, 5, 6, 4, 6, 7, 1, 4, 8, 5, 5, 9, 3, 6, 10, 5, 7, 11, 2, 8, 9, 2, 9, 10, 1, 10, 11, 4,
      8, 12, 6, 9, 12, 5, 10, 13, 3, 9, 13, 7, 11, 13, 5, 12, 13, 2, 2, 6, 5,
    ],
    3,
  ),
  directed: false,
};

const A_STAR_NAMES = 'SABCDEFGHIJKLMT';
const aStar: Graph = {
  nodes: nodes(
    letters(A_STAR_NAMES),
    [0, 2, 2, 2, 4, 4, 4, 6, 6, 6, 8, 8, 0, 0, 9],
    [3, 1, 3, 5, 0, 2, 4, 1, 3, 5, 0, 4, 5, 1, 2],
  ),
  edges: namedEdges(A_STAR_NAMES, [
    ['S', 'A', 5], ['S', 'B', 3], ['S', 'C', 6], ['S', 'L', 4], ['L', 'C', 3], ['S', 'M', 3], ['M', 'A', 3],
    ['A', 'D', 4], ['A', 'E', 4], ['B', 'E', 4], ['B', 'F', 6], ['C', 'F', 4], ['D', 'G', 4], ['E', 'G', 4],
    ['E', 'H', 4], ['F', 'H', 4], ['F', 'I', 3], ['G', 'J', 4], ['G', 'H', 3], ['H', 'K', 4], ['I', 'K', 4],
    ['J', 'T', 4], ['K', 'T', 4], ['H', 'T', 5], ['D', 'J', 5],
  ]),
  directed: false,
};

const GBFS_NAMES = 'SABCDEFGHIJKLMNOT';
const GBFS_EDGE_DEF = [
  'SA4', 'SB4', 'SD6', 'AC5', 'AD5', 'BD5', 'BE5', 'CH4', 'CJ5', 'DF5', 'EI4', 'EK6', 'FG3',
  'FH4', 'FI3', 'GL9', 'GM9', 'HJ5', 'IK4', 'JO3', 'KN4', 'LM4', 'LO8', 'MN4', 'NT5', 'OT4',
];
const greedyBestFirst: Graph = {
  nodes: nodes(
    letters(GBFS_NAMES),
    [1, 3, 3, 8, 6, 8, 11, 14, 11, 11, 14, 14, 16, 16, 17, 17, 19],
    [7, 3, 11, 2, 7, 12, 7, 7, 4, 10, 2, 12, 5, 9, 12, 3, 7],
  ),
  edges: namedEdges(
    GBFS_NAMES,
    GBFS_EDGE_DEF.map((s) => [s[0]!, s[1]!, parseInt(s.slice(2), 10)] as const),
  ),
  directed: false,
};

const BF_NAMES = 'SABCDEFGHIJKLTYZ';
const BF_EDGE_SRC: readonly NamedEdge[] = [
  ['H', 'K', 3], ['J', 'T', 3], ['E', 'H', -3], ['A', 'E', 2], ['F', 'I', 2], ['S', 'A', 4], ['I', 'L', 1], ['L', 'T', 2],
  ['B', 'F', -2], ['S', 'B', 5], ['Y', 'Z', 3], ['C', 'G', 4], ['G', 'J', -4], ['S', 'C', 8], ['A', 'D', 6], ['D', 'E', 0],
  ['D', 'H', 5], ['B', 'E', 3], ['C', 'F', 1], ['E', 'I', 6], ['F', 'J', 7], ['J', 'L', -2], ['I', 'T', 9], ['H', 'L', 7],
  ['K', 'L', 2], ['L', 'K', -1], ['H', 'E', 5], ['Y', 'C', 1], ['Z', 'G', -2],
];
const BF_NEG_EDGE_IDX = 26;
const BF_NEG_W = -4;
const bellmanFordNodes = nodes(
  letters(BF_NAMES),
  [28, 112, 112, 112, 200, 200, 200, 200, 290, 290, 290, 382, 382, 382, 28, 70],
  [130, 62, 130, 196, 42, 100, 158, 216, 66, 124, 182, 60, 130, 215, 222, 246],
);
const bellmanFord: Graph = { nodes: bellmanFordNodes, edges: namedEdges(BF_NAMES, BF_EDGE_SRC), directed: true };
const bellmanFordNegativeCycle: Graph = {
  nodes: bellmanFordNodes,
  edges: namedEdges(BF_NAMES, BF_EDGE_SRC).map((e, i) => (i === BF_NEG_EDGE_IDX ? { ...e, weight: BF_NEG_W } : e)),
  directed: true,
};

const floydWarshallNodes = nodes(
  letters('ABCDEFGH'),
  [6, 17, 17, 30, 30, 43, 43, 52],
  [36, 17, 55, 26, 46, 17, 52, 35],
);
const floydWarshall: Graph = {
  nodes: floydWarshallNodes,
  edges: flatEdges(
    [
      0, 1, 10, 0, 2, 3, 2, 1, 2, 1, 3, 4, 2, 3, 9, 2, 4, -3, 4, 3, 5, 3, 4, 0, 4, 5, 4, 3, 5, 2,
      3, 6, 6, 5, 6, 3, 4, 6, 9, 5, 7, 5, 6, 7, 2, 1, 4, 7, 6, 2, 4, 5, 3, -1,
    ],
    3,
  ),
  directed: true,
};
const floydWarshallNegativeCycle: Graph = {
  nodes: floydWarshallNodes,
  edges: flatEdges(
    [
      0, 1, 2, 1, 2, 1, 2, 0, -5, 0, 2, 3, 1, 3, 4, 2, 3, 9, 2, 4, -3, 4, 3, 5, 3, 4, 0, 4, 5, 4,
      3, 5, 2, 3, 6, 6, 5, 6, 3, 4, 6, 9, 5, 7, 5, 6, 7, 2, 1, 4, 7, 6, 2, 4, 5, 3, -1,
    ],
    3,
  ),
  directed: true,
};

const MAZE_SRC = [
  '.##.#.#.',
  '..#...#.',
  '........',
  '##...#..',
  '##....#.',
  '...####.',
  '#....#.#',
  '..##....',
];
const MAZE_COLS = 8;
const mazeWalls = MAZE_SRC.flatMap((row, r) =>
  [...row].flatMap((ch, c) => (ch === '#' ? [r * MAZE_COLS + c] : [])),
);
const backtrackingMaze = gridGraph(MAZE_COLS, MAZE_SRC.length, mazeWalls);

export const legacyGraphs: Record<string, GraphFixture> = {
  bfs: {
    id: 'bfs',
    graph: bfs,
    start: 0,
    target: null,
    note: 'Layered 18-node graph with no target: BFS explores the whole graph level by level from A.',
  },
  dfs: {
    id: 'dfs',
    graph: dfs,
    start: 0,
    target: null,
    note: 'Grid-like 16-node graph with cycles and one diagonal and no target: DFS traverses everything from A.',
  },
  'bidirectional-bfs': {
    id: 'bidirectional-bfs',
    graph: bidirectionalBfs,
    start: 0,
    target: 17,
    note: 'Two BFS wavefronts from S and T each cover about half the depth and meet in the middle.',
  },
  dijkstra: {
    id: 'dijkstra',
    graph: dijkstra,
    start: 0,
    target: 13,
    note: 'Weighted 14-node graph where the cheapest S-to-T route is not the one with the fewest hops.',
  },
  'a-star': {
    id: 'a-star',
    graph: aStar,
    start: 0,
    target: 14,
    note: 'Every edge weight is at least the Manhattan distance of its endpoints, so the heuristic is consistent.',
  },
  'greedy-best-first': {
    id: 'greedy-best-first',
    graph: greedyBestFirst,
    start: 0,
    target: 16,
    note: 'Greedy trap: GBFS follows h(n) only and can return a costlier path than the optimal one.',
  },
  'bellman-ford': {
    id: 'bellman-ford',
    graph: bellmanFord,
    start: 0,
    target: 13,
    note: 'Directed graph with negative edges, unsorted edge order that needs several passes, and unreachable Y and Z.',
  },
  'bellman-ford-negative-cycle': {
    id: 'bellman-ford-negative-cycle',
    graph: bellmanFordNegativeCycle,
    start: 0,
    target: 13,
    note: 'Edge H->E becomes -4, creating the negative cycle E->H->E = -7 that the extra pass detects.',
  },
  'floyd-warshall': {
    id: 'floyd-warshall',
    graph: floydWarshall,
    start: 0,
    target: 7,
    note: 'All-pairs graph with negative edges but no negative cycle; H cannot reach A.',
  },
  'floyd-warshall-negative-cycle': {
    id: 'floyd-warshall-negative-cycle',
    graph: floydWarshallNegativeCycle,
    start: 0,
    target: 7,
    note: 'Demo graph with the negative cycle A->B->C->A = -2, detected by a negative diagonal entry.',
  },
  'backtracking-maze': {
    id: 'backtracking-maze',
    graph: backtrackingMaze,
    start: 0,
    target: 63,
    note: '8x8 maze solved by recursive backtracking from the top-left to the bottom-right corner.',
  },
};
