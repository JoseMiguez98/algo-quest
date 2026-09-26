import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'A* search',
  tagline: 'Dijkstra with a compass: favours what looks closest to the target',
  summary:
    'A* orders its queue by f = g + h: g is the real cost from the start and h an estimate of what is left to the target. It therefore explores first the nodes that look like they lie on the best path. If h never overestimates (admissible) and is consistent, the first time the target is extracted its path is optimal, usually after far fewer nodes than Dijkstra.',
  steps: [
    'Set g[start] = 0 and put the start in OPEN with f = h(start).',
    'Extract the node with the lowest f (ties go to the lower h); if it is already in CLOSED it is a stale entry, skip it.',
    'Move it to CLOSED (if it is the target, you are done).',
    'For each neighbour not in CLOSED: if g[u] + w < g[v], update g[v] and its parent, and push it into OPEN with f = g[v] + h(v).',
    'The default heuristic is Euclidean on free graphs and Manhattan on grids: admissible and consistent when every weight is ≥ the distance it covers.',
  ],
  whenToUse:
    'Finding a path between two points when you can estimate the remaining distance: game pathfinding, robotics, maps and navigation. With h = 0 it becomes Dijkstra; with weight > 1 it trades optimality for speed.',
  references: [
    { title: 'A* search algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/A*_search_algorithm' },
    { title: 'Hart, Nilsson & Raphael (1968), “A Formal Basis for the Heuristic Determination of Minimum Cost Paths”', url: 'https://doi.org/10.1109/TSSC.1968.300136' },
    { title: 'Introduction to the A* Algorithm — Red Blob Games', url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html' },
  ],
  narration: {
    start: 'Start at {s}: g = 0 and h = {h}, into OPEN.',
    stale: 'Popped {u} with f = {key}, but it is already in CLOSED: a stale entry, skip it.',
    extract: 'Extract {u}, the lowest f = {g} + {h} = {key}: move it to CLOSED.',
    found: 'Extracted the target {t}: with an admissible h, its cost {cost} is optimal.',
    'done-found': 'Path found: cost {cost} over {len} edges.',
    closed: '{v} is already in CLOSED: ignore it.',
    seen: '{v} was already discovered: ignore it.',
    'no-improve': 'This way g[{v}] would be {cand}, no better than {old}: leave it.',
    discover: 'Discover {v} from {u}: g = {g}, f = {key}. It goes into OPEN.',
    improve: 'Going through {u} gives g[{v}] = {g} < {old}: better path, push again with f = {key}.',
    'done-all': 'OPEN is empty: {count} nodes were closed.',
    'done-unreachable': 'OPEN emptied without reaching the target: there is no path.',
  },
  legend: {
    frontier: 'In OPEN',
    current: 'Just extracted',
    visited: 'In CLOSED',
    focus: 'Stale entry',
    tree: 'Best known parent',
    relaxed: 'Relaxed edge',
    rejected: 'Discarded',
  },
  options: {
    heuristic: 'Heuristic h',
    'heuristic.manhattan': 'Manhattan (|Δx| + |Δy|)',
    'heuristic.euclidean': 'Euclidean (straight line)',
    'heuristic.zero': 'Zero (same as Dijkstra)',
    weight: 'Weight of h',
    'weight.1': '×1 (classic A*, optimal)',
    'weight.1.5': '×1.5 (weighted A*: faster, may not be optimal)',
    'weight.3': '×3 (nearly greedy: very fast, may not be optimal)',
  },
};

export default content;
