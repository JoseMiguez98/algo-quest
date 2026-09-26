import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { checkContract, cheapestPathCost, collect, randomGraph, randomGrid, refDijkstra, refHops } from '../testing';
import { INF } from '../types';
import { pseudocode, run } from './algorithm';

describe('greedy best-first search', () => {
  it('finds a valid path iff reachable; cost is never below optimal', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true }), randomGrid), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const best = refDijkstra(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      expect(path !== null).toBe(refHops(input.graph, input.start)[input.target!] !== INF);
      if (path) expect(cheapestPathCost(input.graph, path)).toBeGreaterThanOrEqual(best);
    }), { numRuns: 400 });
  });

  it('discovers every node at most once (no reopening)', () => {
    fc.assert(fc.property(randomGraph(), (input) => {
      const pushed = collect(run(input)).filter((s) => s.event === 'relax').map((s) => s.narration.params!.v);
      expect(new Set(pushed).size).toBe(pushed.length);
    }), { numRuns: 200 });
  });

  it('legacy trap dataset: greedy is costlier than optimal', () => {
    const f = legacyGraphs['greedy-best-first']!;
    const steps = collect(run(f, { heuristic: 'manhattan' }));
    checkContract(f, steps, pseudocode);
    expect(cheapestPathCost(f.graph, steps.at(-1)!.state.path!)).toBeGreaterThan(refDijkstra(f.graph, f.start)[f.target!]!);
  });
});
