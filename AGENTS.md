# Algo Quest: instructions for AI agents

Algo Quest is a visualizer and playground for computer science algorithms, and it is built to be extended with AI agents. These rules apply to every agent and every contributor. Detailed, step-by-step workflows live in `.claude/skills/`. Read the matching one **before** starting a task:

| Task | Skill |
|---|---|
| Add an algorithm or a category | `.claude/skills/add-algorithm/SKILL.md` |
| Create a theme | `.claude/skills/add-theme/SKILL.md` |
| Branch, commit, open a PR, release | `.claude/skills/gitflow/SKILL.md` |

## Non-negotiable rules

1. **Accuracy first.**
   - Algorithm cores are property-tested against an independent reference implementation.
   - Never weaken a test to make it pass; fix the algorithm.
   - Every claimed trait (stable, optimal…) has a test.
2. **Algorithms emit semantic events only.** Cores yield immutable snapshots through `SortRecorder` / `GraphRecorder`. They never touch colors, sounds or the DOM.
3. **Zero runtime dependencies.**
   - `package.json` has no `dependencies`; don't add any.
   - Dev tooling needs discussion in an issue first.
4. **No asset files.** No images, audio or icon fonts. Everything is generated in code:
   - visuals with canvas through the theme renderer, SVG built in code (`src/themes/pixel/svg.ts`) and CSS;
   - sound and music with Web Audio synthesis.
   - The only external resources allowed are UI typefaces from Google Fonts (OFL) and the GoatCounter script in production.
   - `docs/media/` holds README screenshots only. Never import it from `src/`.
5. **Bilingual.** Every user-facing string exists in Spanish (rioplatense voseo, with correct accents) and in English.
6. **References are verified.** Cite only sources you actually opened, and never guess a URL.
7. **Accessible.**
   - Real DOM controls with visible focus.
   - `aria-label` on canvases.
   - Respect `prefers-reduced-motion`.
   - 0 axe violations in `tests/e2e/a11y.spec.ts`.
8. **Match the surrounding code.**
   - Strict TypeScript.
   - Use `h()` for DOM and `ui.*` for components.
   - Comments only for non-obvious invariants or gotchas, one line each.

## Commands

```bash
npm run dev          # http://localhost:5180
npm run typecheck
npm test             # Vitest + fast-check
npm run e2e          # Playwright + axe
npm run build
```

All four checks (`typecheck`, `test`, `e2e`, `build`) must pass before proposing a PR. Report honestly what you verified and what you could not.

## Git

- Branch off `dev` and open PRs into `dev`. `main` is production.
- Commits use Conventional Commits, with no AI attribution trailers.
- **Never push, open or merge a PR without the human contributor's explicit OK.**
