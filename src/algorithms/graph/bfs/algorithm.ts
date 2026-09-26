import type { Pseudocode } from '../../../core/types';
import { adjacency } from '../model';
import { GraphRecorder, walkParents } from '../recorder';
import { INF, type GraphInput, type GraphStep } from '../types';

export interface BfsExtra {
  queue: number[];
  dist: number[];
  parent: number[];
  level: number;
}

export const pseudocode: Pseudocode = [
  { id: 'fn', indent: 0, text: 'procedure BFS(G, s)' },
  { id: 'init', indent: 1, text: 'dist[v] ← ∞ for every v;  dist[s] ← 0;  Q ← [s]' },
  { id: 'loop', indent: 1, text: 'while Q is not empty do' },
  { id: 'dequeue', indent: 2, text: 'u ← dequeue(Q)' },
  { id: 'goal', indent: 2, text: 'if u = target then return path(u)' },
  { id: 'for', indent: 2, text: 'for each v in adj[u] do' },
  { id: 'check', indent: 3, text: 'if dist[v] = ∞ then' },
  { id: 'discover', indent: 4, text: 'dist[v] ← dist[u] + 1;  parent[v] ← u' },
  { id: 'enqueue', indent: 4, text: 'enqueue(Q, v)' },
];

export function* run({ graph, start, target }: GraphInput): Generator<GraphStep<BfsExtra>> {
  const n = graph.nodes.length;
  const adj = adjacency(graph);
  const r = new GraphRecorder<BfsExtra>(graph, { queue: [], dist: new Array(n).fill(INF), parent: new Array(n).fill(-1), level: 0 }, ['visited', 'discovered', 'edgeChecks', 'maxFrontier']);
  const { dist, parent } = r.extra;
  dist[start] = 0;
  r.extra.queue.push(start);
  r.nodes[start] = 'frontier';
  r.badges[start] = '0';
  r.count('discovered');
  r.peak('maxFrontier', 1);
  yield r.step('start', 'init', 'start', { vars: { s: r.label(start) }, params: { s: r.label(start) }, tone: r.tone(start) });
  while (r.extra.queue.length) {
    const u = r.extra.queue.shift()!;
    r.count('visited');
    r.nodes[u] = 'current';
    const newLevel = dist[u]! > r.extra.level || u === start;
    r.extra.level = dist[u]!;
    yield r.step('visit', 'dequeue', 'dequeue', { vars: { u: r.label(u), 'dist[u]': dist[u]! }, params: { u: r.label(u), d: dist[u]! }, tone: r.tone(u), phase: newLevel ? `level-${dist[u]}` : undefined });
    if (u === target) {
      r.markPath(walkParents(parent, u), (a, b) => adj[a]!.find((x) => x.to === b)!.edge);
      yield r.step('found', 'goal', 'found', { vars: { u: r.label(u) }, params: { t: r.label(u), d: dist[u]! } });
      yield r.step('done', null, 'done-found', { params: { d: dist[u]! } });
      return;
    }
    for (const { to: v, edge } of adj[u]!) {
      r.count('edgeChecks');
      if (dist[v] !== INF) {
        yield r.step('skip', 'check', 'seen', { edges: { [edge]: 'rejected' }, vars: { u: r.label(u), v: r.label(v), 'dist[v]': dist[v]! }, params: { v: r.label(v), d: dist[v]! } });
        continue;
      }
      dist[v] = dist[u]! + 1;
      parent[v] = u;
      r.extra.queue.push(v);
      r.nodes[v] = 'frontier';
      r.edges[edge] = 'tree';
      r.badges[v] = String(dist[v]);
      r.count('discovered');
      r.peak('maxFrontier', r.extra.queue.length);
      yield r.step('discover', 'enqueue', 'discover', { edges: { [edge]: 'active' }, vars: { u: r.label(u), v: r.label(v), 'dist[v]': dist[v]! }, params: { v: r.label(v), u: r.label(u), d: dist[v]! }, tone: r.tone(v) });
    }
    r.nodes[u] = 'visited';
  }
  yield r.step('done', null, target === null ? 'done-all' : 'done-unreachable', { params: { count: r.counters.visited! } });
}
