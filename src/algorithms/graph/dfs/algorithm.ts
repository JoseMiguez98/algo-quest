import type { Pseudocode } from '../../../core/types';
import { adjacency, type Adjacency } from '../model';
import { GraphRecorder } from '../recorder';
import type { GraphInput, GraphStep } from '../types';

export interface DfsExtra {
  /** Recursion stack of node indices, bottom first. */
  stack: number[];
  order: number[];
  discovery: number[];
  finish: number[];
  parent: number[];
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure DFS(G, u)' },
  { id: 'mark', indent: 1, text: 'visited[u] ← true' },
  { id: 'goal', indent: 1, text: 'if u = target then return true' },
  { id: 'for', indent: 1, text: 'for each v in adj[u] do' },
  { id: 'check', indent: 2, text: 'if not visited[v] then' },
  { id: 'recurse', indent: 3, text: 'parent[v] ← u;  if DFS(G, v) then return true' },
  { id: 'backtrack', indent: 1, text: 'return false        ▹ backtrack to parent[u]' },
];

export function* run({ graph, start, target }: GraphInput): Generator<GraphStep<DfsExtra>> {
  const n = graph.nodes.length;
  const adj = adjacency(graph);
  const r = new GraphRecorder<DfsExtra>(graph, { stack: [], order: [], discovery: new Array(n).fill(-1), finish: new Array(n).fill(-1), parent: new Array(n).fill(-1) }, ['visited', 'edgeChecks', 'backtracks', 'maxDepth']);
  const clock = { t: 0 };
  yield r.step('start', 'fn', 'start', { params: { s: r.label(start) }, tone: r.tone(start) });
  const found = yield* visit(r, adj, start, target, clock);
  if (found && target !== null) {
    r.markPath(r.extra.stack, (a, b) => adj[a]!.find((x) => x.to === b)!.edge);
    yield r.step('found', 'goal', 'found', { params: { t: r.label(target), len: r.extra.stack.length - 1 } });
    yield r.step('done', null, 'done-found', { params: { len: r.extra.stack.length - 1 } });
    return;
  }
  yield r.step('done', null, target === null ? 'done-all' : 'done-unreachable', { params: { count: r.counters.visited! } });
}

function* visit(r: GraphRecorder<DfsExtra>, adj: Adjacency, u: number, target: number | null, clock: { t: number }): Generator<GraphStep<DfsExtra>, boolean> {
  const x = r.extra;
  x.stack.push(u);
  x.order.push(u);
  x.discovery[u] = ++clock.t;
  r.nodes[u] = 'current';
  r.badges[u] = String(x.order.length);
  r.count('visited');
  r.peak('maxDepth', x.stack.length - 1);
  yield r.step('visit', 'mark', 'visit', { vars: { u: r.label(u), depth: x.stack.length - 1 }, params: { u: r.label(u), depth: x.stack.length - 1 }, tone: r.tone(u) });
  if (u === target) return true;
  for (const { to: v, edge } of adj[u]!) {
    r.count('edgeChecks');
    if (x.discovery[v] !== -1) {
      yield r.step('skip', 'check', 'seen', { edges: { [edge]: 'rejected' }, vars: { u: r.label(u), v: r.label(v) }, params: { v: r.label(v) } });
      continue;
    }
    x.parent[v] = u;
    r.nodes[u] = 'frontier';
    r.edges[edge] = 'tree';
    yield r.step('descend', 'recurse', 'descend', { edges: { [edge]: 'active' }, vars: { u: r.label(u), v: r.label(v) }, params: { u: r.label(u), v: r.label(v) }, tone: r.tone(v) });
    if (yield* visit(r, adj, v, target, clock)) return true;
    r.nodes[u] = 'current';
    yield r.step('resume', 'for', 'resume', { vars: { u: r.label(u) }, params: { u: r.label(u), v: r.label(v) }, tone: r.tone(u) });
  }
  x.finish[u] = ++clock.t;
  x.stack.pop();
  r.nodes[u] = 'visited';
  const p = x.parent[u]!;
  if (p !== -1) r.count('backtracks');
  yield r.step('backtrack', 'backtrack', p === -1 ? 'finish-root' : 'backtrack', { vars: { u: r.label(u) }, params: { u: r.label(u), p: p === -1 ? null : r.label(p) }, tone: r.tone(u) });
  return false;
}
