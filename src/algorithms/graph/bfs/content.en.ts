import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Breadth-first search (BFS)',
  tagline: 'Explores level by level, like a spreading ripple',
  summary:
    'BFS first visits every neighbour of the start, then the neighbours of those neighbours, and so on. It uses a FIFO queue: whatever is discovered first is processed first. That is why, on an unweighted graph, it finds the path with the fewest edges to every node.',
  steps: [
    'Put the start in the queue with distance 0.',
    'Take the first node out of the queue.',
    'Every neighbour not yet discovered gets distance +1, remembers where it came from and joins the back of the queue.',
    'Repeat until the queue is empty (or the target is dequeued).',
  ],
  whenToUse:
    'Shortest paths on unweighted graphs (mazes, social networks, game states), finding connected components or hop distances. If edges have different weights, use Dijkstra.',
  references: [
    { title: 'Breadth-first search — Wikipedia', url: 'https://en.wikipedia.org/wiki/Breadth-first_search' },
    { title: 'CLRS, Introduction to Algorithms, §20.2 (22.2 in 3rd ed.)', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { title: 'Breadth-first search — cp-algorithms', url: 'https://cp-algorithms.com/graph/breadth-first-search.html' },
  ],
  narration: {
    start: 'Start at {s}: distance 0, into the queue.',
    dequeue: 'Dequeue {u} (distance {d}) and check its neighbours.',
    seen: '{v} was already discovered (distance {d}): ignore it.',
    discover: 'Discover {v} from {u}: distance {d}. It joins the back of the queue.',
    found: 'Dequeued the target {t}: the shortest path has {d} edges.',
    'done-found': 'Shortest path found: {d} edges.',
    'done-all': 'The queue is empty: {count} nodes visited, each with its minimum hop distance.',
    'done-unreachable': 'The queue emptied without reaching the target: there is no path.',
  },
  legend: { frontier: 'In the queue', visited: 'Processed' },
};

export default content;
