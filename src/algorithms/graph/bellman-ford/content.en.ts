import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bellman-Ford',
  tagline: 'Relaxes every edge, pass after pass',
  summary:
    'Bellman-Ford computes shortest paths from one source to every node, even with negative weights. Each pass scans the whole edge list and relaxes every edge: if going through u improves the distance to v, it is updated. Since a simple path has at most |V| − 1 edges, |V| − 1 passes are enough. An extra pass that still improves something reveals a negative cycle.',
  steps: [
    'Set the source distance to 0 and every other one to ∞.',
    'Run up to |V| − 1 passes: in each one, relax every edge (u, v, w) in order.',
    'If a full pass changes no distance, stop early: it has converged.',
    'If all passes ran, scan the edges once more: any edge that still improves means a negative cycle.',
  ],
  whenToUse:
    'Graphs with negative weights, detecting negative cycles (e.g. currency arbitrage) or distance-vector routing protocols. If every weight is non-negative, Dijkstra is much faster.',
  references: [
    { title: 'Bellman–Ford algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm' },
    { title: 'R. Bellman, “On a routing problem” (1958)', url: 'https://doi.org/10.1090/qam/102435' },
    { title: 'Bellman-Ford — cp-algorithms', url: 'https://cp-algorithms.com/graph/bellman_ford.html' },
  ],
  narration: {
    start: 'Source {s} at distance 0; with {n} nodes, at most {passes} passes are needed.',
    pass: 'Pass {pass} of {passes}: relax every edge again.',
    unreached: '{u} has not been reached yet: edge {u}→{v} cannot improve anything.',
    'no-improve': 'Reaching {v} via {u} costs {cand}, no better than {old}: leave it.',
    relax: 'Relax {u}→{v}: {cand} beats {old}, so {v} now comes from {u}.',
    converged: 'Pass {pass} changed nothing: distances are final, so we stop early.',
    detect: 'All passes done: one more checks whether any edge still improves (negative cycle).',
    verify: '{u}→{v} no longer improves anything: no negative cycle here.',
    cycle: '{u}→{v} still improves after |V| − 1 passes: negative cycle {cycle}.',
    'done-cycle': 'A reachable negative cycle exists: distances can drop forever.',
    found: 'Shortest path to {t}: cost {cost}.',
    done: 'Done after {passes} passes: every reachable node has its minimum distance.',
  },
  legend: { visited: 'Reached', relaxed: 'Relaxed edge', dead: 'On negative cycle' },
};

export default content;
