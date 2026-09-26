import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bidirectional BFS',
  tagline: 'Two BFS runs, one from each end, meeting in the middle',
  summary:
    'Runs one BFS from the start and another from the target (over reversed edges) and grows them until they touch. Since each only has to cover half the distance, it explores far fewer nodes than a single BFS. It does not stop at the first contact: it finishes the whole layer and keeps the shortest meeting, so the path is optimal.',
  steps: [
    'Put the start in one frontier and the target in the other, both at distance 0.',
    'Pick a side (strict alternation by default; with "smaller", the side with the smaller frontier) and expand its whole layer.',
    'Every neighbour already reached by the other side is a meeting: length = dX[u] + 1 + dY[v]; keep the best.',
    'New neighbours get distance +1 and join that side’s next layer.',
    'When a layer ends with a meeting, join the two half-paths through the best one.',
  ],
  whenToUse:
    'Shortest path between two known nodes in unweighted graphs with a high branching factor: degrees of separation, state-space puzzles, word ladders. You must be able to walk edges backwards from the target.',
  references: [
    { title: 'Bidirectional search — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bidirectional_search' },
    { title: 'Everyone gets bidirectional BFS wrong — zdimension', url: 'https://zdimension.fr/everyone-gets-bidirectional-bfs-wrong/' },
  ],
  narration: {
    start: 'Start two searches: one from {s} and one from {t}, both at distance 0.',
    'done-same': 'Start and target are the same node: the path has 0 edges.',
    'layer-forward': 'Start side’s turn: expand its whole layer of {size} nodes at distance {depth}.',
    'layer-backward': 'Target side’s turn: expand its whole layer of {size} nodes at distance {depth}.',
    expand: 'Expand {u}: check its neighbours.',
    meet: '{v} was reached by the other side: meeting via {u}–{v}, {length} edges, the best so far.',
    'meet-worse': 'Another meeting via {u}–{v}, but {length} edges long: no better than the current one.',
    seen: '{v} was already discovered from this side: ignore it.',
    discover: 'Discover {v} from {u}: distance {d}, it joins the next layer.',
    found: 'The layer ended with a meeting: join the two half-paths, {len} edges.',
    'done-found': 'Shortest path found: {len} edges.',
    fail: 'One frontier ran empty without touching the other.',
    'done-unreachable': 'The searches never met: there is no path from start to target.',
  },
  legend: {
    frontier: 'Frontier from the start',
    'frontier-b': 'Frontier from the target',
    visited: 'Expanded from the start',
    'visited-b': 'Expanded from the target',
    meet: 'Meeting point',
    tree: 'Start-side tree',
    'tree-b': 'Target-side tree',
  },
  options: {
    alternation: 'Side to expand',
    'alternation.alternate': 'Alternate',
    'alternation.smaller': 'Smaller frontier',
  },
};

export default content;
