import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { checkContract, collect, randomGraph, randomGrid, refHops } from '../testing';
import { INF } from '../types';
import { pseudocode, run } from './algorithm';

describe('BFS', () => {
  it('computes hop distances to every reachable node (no target)', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true }), randomGrid), (input) => {
      const full = { ...input, target: null };
      const steps = collect(run(full));
      checkContract(full, steps, pseudocode);
      expect(steps.at(-1)!.state.extra.dist).toEqual(refHops(input.graph, input.start));
    }), { numRuns: 300 });
  });

  it('finds a shortest path in hops to the target', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGrid), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const hops = refHops(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      if (hops === INF) expect(path).toBeNull();
      else expect(path!.length - 1).toBe(hops);
    }), { numRuns: 300 });
  });

  it('marks nodes on enqueue: each node is discovered once and dequeued in non-decreasing distance', () => {
    fc.assert(fc.property(randomGraph(), (input) => {
      const steps = collect(run({ ...input, target: null }));
      const discovered = steps.filter((s) => s.event === 'discover').map((s) => s.narration.params!.v);
      expect(new Set(discovered).size).toBe(discovered.length);
      const d = steps.filter((s) => s.event === 'visit').map((s) => s.vars['dist[u]'] as number);
      expect(d).toEqual([...d].sort((a, b) => a - b));
    }), { numRuns: 200 });
  });

  it('runs on the legacy dataset', () => {
    const f = legacyGraphs.bfs!;
    const steps = collect(run(f));
    checkContract(f, steps, pseudocode);
    expect(steps.at(-1)!.counters.visited).toBe(f.graph.nodes.length);
  });
});
