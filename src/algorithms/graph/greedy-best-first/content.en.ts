import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Greedy best-first search',
  tagline: 'Always heads for whatever looks closest to the goal',
  summary:
    'Greedy best-first search always picks the node in OPEN with the lowest heuristic h, the one that looks closest to the target. It ignores the accumulated cost g entirely. That makes it very fast in practice, but the path it finds is not guaranteed to be the shortest: a wall or an expensive detour can fool it.',
  steps: [
    'Put the start in OPEN with priority h(start) and mark it discovered.',
    'Take the node with the lowest h out of OPEN and close it.',
    'If it is the target, rebuild the path by following parents.',
    'Every neighbour not yet discovered remembers where it came from and joins OPEN with priority h. Discovered nodes are never reopened.',
    'Repeat until the target is found or OPEN is empty.',
  ],
  whenToUse:
    'When any path found quickly is good enough and optimality is not required: games, prototypes or huge search spaces with a good heuristic. If you need the shortest path, use A*.',
  references: [
    { title: 'Best-first search — Wikipedia', url: 'https://en.wikipedia.org/wiki/Best-first_search' },
    { title: 'Introduction to the A* Algorithm (Greedy Best First) — Red Blob Games', url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html' },
    { title: 'Heuristics — Amit Patel, Stanford', url: 'http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html' },
  ],
  narration: {
    start: 'Start at {s} with h = {h}: it joins OPEN and is marked discovered.',
    stale: '{u} is already closed: this old OPEN entry (h {key}) is discarded.',
    extract: 'Take {u}, the lowest h in OPEN ({h}): it looks closest to the target.',
    found: 'Reached the target {t}: the path costs {cost}, though it may not be the minimum.',
    closed: '{v} is already closed: greedy search never reopens it.',
    seen: '{v} was already discovered: we do not add it again, even if this route is better.',
    'no-improve': 'Reaching {v} with cost {cand} does not beat {old}: ignore it.',
    discover: 'Discover {v} from {u}: it joins OPEN with priority h = {key}.',
    improve: 'Better route to {v} via {u}: cost {g} (was {old}); back into OPEN with h = {key}.',
    'done-found': 'Path found: {len} edges, cost {cost}. Fast, but not guaranteed to be the shortest.',
    'done-all': 'OPEN is empty: {count} nodes closed.',
    'done-unreachable': 'OPEN emptied without reaching the target: there is no path.',
  },
  legend: { frontier: 'In OPEN', visited: 'Closed' },
  options: {
    heuristic: 'Heuristic',
    'heuristic.manhattan': 'Manhattan',
    'heuristic.euclidean': 'Euclidean',
  },
};

export default content;
