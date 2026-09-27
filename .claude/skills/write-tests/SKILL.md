---
name: write-tests
description: When Algo Quest gets a new, changed or deleted test (Vitest or Playwright), and when it does not. Use before touching any *.test.ts or *.spec.ts, and whenever you fix a bug, refactor or are tempted to "add a test for this".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm test*), Bash(npm run *), Bash(npx vitest*), Bash(npx playwright test*)
---

# Write tests

The suite exists for two things: to prove the **algorithms are correct** and to prove the **site works end to end**. Every test must earn its place on one of those two. Anything else is noise: it slows CI, breaks on harmless refactors and hides the tests that matter.

**Default: don't add a test.** Add or change one only when the change falls in "Add a test" below.

## What the suite covers today

| Layer | Files | Guards |
|---|---|---|
| Algorithm fidelity | `src/algorithms/<cat>/<id>/algorithm.test.ts` | Result, counters, invariants and claimed traits against an independent reference |
| Content | `src/algorithms/content.test.ts` | Every narration key and option label exists in ES and EN |
| Shared logic | `src/core/compare.test.ts`, `src/data/generators.test.ts`, `src/themes/megadrive/palette.test.ts` | Invariants the pages rely on (pairing, generator guarantees, hardware palette) |
| End to end | `tests/e2e/visualizers.spec.ts` | Every algorithm page runs with the standard controls (ids come from the folders), plus the home, help, options and language/theme flows |
| End to end | `tests/e2e/playground.spec.ts`, `tests/e2e/compare.spec.ts` | Editors and compare page flows |
| Accessibility | `tests/e2e/a11y.spec.ts` | 0 axe violations per theme and page |

A new algorithm page is already covered end to end by the loop in `visualizers.spec.ts`. Don't add a spec for it.

## Add a test

| Change | Test |
|---|---|
| New algorithm | The fidelity tests from the `add-algorithm` skill: contract, independent reference, invariants, one proof per claimed trait. Nothing more. |
| New category | Its `testing.ts` (`checkContract` + generators) and the generator invariants in `src/data/generators.test.ts`, as in `add-algorithm`. |
| New theme | Its id in the theme list in `tests/e2e/a11y.spec.ts`. A palette test only if it emulates hardware with a fixed palette. |
| New page or user-facing feature | **One** e2e test for its main flow, as a user would use it. Extend an existing spec if the feature lives on an existing page. |
| New shared logic that pages depend on and e2e can't observe precisely (like `pairSteps` or the maze generator) | A unit test for its invariants, next to it. Prefer a fast-check property over hand-picked cases. |
| Intentional behavior change | Update the tests that assert the old behavior. Never loosen an assertion just to go green. |

## Don't add a test

- **Bug fixes, algorithm bugs included.** Reproduce the bug with a throwaway test or by hand, confirm it fails before the fix and passes after, then **delete the test before committing**. Say in the PR how you verified it. Don't add a test named after the bug, and don't grow generators or invariants to catch it.
- Refactors, renames and moved code. The existing tests are the safety net. If they pass, you're done.
- CSS, layout, copy, colors, sounds or animation tweaks.
- DOM helpers, `ui.*` components, renderers or scenes in isolation. If it matters, it shows up in an e2e flow.
- Implementation details: private functions, call counts, internal state, exact step counts that no feature promises.
- Constants, types, config, one-line wrappers, or code that only restates another piece of code.
- Snapshot tests, one test per i18n string, and anything `content.test.ts` or the e2e loop already covers.
- "Just in case" edge cases for code that has no bug and no new behavior.

## How to write the ones that belong

- One behavior per test, named after what the user or the algorithm guarantees, not after the code.
- Algorithm tests: properties with fast-check and the generators in `testing.ts`. The reference lives in the test file and never imports the core.
- E2e tests: drive the page with roles, keyboard and visible text, like a user. Don't assert on styling or pixel positions.
- Reuse the existing specs and helpers. Only create a new file for a new page.
- Never weaken a test to make it pass. Fix the code, unless the test is provably wrong.

## Before committing

Check `git diff --stat origin/dev -- '*.test.ts' '*.spec.ts'`. Every added or changed test must map to a row in "Add a test". Delete any throwaway test you used to verify a fix. Then run `npm test` and `npm run e2e`.
