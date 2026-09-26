import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { checkContract, cheapestPathCost, collect, randomGraph, randomGrid, refDijkstra } from '../testing';
import { INF } from '../types';
import { pseudocode, run } from './algorithm';

describe('Dijkstra', () => {
  it('computes shortest distances to all nodes (no target)', () => {
    fc.assert(fc.property(fc.oneof(randomGraph({ minWeight: 0 }), randomGraph({ directed: true }), randomGrid), (input) => {
      const full = { ...input, target: null };
      const steps = collect(run(full));
      checkContract(full, steps, pseudocode);
      expect(steps.at(-1)!.state.extra.g).toEqual(refDijkstra(input.graph, input.start));
    }), { numRuns: 300 });
  });

  it('returns an optimal path to the target', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true })), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const best = refDijkstra(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      if (best === INF) expect(path).toBeNull();
      else expect(cheapestPathCost(input.graph, path!)).toBe(best);
    }), { numRuns: 300 });
  });

  it('finalizes nodes in non-decreasing distance and never relaxes a final node', () => {
    fc.assert(fc.property(randomGraph(), (input) => {
      const steps = collect(run({ ...input, target: null }));
      const order = steps.filter((s) => s.event === 'visit').map((s) => s.vars.g as number);
      expect(order).toEqual([...order].sort((a, b) => a - b));
      for (const s of steps.filter((s) => s.event === 'relax')) {
        expect(s.state.extra.closed[input.graph.nodes.findIndex((n) => n.label === s.narration.params!.v)]).toBe(false);
      }
    }), { numRuns: 200 });
  });

  it('legacy dataset: optimal cost 15', () => {
    const f = legacyGraphs.dijkstra!;
    const steps = collect(run(f));
    checkContract(f, steps, pseudocode);
    expect(cheapestPathCost(f.graph, steps.at(-1)!.state.path!)).toBe(refDijkstra(f.graph, f.start)[f.target!]);
  });
});
