import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../../../data/legacy-graphs';
import { checkContract, collect, randomGrid, refHops } from '../testing';
import { INF } from '../types';
import { pseudocode, run } from './algorithm';

const smallGrid = randomGrid.filter((i) => i.graph.nodes.length <= 20);

describe('backtracking maze solver', () => {
  it.each(['memo', 'pure'] as const)('finds a valid path iff the exit is reachable (visited=%s)', (visited) => {
    fc.assert(fc.property(visited === 'pure' ? smallGrid : randomGrid, (input) => {
      const steps = collect(run(input, { visited }));
      checkContract(input, steps, pseudocode);
      const reachable = refHops(input.graph, input.start)[input.target!] !== INF;
      expect(steps.at(-1)!.state.path !== null).toBe(reachable);
    }), { numRuns: 300 });
  });

  it('memo mode enters each cell at most once', () => {
    fc.assert(fc.property(randomGrid, (input) => {
      const entered = collect(run(input)).filter((s) => s.event === 'visit').map((s) => s.vars.cell);
      expect(new Set(entered).size).toBe(entered.length);
    }), { numRuns: 200 });
  });

  it('path on screen always equals the recursion stack', () => {
    fc.assert(fc.property(randomGrid, (input) => {
      for (const s of collect(run(input))) {
        const onPath = s.state.nodes.flatMap((m, i) => (m === 'current' || m === 'frontier' ? [i] : [])).sort((a, b) => a - b);
        if (!['found', 'done', 'skip'].includes(s.event)) expect(onPath).toEqual([...s.state.extra.path].sort((a, b) => a - b));
      }
    }), { numRuns: 150 });
  });

  it('legacy maze: solved with at least 3 backtracks', () => {
    const f = legacyGraphs['backtracking-maze']!;
    const steps = collect(run(f));
    checkContract(f, steps, pseudocode);
    expect(steps.at(-1)!.counters.backtracks).toBeGreaterThanOrEqual(3);
  });
});
