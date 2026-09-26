import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { legacyGraphs } from '../data/legacy-graphs';
import type { AlgorithmContent } from '../core/algorithm';
import type { Primitive } from '../core/types';
import { algorithms } from './registry';

const langs = ['es', 'en'] as const;

/** Narration keys and params emitted over the default input, every option combo and random inputs. */
function emitted(def: (typeof algorithms)[number]): Map<string, Set<string>> {
  const keys = new Map<string, Set<string>>();
  const combos: Record<string, Primitive>[] = [{}];
  for (const o of def.options ?? []) {
    const next: Record<string, Primitive>[] = [];
    for (const c of combos) for (const v of o.values) next.push({ ...c, [o.id]: v });
    combos.splice(0, combos.length, ...next);
  }
  const inputs: unknown[] = [];
  if (def.input.kind === 'array') {
    const spec = def.input;
    inputs.push(spec.preset, ...fc.sample(fc.array(fc.integer({ min: spec.min, max: spec.max }), { minLength: spec.minN, maxLength: spec.maxN }), 25));
  } else {
    for (const id of [def.input.fixture, ...(def.input.alternatives ?? [])]) {
      const f = legacyGraphs[id]!;
      inputs.push({ graph: f.graph, start: f.start, target: f.target }, { graph: f.graph, start: f.target ?? f.start, target: f.start });
    }
  }
  for (const input of inputs) {
    for (const o of combos) {
      let steps;
      try {
        steps = [...def.run(input as never, { ...Object.fromEntries((def.options ?? []).map((x) => [x.id, x.default])), ...o })];
      } catch {
        continue;
      }
      for (const s of steps) {
        const set = keys.get(s.narration.key) ?? new Set<string>();
        Object.keys(s.narration.params ?? {}).forEach((p) => set.add(p));
        keys.set(s.narration.key, set);
      }
    }
  }
  return keys;
}

describe.each(algorithms.map((a) => [a.id, a] as const))('content for %s', (_, def) => {
  const keys = emitted(def);
  it.each(langs)('%s: every emitted narration key has a template using only emitted params', async (lang) => {
    const c: AlgorithmContent = (await def.content[lang]()).default;
    for (const [key, params] of keys) {
      const tpl = c.narration[key];
      expect(tpl, `${lang}: missing narration "${key}"`).toBeTruthy();
      for (const [, p] of tpl!.matchAll(/\{(\w+)\}/g)) expect(params, `${lang}: "${key}" uses {${p}}`).toContain(p);
    }
    expect(c.references.length).toBeGreaterThanOrEqual(2);
    for (const o of def.options ?? []) {
      expect(c.options?.[o.id], `${lang}: option label ${o.id}`).toBeTruthy();
      for (const v of o.values) expect(c.options?.[`${o.id}.${v}`], `${lang}: option ${o.id}.${v}`).toBeTruthy();
    }
  });
});
