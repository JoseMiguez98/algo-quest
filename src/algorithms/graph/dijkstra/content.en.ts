import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Dijkstra’s algorithm',
  tagline: 'Always settles the closest unsettled node next',
  summary:
    'Dijkstra computes shortest paths from a source on graphs with non-negative weights. It keeps a priority queue ordered by distance and, at every step, extracts the closest node: since no weight is negative, that distance is already final. It then relaxes the node’s edges, improving a neighbour’s distance whenever going through it is cheaper.',
  steps: [
    'Set dist[start] = 0, every other distance to ∞, and push the start onto the heap.',
    'Pop the smallest entry; if its node is already final it is a stale entry: skip it (lazy deletion).',
    'Mark the node final (if it is the target, you are done).',
    'For each non-final neighbour: if dist[u] + w < dist[v], update dist[v] and its parent, and push a new heap entry.',
  ],
  whenToUse:
    'Cheapest routes on maps, transport or computer networks, as long as weights are ≥ 0. With negative weights use Bellman-Ford; with a single target and a good heuristic, A* usually explores less.',
  references: [
    { title: 'Dijkstra’s algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm' },
    { title: 'E. W. Dijkstra (1959), “A note on two problems in connexion with graphs”', url: 'https://doi.org/10.1007/BF01386390' },
    { title: 'Dijkstra — cp-algorithms', url: 'https://cp-algorithms.com/graph/dijkstra.html' },
  ],
  narration: {
    start: 'Start at {s}: distance 0, onto the heap; everything else starts at ∞.',
    stale: 'Popped {u} with distance {key}, but it is already final: a stale entry, skip it.',
    extract: 'Pop {u}, the smallest distance ({key}): no other path can be shorter, so it is final.',
    found: 'Popped the target {t}: its distance {cost} is final.',
    'done-found': 'Shortest path found: cost {cost} over {len} edges.',
    closed: '{v} is already final: its distance cannot improve, ignore it.',
    seen: '{v} was already discovered: ignore it.',
    'no-improve': 'This way {v} would cost {cand}, no better than {old}: leave it.',
    discover: 'Discover {v} from {u}: distance {g} (was {old}), push it onto the heap.',
    improve: 'Going through {u} reaches {v} at {g} < {old}: shorter path, update and push again.',
    'done-all': 'The heap is empty: {count} nodes settled with their final shortest distance.',
    'done-unreachable': 'The heap emptied without reaching the target: there is no path.',
  },
  legend: {
    frontier: 'In the priority queue',
    current: 'Just extracted',
    visited: 'Final distance',
    focus: 'Stale entry',
    tree: 'Shortest-path tree',
    relaxed: 'Relaxed edge',
    rejected: 'No improvement',
  },
};

export default content;
