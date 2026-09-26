import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Floyd-Warshall',
  tagline: 'Every shortest path, one intermediate at a time',
  summary:
    'Floyd-Warshall computes the shortest path between every pair of nodes. It starts from the matrix of direct weights and, for each node k, asks for every pair (i, j): does going through k beat the best so far? Once k is done, paths may use any node tried so far as an intermediate. A next matrix stores the first hop to rebuild paths.',
  steps: [
    'Fill dist with direct weights (0 on the diagonal, ∞ with no edge) and set next[i][j] = j.',
    'For each k (outermost loop), scan every pair (i, j).',
    'If dist[i][k] + dist[k][j] < dist[i][j], update the distance and set next[i][j] ← next[i][k].',
    'At the end, a negative value on the diagonal means a negative cycle.',
    'To get a path u → v, follow next[u][v] until you reach v.',
  ],
  whenToUse:
    'When you need distances between all pairs on small or dense graphs (a few hundred nodes), negative weights allowed, or for transitive closure. On large sparse graphs, running Dijkstra from every node is better.',
  references: [
    { title: 'Floyd–Warshall algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm' },
    { title: 'R. W. Floyd, “Algorithm 97: Shortest path” (1962)', url: 'https://doi.org/10.1145/367766.368168' },
    { title: 'Floyd-Warshall — cp-algorithms', url: 'https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html' },
  ],
  narration: {
    start: 'Initial {n}×{n} matrix: direct weights, 0 on the diagonal and ∞ where there is no edge.',
    pivot: 'New intermediate k = {k}: does going through {k} shorten any pair?',
    update: '{i} → {k} → {j} costs {via}, better than {old}: update it, the path now goes through {k}.',
    'no-route': 'No path {i} → {k} or {k} → {j}: going through {k} is useless, {cur} stays.',
    'no-improve': '{i} → {k} → {j} costs {via}, no better than the best {i} → {j} so far ({cur}).',
    cycle: 'dist[{v}][{v}] is negative: there is a negative cycle and shortest paths are undefined.',
    'done-cycle': 'Finished with a negative cycle: the affected distances have no minimum.',
    found: 'Shortest path from {s} to {t}: cost {cost}, rebuilt with next.',
    done: 'Done: the matrix holds the minimum distance between every pair of nodes.',
  },
  legend: { current: 'Intermediate k', frontier: 'Source i', 'frontier-b': 'Target j' },
};

export default content;
