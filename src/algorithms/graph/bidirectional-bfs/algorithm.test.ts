import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { checkContract, collect, randomGraph, randomGrid, refHops } from '../testing';
import { INF } from '../types';
import { pseudocode, run, type Alternation } from './algorithm';

describe.each<Alternation>(['alternate', 'smaller'])('bidirectional BFS (%s)', (alternation) => {
  it('finds a shortest path in hops, on undirected and directed graphs', () => {
    fc.assert(fc.property(fc.oneof(randomGraph(), randomGraph({ directed: true }), randomGrid), (input) => {
      const steps = collect(run(input, { alternation }));
      checkContract(input, steps, pseudocode);
      const hops = refHops(input.graph, input.start)[input.target!]!;
      const path = steps.at(-1)!.state.path;
      if (hops === INF) expect(path).toBeNull();
      else expect(path!.length - 1).toBe(hops);
    }), { numRuns: 400 });
  });

  it('runs on the legacy dataset and matches plain BFS', () => {
    const f = legacyGraphs['bidirectional-bfs']!;
    const steps = collect(run(f, { alternation }));
    checkContract(f, steps, pseudocode);
    expect(steps.at(-1)!.state.path!.length - 1).toBe(refHops(f.graph, f.start)[f.target!]);
  });
});
