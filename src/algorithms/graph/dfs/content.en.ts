import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Depth-first search (DFS)',
  tagline: 'Goes as deep as possible before backing up',
  summary:
    'DFS follows one path until it cannot go any further, and only then backs up to try the next branch. This version is recursive: the call stack holds the current path from the start. If there is a target it stops as soon as it finds it, so the path it returns is valid but not necessarily the shortest.',
  steps: [
    'Mark the current node as visited (if it is the target, you are done).',
    'Go through its neighbours in order; already visited ones are ignored.',
    'On the first unvisited neighbour, recurse into it.',
    'When a node has no new neighbours left it is finished: return to its parent and continue with the next neighbour.',
  ],
  whenToUse:
    'Traversing a whole graph with little memory, cycle detection, topological sort, strongly connected components, bridges or maze generation. Do not use it for shortest paths: use BFS (unweighted) or Dijkstra.',
  references: [
    { title: 'Depth-first search — Wikipedia', url: 'https://en.wikipedia.org/wiki/Depth-first_search' },
    { title: 'CLRS, Introduction to Algorithms, §20.3 (22.3 in 3rd ed.)', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { title: 'Depth First Search — cp-algorithms', url: 'https://cp-algorithms.com/graph/depth-first-search.html' },
  ],
  narration: {
    start: 'Start the recursion at {s}.',
    visit: 'Visit {u} at depth {depth}: it stays on the stack while its neighbours are explored.',
    seen: '{v} was already visited: going there again would loop, ignore it.',
    descend: '{v} is unvisited: {u} waits on the stack and we go down to {v}.',
    resume: 'Back from {v} to {u}: continue with the next neighbour of {u}.',
    backtrack: '{u} has no new neighbours: it is finished, back up to {p}.',
    'finish-root': '{u} has no new neighbours left: the start node is finished.',
    found: 'Reached the target {t}: the call stack is the path, {len} edges long.',
    'done-found': 'Path found: {len} edges (not necessarily the shortest).',
    'done-all': 'Recursion finished: {count} nodes reachable from the start were visited.',
    'done-unreachable': 'All {count} reachable nodes explored without finding the target: there is no path.',
  },
  legend: { frontier: 'On the stack (waiting)', current: 'Current node', visited: 'Finished', tree: 'DFS tree edge' },
};

export default content;
