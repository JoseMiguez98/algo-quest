import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { manhattan } from '../model';
import { checkContract, cheapestPathCost, collect, randomGraph, randomGrid, refDijkstra } from '../testing';
import { INF } from '../types';
import { run as dijkstra } from '../dijkstra/algorithm';
import { pseudocode, run } from './algorithm';

describe('A*', () => {
  it('is optimal with an admissible, consistent heuristic (Euclidean on metric graphs, Manhattan on grids)', () => {
    fc.assert(fc.property(fc.oneof(randomGraph({ metric: true }), randomGrid), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const best = refDijkstra(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      if (best === INF) expect(path).toBeNull();
      else expect(cheapestPathCost(input.graph, path!)).toBe(best);
    }), { numRuns: 400 });
  });

  it('stays optimal on ANY positive-weight graph thanks to the scaled heuristic', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true }), randomGraph({ maxWeight: 2 })), fc.constantFrom('manhattan', 'euclidean') as fc.Arbitrary<'manhattan' | 'euclidean'>, (input, heuristic) => {
      const steps = collect(run(input, { heuristic }));
      checkContract(input, steps, pseudocode);
      const best = refDijkstra(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      if (best === INF) expect(path).toBeNull();
      else expect(cheapestPathCost(input.graph, path!)).toBe(best);
    }), { numRuns: 500 });
  });

  it('never expands more nodes than Dijkstra on metric graphs', () => {
    fc.assert(fc.property(randomGraph({ metric: true }), (input) => {
      const a = collect(run(input)).at(-1)!.counters.visited!;
      const d = collect(dijkstra(input)).at(-1)!.counters.visited!;
      expect(a).toBeLessThanOrEqual(d);
    }), { numRuns: 200 });
  });

  it('weighted A* (w > 1) still returns a valid, possibly suboptimal path', () => {
    fc.assert(fc.property(randomGraph({ metric: true }), (input) => {
      const steps = collect(run(input, { weight: 3 }));
      checkContract(input, steps, pseudocode);
      const best = refDijkstra(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      if (best === INF) expect(path).toBeNull();
      else expect(cheapestPathCost(input.graph, path!)).toBeGreaterThanOrEqual(best);
    }), { numRuns: 200 });
  });

  it('legacy dataset: Manhattan heuristic is consistent and the result optimal', () => {
    const f = legacyGraphs['a-star']!;
    for (const e of f.graph.edges) {
      const h = (u: number) => manhattan(f.graph, u, f.target!);
      expect(h(e.from)).toBeLessThanOrEqual(e.weight + h(e.to));
      expect(h(e.to)).toBeLessThanOrEqual(e.weight + h(e.from));
    }
    const steps = collect(run(f, { heuristic: 'manhattan' }));
    checkContract(f, steps, pseudocode);
    expect(cheapestPathCost(f.graph, steps.at(-1)!.state.path!)).toBe(refDijkstra(f.graph, f.start)[f.target!]);
  });
});
