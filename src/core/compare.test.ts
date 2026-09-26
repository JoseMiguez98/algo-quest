import { describe, expect, it } from 'vitest';
import { byId } from '../algorithms/registry';
import { pairSteps, sharedGraph } from './compare';
import type { Step } from './types';

const steps = (n: number): Step<unknown>[] => Array.from({ length: n }, (_, i) => ({ event: String(i), line: null, state: i, vars: {}, counters: {}, narration: { key: '' } }));

describe('pairSteps', () => {
  it('race: the shorter trace holds its last step while the longer one continues', () => {
    const p = pairSteps(steps(3), steps(6), 'race');
    expect(p).toHaveLength(6);
    expect(p.map((x) => x.state.aIndex)).toEqual([0, 1, 2, 2, 2, 2]);
    expect(p.map((x) => x.state.bIndex)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('sync: both reach their first and last steps together', () => {
    const p = pairSteps(steps(3), steps(9), 'sync');
    expect(p[0]!.state.aIndex).toBe(0);
    expect(p.at(-1)!.state.aIndex).toBe(2);
    expect(p.at(-1)!.state.bIndex).toBe(8);
    const a = p.map((x) => x.state.aIndex);
    expect(a).toEqual([...a].sort((x, y) => x - y));
  });
});

describe('sharedGraph', () => {
  it('uses the maze when either algorithm only walks grids', () => {
    const c = sharedGraph(byId('backtracking-maze')!, byId('bfs')!, 1);
    expect(c.input.graph.grid).toBeDefined();
  });

  it('avoids negative weights unless both support them, and warns when forced', () => {
    const ok = sharedGraph(byId('dijkstra')!, byId('bellman-ford')!, 1);
    expect(ok.input.graph.edges.every((e) => e.weight >= 0)).toBe(true);
    const neg = sharedGraph(byId('bellman-ford')!, byId('floyd-warshall')!, 1);
    expect(neg.input.target).not.toBeNull();
  });
});
