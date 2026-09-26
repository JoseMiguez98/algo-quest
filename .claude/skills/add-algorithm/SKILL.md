---
name: add-algorithm
description: Add a new algorithm visualizer to Algo Quest (an existing category such as sorting or graph), or add a whole new category. Use when someone asks to add, port or implement an algorithm (e.g. "add comb sort", "agregá Prim", "new category: trees").
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm test*), Bash(npm run *), Bash(npx vitest*), Bash(npx playwright test*), WebSearch, WebFetch
---

# Add an algorithm

Algo Quest is educational: **accuracy beats everything**. An algorithm is done only when its core is property-tested against an independent reference and its content cites references you actually opened.

The central rule: an algorithm only emits semantic events (`compare`, `swap`, `visit`, `relax`…) with an immutable snapshot. It never knows about colors, sounds or the DOM.

Also read `AGENTS.md`. In particular: **no runtime dependencies and no asset files**. A new visual is a scene layer drawn with `StageRenderer` primitives, never an image. A new sound is a cue override (`cues`), never an audio file.

## 0. Decide before writing code

1. Check `src/algorithms/registry.ts` so it doesn't already exist. The id is a kebab-case slug with no suffix (`comb-sort`, `prim`).
2. Pick the **exact textbook variant** (pivot rule, gap sequence, tie-breaking, neighbour order). Write it down; it goes into `docs/fidelity.md`.
3. Is the category `sorting` or `graph`? If neither fits, first do **Add a new category** (end of this file).
4. Find the closest existing algorithm and use it as the template:
   - Sorting: `src/algorithms/sorting/shell-sort/` (small), `quick-sort/` (options), `merge-sort/` (aux layer).
   - Graph: `src/algorithms/graph/bfs/` (unweighted), `dijkstra/` (weighted, via `best-first.ts`), `bellman-ford/` (negative weights).

Read every file of the template before writing.

## 1. `algorithm.ts`: pure core

- Export `pseudocode: Pseudocode`, a list of `{ id, indent, text }`. Line ids are stable strings; the UI highlights them.
- Export `run(input, options)` as a generator of steps.
- Use the category recorder. It is the **only** code that touches data and counters, which keeps counts honest:
  - `SortRecorder` (`src/algorithms/sorting/recorder.ts`) or `GraphRecorder` (`src/algorithms/graph/recorder.ts`).
- Every animation frame is `yield r.step(event, lineId | null, narrationKey, { params, vars, marks, pointers, phase, tone })`.
  - `event` feeds the sound (`EVENT_CUES` in `src/core/sound.ts`) and the durations.
  - `narrationKey` must exist in both content files.
  - `vars` feed the watch panel.
- No DOM, no randomness without a seed, no mutation outside the recorder.
- Emit a final `done` step. Sorting calls `r.lockAll()` first.

## 2. `algorithm.test.ts`: fidelity tests (Vitest + fast-check)

Required, in this order:

1. The contract on edge cases and random input:
   - `checkContract` from `../testing`.
   - Sorting: `(values, steps, pseudocode, stable)`.
   - Graph: `(input, steps, pseudocode)`.
   - It checks the result, snapshot immutability, pseudocode line ids and counters.
2. **An independent reference implementation** written in the test file, not imported from the core. Assert equality of outputs and of the counters you show (comparisons, relaxations…).
3. Invariants specific to the algorithm. For example, the array is h-sorted after each pass, or nodes are dequeued in non-decreasing distance.
4. Every claimed trait is proven:
   - `stable: true` → a stability property with `isStable(finalItems(...))`.
   - `stable: false` → one fixed case where it is demonstrably unstable.
   - `optimal` → costs equal `refDijkstra` / `refHops`.
   - Negative weights → cycle detection.

Generators live in `testing.ts`: `smallInts`, `manyDuplicates`, `edgeCases`, `randomGraph()`, `randomGrid`. Use them before inventing new ones.

Run `npx vitest run src/algorithms/<cat>/<id>`. Fix the **algorithm**, never weaken the test, unless the test is provably wrong.

## 3. `content.es.ts` and `content.en.ts` (`AlgorithmContent`)

- `name`, `tagline` (one line), `summary` (≤ 150 words), `steps` (3–5 bullets), `whenToUse`.
- `narration`: one template per narration key emitted, with `{param}` placeholders matching `params`.
- `legend` and `options` labels if the algorithm uses them.
- `references`: **2–3 sources you verified with WebSearch/WebFetch**. Prefer Wikipedia (ES page for `es` when it exists), CLRS/Sedgewick (algs4.cs.princeton.edu), cp-algorithms, VisuAlgo. Never invent or guess a URL.
- Spanish uses rioplatense voseo, like the existing content ("Elegí", "levantá"), with correct accents.

`src/algorithms/content.test.ts` fails if a narration key or option label is missing.

## 4. `index.ts`: `defineAlgorithm`

Copy the template's `index.ts` and adjust the fields (types in `src/core/algorithm.ts`):
- `id`, `category`, `scene` (`bars` | `graph`), `layers` (see `src/scenes/layers/`).
- `input`:
  - Array: `min`, `max`, `minN`, `maxN`, `preset`.
  - Graph: `fixture` from `src/data/legacy-graphs.ts` or a generator, plus `needsTarget`, `weighted`, `directed`, `negativeWeights`, `gridOnly`, `maxNodes`.
- `options` (pickers), `complexity`, `traits`, `counters`, `legend`, `durations` (relative per event), `cues` (per-event sound overrides).
- `content: { es: () => import('./content.es'), en: () => import('./content.en') }`.

If it needs a visual the scenes don't have, write a layer in `src/scenes/layers/` and add its id to `layers`. Never draw colors directly; use `StageRenderer` primitives and `VisualState`s.

## 5. Wire it up

1. Add **one line** to `src/algorithms/registry.ts`: an import plus an entry in `algorithms`, in menu order from simple to advanced.
2. Add a row to `docs/fidelity.md` with the variant, the reference and the tested invariants.

The menu, clean URL `/<cat>/<id>/`, static HTML with `<title>`, controls, hotkeys, sounds, playground, compare page and e2e smoke test (the ids come from the folders) pick it up automatically.

## 6. Verify (all must pass)

```bash
npm run typecheck
npm test
npm run e2e
npm run build
```

Then open `http://localhost:5180/<cat>/<id>/` (`npm run dev`) and check:
- Step forward and back.
- The narration reads well in ES and EN.
- The code line follows the animation.
- Edit mode works.
- `/compare/?a=<id>&b=<other>` works.

Report what you checked. If something could not be verified, say so.

## 7. Keep this skill current

If a step here was wrong, missing or ambiguous, fix this file in the same PR. Examples: a file moved, a field was added to `defineAlgorithm`, or a check was missing. The next contributor's agent depends on it.

## Add a new category

Only when no existing scene models the data (trees, strings, geometry…). Besides everything above:

1. **Types.** Add the category to `Category` in `src/core/algorithm.ts`. If needed, add a new `scene` id and an input spec (`kind`) next to `ArrayInputSpec` / `GraphInputSpec`.
2. **Session.** Handle the new input kind and scene in `initialInput` and `sceneFor` in `src/core/session.ts`.
3. **Scene.** Write `src/scenes/<scene>.ts`, which turns state into renderer primitives. Add hit-testing if the data is editable.
4. **Recorder and tests.** Add a recorder and a `testing.ts` for the category (`checkContract` + generators), following the sorting ones.
5. **Generators.** Add input generators in `src/data/generators.ts`, with tests.
6. **Pages.**
   - Add the world to `WORLDS` in `src/pages/home.ts`, and a world title key.
   - In `src/pages/compare.ts`, add a default pair to `DEFAULTS` and the category to the `catBtns` list.
   - Add a shared-input rule in `src/core/compare.ts`.
7. **Playground.** Encode the input in the URL state (`src/playground/url-state.ts`). Add an editor in `src/playground/`, and hook it up in `toggleEdit` in `src/pages/visualizer.ts`.
8. **i18n.** Add `category.<c>` and the world title to both `src/i18n/es.ts` and `src/i18n/en.ts`.
9. **Two algorithms minimum.** Ship at least two, so compare mode has a pair.

Search for `'graph'` and `kind ===` across `src/` to find any branch you missed.
