import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { refFloyd, refHops } from '../algorithms/graph/testing';
import { INF } from '../algorithms/graph/types';
import { mulberry32 } from '../core/rng';
import { ARRAY_PRESETS, arrayPreset, gridInput, maze, randomGraph, withNegativeCycle } from './generators';

const spec = { kind: 'graph', fixture: '', needsTarget: true, weighted: true } as const;

describe('generators', () => {
  it('array presets respect size and range', () => {
    fc.assert(fc.property(fc.integer(), fc.integer({ min: 1, max: 24 }), fc.constantFrom(...ARRAY_PRESETS), (seed, n, kind) => {
      const a = arrayPreset(kind, n, { kind: 'array', min: 3, max: 40, minN: 1, maxN: 24, preset: [] }, mulberry32(seed));
      expect(a).toHaveLength(n);
      a.forEach((v) => expect(v >= 3 && v <= 40).toBe(true));
    }), { numRuns: 300 });
  });

  it('random graphs are connected and metric (weights ≥ straight-line distance)', () => {
    fc.assert(fc.property(fc.integer(), (seed) => {
      const { graph, start } = randomGraph(spec, mulberry32(seed));
      expect(refHops(graph, start).every((d) => d !== INF)).toBe(true);
      for (const e of graph.edges) {
        const a = graph.nodes[e.from]!;
        const b = graph.nodes[e.to]!;
        expect(e.weight).toBeGreaterThanOrEqual(Math.hypot(a.x - b.x, a.y - b.y) - 1e-9);
      }
    }), { numRuns: 200 });
  });

  it('negative-weight graphs never contain a negative cycle; the cycle generator always does', () => {
    fc.assert(fc.property(fc.integer(), (seed) => {
      const neg = randomGraph({ ...spec, directed: true, negativeWeights: true }, mulberry32(seed));
      expect(neg.graph.edges.some((e) => e.weight < 0) || neg.graph.edges.length < 3).toBe(true);
      expect(refFloyd(neg.graph).every((row, i) => row[i]! >= 0)).toBe(true);
      const cyc = withNegativeCycle({ ...spec, directed: true, negativeWeights: true }, mulberry32(seed));
      expect(refFloyd(cyc.graph).some((row, i) => row[i]! < 0)).toBe(true);
    }), { numRuns: 200 });
  });

  it('mazes are perfect: every open cell reachable from the start', () => {
    fc.assert(fc.property(fc.integer(), (seed) => {
      const walls = new Set(maze(15, 9, mulberry32(seed)));
      const { graph } = gridInput('maze', mulberry32(seed));
      const hops = refHops(graph, 0);
      graph.nodes.forEach((_, i) => { if (!walls.has(i) && i !== graph.nodes.length - 1) expect(hops[i]).not.toBe(INF); });
      expect(hops[graph.nodes.length - 1]).not.toBe(INF);
    }), { numRuns: 100 });
  });
});
