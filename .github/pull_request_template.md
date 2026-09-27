## What changes

<!-- One or two sentences: what and why. Link the issue if there is one (Closes #123). Spanish is fine too. -->

## Type

- [ ] New algorithm
- [ ] New theme
- [ ] Feature
- [ ] Fix
- [ ] Docs / content
- [ ] Chore / CI

## Checklist

- [ ] The PR targets `dev`
- [ ] `npm run typecheck && npm test && npm run e2e && npm run build` pass
- [ ] Tested by hand on desktop and mobile (~390 px)
- [ ] Screenshot or GIF if something visual changes
- [ ] No new runtime dependencies and no image or audio files: everything is generated in code
- [ ] If I worked with an AI agent: I reviewed the result by hand and updated the skill if it was missing something

### For an algorithm

- [ ] Property tests against an independent reference
- [ ] Proven traits (stable / not stable / optimal)
- [ ] A row in `docs/fidelity.md`
- [ ] ES + EN content with 2–3 verified references

**Implemented variant and references:**

### For a theme

- [ ] Defines every `RequiredColor` and the visual states
- [ ] The CSS covers every class (see the `add-theme` skill)
- [ ] Sound pack with every cue
- [ ] Added to `tests/e2e/a11y.spec.ts` with 0 violations
