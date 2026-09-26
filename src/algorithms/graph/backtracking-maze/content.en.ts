import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Backtracking maze solver',
  tagline: 'Push ahead until stuck, then back up and try another way',
  summary:
    'This recursive maze solver moves from the entrance trying, in order, right, down, left and up. Every cell it steps on joins the current path; if no direction from there leads to the exit, it removes the cell from the path and goes back (backtracking). It finds an exit whenever one exists, but not necessarily the shortest route.',
  steps: [
    'From the current cell, give up if it is outside the grid, a wall or already visited.',
    'Mark it visited and push it onto the path; if it is the exit, you are done.',
    'Recursively try the neighbours in order: right, down, left, up.',
    'If none works, pop the cell from the path and return to the previous one.',
    'With “memo”, failed cells stay marked; in “pure” mode only cells on the current path are forbidden.',
  ],
  whenToUse:
    'To learn recursion and backtracking, solve small mazes or constraint search problems (sudoku, N-queens). If you need the shortest path, use BFS.',
  references: [
    { title: 'Maze-solving algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/Maze-solving_algorithm' },
    { title: 'Backtracking — Wikipedia', url: 'https://en.wikipedia.org/wiki/Backtracking' },
    { title: 'Rat in a Maze — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/dsa/rat-in-a-maze/' },
  ],
  narration: {
    start: 'Look for a path from {s} to {t} by trying directions and backing up when stuck.',
    visit: 'Step on {cell} (depth {depth}): it joins the current path.',
    'reject-path': '{cell} is already on the current path: going back there would loop.',
    'reject-visited': '{cell} was already explored and led nowhere: do not repeat it.',
    'reject-bounds': 'Going {dir} leaves the grid: try the next direction.',
    'reject-wall': 'Going {dir} hits a wall: try the next direction.',
    try: 'Try going {dir} to {next} and keep searching from there.',
    backtrack: 'No way out from {cell}: remove it from the path and back up.',
    found: 'Reached the exit! The path has {len} steps.',
    'done-found': 'Path found: {len} steps, though not necessarily the shortest.',
    'done-unreachable': 'Every option from the entrance failed: there is no path to the exit.',
  },
  legend: { frontier: 'On current path', current: 'Current cell', dead: 'Dead end' },
  options: {
    visited: 'Visited cells',
    'visited.memo': 'Memo',
    'visited.pure': 'Pure (current path only)',
  },
};

export default content;
