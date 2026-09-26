import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { checkContract, cheapestPathCost, collect, randomGraph, refDijkstra } from '../testing';
import { INF } from '../types';
import { pseudocode, reconstruct, run } from './algorithm';

describe('Floyd-Warshall', () => {
  it('all-pairs distances equal |V| runs of Dijkstra on non-negative graphs; paths reconstruct', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true })), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const { dist, next } = steps.at(-1)!.state.extra;
      input.graph.nodes.forEach((_, s) => {
        const ref = refDijkstra(input.graph, s);
        expect(dist[s]).toEqual(ref);
        ref.forEach((d, t) => {
          const p = reconstruct(next, s, t);
          if (d === INF) expect(p).toBeNull();
          else expect(cheapestPathCost(input.graph, p!)).toBe(d);
        });
      });
    }), { numRuns: 60 });
  }, 60_000);

  it('executes exactly |V|³ checks with k outermost', () => {
    fc.assert(fc.property(randomGraph(), (input) => {
      const steps = collect(run(input));
      const n = input.graph.nodes.length;
      expect(steps.at(-1)!.counters.checks).toBe(n ** 3);
      const ks = steps.filter((s) => s.event === 'pivot').map((s) => s.vars.k);
      expect(ks).toEqual(input.graph.nodes.map((nd) => nd.label));
    }), { numRuns: 30 });
  }, 60_000);

  it('detects negative cycles via a negative diagonal', () => {
    const f = legacyGraphs['floyd-warshall-negative-cycle']!;
    const steps = collect(run(f));
    checkContract(f, steps, pseudocode);
    expect(steps.at(-1)!.state.extra.negativeCycle).toBe(true);
    const ok = legacyGraphs['floyd-warshall']!;
    const s2 = collect(run(ok));
    checkContract(ok, s2, pseudocode);
    expect(s2.at(-1)!.state.extra.negativeCycle).toBe(false);
  });
});
