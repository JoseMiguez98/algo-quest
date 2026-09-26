import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { findEdge } from '../model';
import { checkContract, collect, randomGraph, refDijkstra, refFloyd, refHops } from '../testing';
import { INF } from '../types';
import { pseudocode, run } from './algorithm';

const negativeDirected = randomGraph({ directed: true, minWeight: -4, maxWeight: 9 });

/** A negative cycle is reachable from s iff some node reachable from s lies on a negative closed walk. */
function reachableNegativeCycle(input: Parameters<typeof run>[0]): boolean {
  const d = refFloyd(input.graph);
  const hops = refHops(input.graph, input.start);
  return d.some((row, v) => row[v]! < 0 && hops[v] !== INF);
}

describe('Bellman-Ford', () => {
  it('matches Dijkstra on non-negative weights', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true })), (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      expect(steps.at(-1)!.state.extra.dist).toEqual(refDijkstra(input.graph, input.start));
    }), { numRuns: 300 });
  });

  it('handles negative weights: exact distances without a cycle, detection with one', () => {
    fc.assert(fc.property(negativeDirected, (input) => {
      const steps = collect(run(input));
      checkContract(input, steps, pseudocode);
      const x = steps.at(-1)!.state.extra;
      if (reachableNegativeCycle(input)) {
        expect(x.negativeCycle).not.toBeNull();
        const cyc = x.negativeCycle!;
        let w = 0;
        cyc.forEach((v, i) => {
          const e = findEdge(input.graph, v, cyc[(i + 1) % cyc.length]!);
          expect(e).toBeGreaterThanOrEqual(0);
          w += input.graph.edges[e]!.weight;
        });
        expect(w).toBeLessThan(0);
      } else {
        expect(x.negativeCycle).toBeNull();
        expect(x.dist).toEqual(refFloyd(input.graph)[input.start]);
      }
    }), { numRuns: 500 });
  });

  it('stops early once a pass changes nothing, and never exceeds |V| − 1 passes', () => {
    fc.assert(fc.property(randomGraph({ directed: true }), (input) => {
      const steps = collect(run(input));
      expect(steps.at(-1)!.counters.passes).toBeLessThanOrEqual(Math.max(0, input.graph.nodes.length - 1));
      if (steps.some((s) => s.event === 'converged')) expect(steps.some((s) => s.event === 'detect')).toBe(false);
    }), { numRuns: 200 });
  });

  it('legacy datasets: no cycle vs negative cycle variant', () => {
    const ok = legacyGraphs['bellman-ford']!;
    const bad = legacyGraphs['bellman-ford-negative-cycle']!;
    const a = collect(run(ok));
    const b = collect(run(bad));
    checkContract(ok, a, pseudocode);
    checkContract(bad, b, pseudocode);
    expect(a.at(-1)!.state.extra.negativeCycle).toBeNull();
    expect(a.at(-1)!.state.extra.dist).toEqual(refFloyd(ok.graph)[ok.start]);
    expect(b.at(-1)!.state.extra.negativeCycle).not.toBeNull();
  });
});
