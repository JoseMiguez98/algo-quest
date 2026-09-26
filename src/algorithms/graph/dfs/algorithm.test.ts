import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { adjacency, type Graph } from '../model';
import { checkContract, collect, randomGraph, randomGrid, refHops } from '../testing';
import { INF } from '../types';
import { pseudocode, run } from './algorithm';

function refPreorder(graph: Graph, s: number): number[] {
  const adj = adjacency(graph);
  const seen = new Set<number>();
  const order: number[] = [];
  const visit = (u: number) => {
    seen.add(u);
    order.push(u);
    for (const { to } of adj[u]!) if (!seen.has(to)) visit(to);
  };
  visit(s);
  return order;
}

describe('DFS (recursive)', () => {
  it('visits nodes in textbook preorder for the documented neighbour order', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true }), randomGrid), (input) => {
      const full = { ...input, target: null };
      const steps = collect(run(full));
      checkContract(full, steps, pseudocode);
      expect(steps.at(-1)!.state.extra.order).toEqual(refPreorder(input.graph, input.start));
    }), { numRuns: 300 });
  });

  it('finds a valid path iff the target is reachable, and the path is the recursion stack', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGrid), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const reachable = refHops(input.graph, input.start)[input.target!] !== INF;
      expect(steps.at(-1)!.state.path !== null).toBe(reachable);
    }), { numRuns: 300 });
  });

  it('discovery/finish times nest like parentheses', () => {
    fc.assert(fc.property(randomGraph(), (input) => {
      const { discovery: d, finish: f } = collect(run({ ...input, target: null })).at(-1)!.state.extra;
      const seen = d.flatMap((t, i) => (t > 0 ? [i] : []));
      for (const u of seen) for (const v of seen) {
        const disjoint = f[u]! < d[v]! || f[v]! < d[u]!;
        const nested = (d[u]! < d[v]! && f[v]! < f[u]!) || (d[v]! < d[u]! && f[u]! < f[v]!);
        if (u !== v) expect(disjoint || nested).toBe(true);
      }
    }), { numRuns: 200 });
  });

  it('runs on the legacy dataset', () => {
    const f = legacyGraphs.dfs!;
    checkContract(f, collect(run(f)), pseudocode);
  });
});
