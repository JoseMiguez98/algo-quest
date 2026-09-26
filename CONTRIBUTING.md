# 🤝 Contributing to Algo Quest

[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](#-pr-checklist)
[![AI agents ready](https://img.shields.io/badge/AI_agents-ready-8a2be2)](AGENTS.md)
[![Runtime dependencies: 0](https://img.shields.io/badge/runtime_deps-0-brightgreen)](package.json)
[![Good first issues](https://img.shields.io/github/issues/JoseMiguez98/algo-quest/good%20first%20issue?label=good%20first%20issues&color=7057ff)](https://github.com/JoseMiguez98/algo-quest/labels/good%20first%20issue)

Thanks for joining in! There are many ways to contribute: a new algorithm, a theme, a translation, a bug report, a better reference or a clearer explanation. Issues and PRs are welcome in English or Spanish.

> [!TIP]
> ⭐ **If you haven't yet, give the repo a star.** It helps more people find the project, and more people means
> more algorithms and more themes.
>
> Looking for a place to start? Check the issues labeled
> [`good first issue`](https://github.com/JoseMiguez98/algo-quest/labels/good%20first%20issue).

## 🤖 Contributing with an AI agent

This repo is designed for you to contribute **side by side with an AI agent**. The goal is for all of us to follow the same steps and the same quality bar, no matter who writes the code.

| File | What it gives the agent |
|---|---|
| [`AGENTS.md`](AGENTS.md) | The project rules. Read by Claude Code (via `CLAUDE.md`), Cursor, Codex, Copilot and others |
| [`.claude/skills/add-algorithm`](.claude/skills/add-algorithm/SKILL.md) | The step-by-step guide to adding an algorithm or a category |
| [`.claude/skills/add-theme`](.claude/skills/add-theme/SKILL.md) | The step-by-step guide to creating a theme |
| [`.claude/skills/gitflow`](.claude/skills/gitflow/SKILL.md) | Branches, commits, PRs, releases and hotfixes |

**How to work:**

1. With [Claude Code](https://claude.com/claude-code), the skills kick in on their own. Ask it to "add comb sort" or "make me a Game Boy theme" and the agent follows the full checklist.
2. With another agent, tell it to read `AGENTS.md` and the matching skill before starting.
3. **You remain responsible for the PR.**
   - Review what the agent produced.
   - Open the visualizer and watch it step by step.
   - Verify the references.
   - The agent should never push or open PRs without your OK.
4. If the agent got stuck on something the skill didn't explain, **improving the skill in the same PR (or another one) is a contribution too**. Skills are living documentation.

You can contribute without an agent as well: the skills read as plain checklists.

## 🧭 Before you start

- For big changes (a new category, a theme, architecture changes), open an issue first using the matching template. That way we agree on the approach before you invest time.
- For something small (a typo, an obvious bug), send the PR directly.
- By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
- Found a security problem? Report it privately as described in [SECURITY.md](.github/SECURITY.md), not in a public issue.

## 🛠️ Set up your environment

Requires Node 20 or later.

```bash
git clone https://github.com/JoseMiguez98/algo-quest.git
cd algo-quest
git switch dev
npm install
npx playwright install chromium   # first time only, for the e2e tests
npm run dev                       # http://localhost:5180
```

| Command | What it does |
|---|---|
| `npm test` | Accuracy tests (Vitest + fast-check) |
| `npm run e2e` | End-to-end and accessibility (Playwright + axe) |
| `npm run typecheck` | Strict TypeScript |
| `npm run build` | Static site in `dist/` |

## 🏗️ The architecture in one line

**Algorithms only emit semantic events** (`compare`, `swap`, `visit`, `relax`…) with an immutable snapshot of the state. They never know about colors, sounds or the DOM.

From those events:
- scenes (`src/scenes/`) translate the state into primitives;
- the theme (`src/themes/`) decides how each one looks and sounds.

The full folder map is in the [README](README.md).

## 🧱 Everything is made with code

Algo Quest has no runtime libraries and no asset files. Contributions must respect the same:

- **No runtime dependencies.** `package.json` has no `dependencies` and it stays that way. If a new dev tool is needed, discuss it in an issue first.
- **No images, audio or icon fonts.** These are the alternatives:

| Instead of | Use |
|---|---|
| PNG, JPG or GIF, sprites | Theme renderer primitives (canvas), or SVG built in code with `src/themes/pixel/svg.ts` |
| Icons | `src/ui/icons.ts`: 8×8 icons defined pixel by pixel |
| MP3 or WAV | `SoundPack` cues synthesized with Web Audio |
| Recorded music | A procedural `MusicTrack` |

The only exceptions are the UI typefaces from Google Fonts (OFL-licensed) and the GoatCounter counter in production. The screenshots and GIFs in `docs/media/` are only for documenting the README and are never imported from `src/`.

## 🎯 The accuracy bar

This is a site for learning, so a wrongly shown algorithm is worse than none. For an algorithm to be accepted:

1. **Pure, recorded core.** A generator that only touches the data through `SortRecorder` or `GraphRecorder`, so the counters stay honest.
2. **Tests against an independent reference.**
   - fast-check property tests that compare the result and the counters against a separately written reference implementation.
   - Tests for the algorithm's own invariants.
3. **Proven traits.**
   - If it says "stable", there's a stability test.
   - If it says "not stable", there's a concrete case that shows it.
   - If it says "optimal", its costs match the reference.
4. **A row in [`docs/fidelity.md`](docs/fidelity.md)** with the implemented variant, the reference and the tested invariants.

A test is never weakened to make it pass: the algorithm gets fixed.

## ➕ Adding an algorithm

Follow the checklist in [`.claude/skills/add-algorithm/SKILL.md`](.claude/skills/add-algorithm/SKILL.md). Summary:

1. Create `src/algorithms/<category>/<id>/` with these files:
   - `algorithm.ts` (pseudocode + `run`);
   - `algorithm.test.ts`;
   - `content.es.ts` and `content.en.ts`;
   - `index.ts` (`defineAlgorithm`).
2. Add a line in `src/algorithms/registry.ts` and a row in `docs/fidelity.md`.
3. The menu, the URL, the controls, the playground, the comparator and the e2e tests pick it up on their own.

If you use [Claude Code](https://claude.com/claude-code), ask it to "add algorithm X": the `add-algorithm` skill guides it step by step. If you don't, the same file works as a checklist.

For a **new category** (trees, strings, geometry…), open an issue first: the skill lists everything that needs to change.

## 🎨 Adding a theme

Follow [`.claude/skills/add-theme/SKILL.md`](.claude/skills/add-theme/SKILL.md). A theme implements `Theme` (`src/themes/contract.ts`) and has four parts:

1. **Tokens:** every `RequiredColor` and one color per visual state.
2. **CSS:** the skin for every component.
3. **Renderer:** `PixelRenderer` with its own style, or a new one.
4. **Sound pack:** every cue, synthesized with Web Audio and with no audio files.

It must pass the accessibility audit (`tests/e2e/a11y.spec.ts`) with no violations, AA contrast included.

## 🌎 Content and translations

- Every visible string exists in **Spanish and English**.
  - The UI lives in `src/i18n/`.
  - Algorithms, in `content.es.ts` and `content.en.ts`.
  - `src/algorithms/content.test.ts` fails if a key is missing.
- Spanish uses Rioplatense *voseo* ("elegí", "levantá") with correct accents.
- Each algorithm cites **2–3 references you opened and verified**: Wikipedia, CLRS or Sedgewick, cp-algorithms, VisuAlgo. URLs are never made up.
- Narrations explain the *why* of each step, not just the *what*: "7 > 3 → swap".

## 🌿 Branches, commits and PRs

The details are in [`.claude/skills/gitflow/SKILL.md`](.claude/skills/gitflow/SKILL.md).

**Branches and environments:**

| Branch | Environment |
|---|---|
| `dev` | Integration and preview at https://josemiguez98.github.io/algo-quest/dev/ |
| `main` | Production at https://josemiguez98.github.io/algo-quest/ |

**Your branch:**
- Starts from `dev` with a prefix: `algo/<id>`, `theme/<id>`, `feat/…`, `fix/…`, `docs/…` or `chore/…`.
- The PR goes into `dev`.

**Commits:**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with a short subject, for example `feat(algo): add comb sort`.
- Carry no AI tool attribution trailers.

**Merge:** it takes a green CI and the **maintainer's approval (@JoseMiguez98)**, which is required on both `dev` and `main`. If you push new changes to the PR, it has to be approved again. The PR is then squash-merged, and the maintainer promotes `dev` to `main`.

### ✅ PR checklist

- [ ] `npm run typecheck && npm test && npm run e2e && npm run build` pass.
- [ ] No new runtime dependencies and no image or audio files.
- [ ] If you worked with an agent: you reviewed the result by hand and updated the skill if needed.
- [ ] For an algorithm: tests against an independent reference, a row in `docs/fidelity.md`, ES/EN content and verified references.
- [ ] For a theme: every `RequiredColor`, CSS covering every class, and a passing a11y audit.
- [ ] A screenshot or GIF if something visual changes.
- [ ] Tested by hand on desktop and mobile (~390 px).

## ✍️ Code style

- **Strict TypeScript** (`noUncheckedIndexedAccess`) and no `any` unless justified.
- **Clear names over comments.** Only comment what someone would get wrong without it (an invariant, a workaround), in one line.
- **Match the code next to yours:** same idiom, same helpers (`h()` for DOM, `ui.*` for components) and zero new dependencies without discussing them first.
- **Accessibility:** every control is a real DOM element with visible focus, animations respect `prefers-reduced-motion`, and the canvas has an `aria-label`.

## 📄 License

By contributing you agree that your contribution is published under the project's [MIT license](LICENSE).
