import type { Pseudocode } from '../../../core/types';
import { GRID_DIRECTIONS, findEdge } from '../model';
import { GraphRecorder } from '../recorder';
import type { GraphInput, GraphStep } from '../types';

export interface BacktrackOptions {
  /** 'memo' keeps cells that failed marked (standard maze solver); 'pure' only forbids cells on the current path. */
  visited: 'memo' | 'pure';
}

export interface BacktrackExtra {
  path: number[];
  tried: { cell: number; dir: string } | null;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure solve(cell)' },
  { id: 'reject', indent: 1, text: 'if cell is outside, a wall or already visited then return false' },
  { id: 'mark', indent: 1, text: 'mark cell visited;  push cell onto path' },
  { id: 'goal', indent: 1, text: 'if cell = exit then return true' },
  { id: 'for', indent: 1, text: 'for each direction d in [right, down, left, up] do' },
  { id: 'recurse', indent: 2, text: 'if solve(cell + d) then return true' },
  { id: 'undo', indent: 1, text: 'pop cell from path          ▹ backtrack' },
  { id: 'fail', indent: 1, text: 'return false' },
];

export function* run(input: GraphInput, options: Partial<BacktrackOptions> = {}): Generator<GraphStep<BacktrackExtra>> {
  const { graph, start, target } = input;
  const grid = graph.grid;
  if (!grid) throw new RangeError('backtracking maze needs a grid graph');
  if (target === null) throw new RangeError('backtracking maze needs an exit');
  const mode = options.visited ?? 'memo';
  const walls = new Set(grid.walls);
  const visited = new Set<number>();
  const r = new GraphRecorder<BacktrackExtra>(graph, { path: [], tried: null }, ['calls', 'visited', 'rejects', 'backtracks', 'maxDepth']);
  const x = r.extra;
  const edge = (a: number, b: number) => findEdge(graph, a, b);
  yield r.step('start', 'fn', 'start', { params: { s: r.label(start), t: r.label(target) } });

  function* solve(cell: number, from: number | null, dir: string | null): Generator<GraphStep<BacktrackExtra>, boolean> {
    r.count('calls');
    const c = cell % grid!.cols;
    const row = Math.floor(cell / grid!.cols);
    const e = from === null ? -1 : edge(from, cell);
    if (visited.has(cell)) {
      r.count('rejects');
      x.tried = { cell, dir: dir ?? '' };
      yield r.step('skip', 'reject', x.path.includes(cell) ? 'reject-path' : 'reject-visited', { nodes: { [cell]: 'focus' }, edges: e >= 0 ? { [e]: 'rejected' } : {}, vars: { cell: r.label(cell), dir }, params: { cell: r.label(cell), dir } });
      return false;
    }
    x.tried = null;
    visited.add(cell);
    x.path.push(cell);
    r.count('visited');
    r.peak('maxDepth', x.path.length - 1);
    r.nodes[cell] = 'current';
    if (e >= 0) r.edges[e] = 'tree';
    r.badges[cell] = String(x.path.length - 1);
    yield r.step('visit', 'mark', 'visit', { vars: { cell: r.label(cell), depth: x.path.length - 1, c, r: row }, params: { cell: r.label(cell), depth: x.path.length - 1 }, tone: r.tone(cell) });
    if (cell === target) return true;
    r.nodes[cell] = 'frontier';
    for (const d of GRID_DIRECTIONS) {
      const nc = c + d.dc;
      const nr = row + d.dr;
      const next = nr * grid!.cols + nc;
      x.tried = { cell, dir: d.name };
      if (nc < 0 || nr < 0 || nc >= grid!.cols || nr >= grid!.rows || walls.has(next)) {
        r.count('rejects');
        yield r.step('skip', 'reject', nc < 0 || nr < 0 || nc >= grid!.cols || nr >= grid!.rows ? 'reject-bounds' : 'reject-wall', { vars: { cell: r.label(cell), dir: d.name }, params: { dir: d.name } });
        continue;
      }
      yield r.step('try', 'recurse', 'try', { vars: { cell: r.label(cell), dir: d.name }, params: { dir: d.name, next: r.label(next) } });
      if (yield* solve(next, cell, d.name)) return true;
      r.nodes[cell] = 'frontier';
    }
    x.tried = null;
    x.path.pop();
    if (mode === 'pure') visited.delete(cell);
    r.nodes[cell] = mode === 'pure' ? null : 'dead';
    r.badges[cell] = null;
    if (e >= 0) r.edges[e] = 'rejected';
    r.count('backtracks');
    yield r.step('backtrack', 'undo', 'backtrack', { vars: { cell: r.label(cell) }, params: { cell: r.label(cell) }, tone: r.tone(cell) });
    return false;
  }

  const found = yield* solve(start, null, null);
  x.tried = null;
  if (found) {
    r.markPath(x.path, edge);
    yield r.step('found', 'goal', 'found', { params: { len: x.path.length - 1 } });
    yield r.step('done', null, 'done-found', { params: { len: x.path.length - 1 } });
  } else {
    yield r.step('done', 'fail', 'done-unreachable', {});
  }
}
