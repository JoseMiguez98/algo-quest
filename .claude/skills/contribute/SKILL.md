---
name: contribute
description: Algo Quest git workflow — branch naming, commits, PR checklist, the dev/main environments, releases and hotfixes. Use whenever creating a branch, committing, opening a PR, releasing dev to main or fixing production.
allowed-tools: Read, Bash(git status*), Bash(git diff*), Bash(git log*), Bash(git branch*), Bash(git switch*), Bash(git checkout*), Bash(git add*), Bash(git commit*), Bash(git fetch*), Bash(git rebase*), Bash(npm test*), Bash(npm run *), Bash(gh pr view*), Bash(gh pr checks*), Bash(gh run *)
---

# Contribution workflow

Algo Quest is built to be extended with AI agents. The project rules live in `AGENTS.md`, and the task workflows are the skills in `.claude/skills/`. Follow them so every contribution meets the same bar.

## Environments

| Branch | Environment | URL |
|---|---|---|
| `dev` | Integration and preview (DEV badge, no analytics) | https://josemiguez98.github.io/algo-quest/dev/ |
| `main` | Production | https://josemiguez98.github.io/algo-quest/ |

Both branches are protected: changes land only through PRs with a green CI. `dev` is the default branch.

## Branches

Create the branch from an up-to-date `dev`:

```bash
git fetch origin && git switch -c <type>/<slug> origin/dev
```

| Prefix | For |
|---|---|
| `algo/<id>` | a new algorithm (follow the `add-algorithm` skill) |
| `theme/<id>` | a new theme (follow the `add-theme` skill) |
| `feat/<slug>` | a feature |
| `fix/<slug>` | a bug fix |
| `docs/<slug>` | docs only |
| `chore/<slug>` | tooling, deps, CI |

Keep one topic per branch and keep it short-lived.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), with a short imperative subject and a body only when the *why* is not obvious:

```
feat(algo): add comb sort
fix(graph): skip finalized nodes in dijkstra
feat(theme): add game boy theme
docs: explain the fidelity bar
```

Scopes: `algo`, `graph`, `sorting`, `theme`, `ui`, `playground`, `compare`, `i18n`, `build`, `ci`.

Never add AI attribution: no `Co-Authored-By` AI trailers, session links or "Generated with" footers.

## Before opening a PR

All of these must pass locally:

```bash
npm run typecheck && npm test && npm run e2e && npm run build
```

Then rebase on the latest `dev`: `git fetch origin && git rebase origin/dev`.

Also check the diff:
- `package.json` gained no `dependencies`.
- No image, audio or font files were added under `src/` (`git diff --stat origin/dev`). README screenshots go in `docs/media/` only.
- If a skill was missing a step you needed, the skill is updated in this PR.

Before asking the contributor to open the PR, summarize what you verified by hand: which pages you opened, and which languages and themes you checked. The contributor reviews and owns the PR.

## Pull requests

- Target **`dev`**, except hotfixes.
- Fill in `.github/pull_request_template.md`. For an algorithm, include the fidelity row and the references you checked.
- Attach a screenshot or GIF for visual changes.
- CI (`.github/workflows/ci.yml`) must be green. Feature PRs are **squash-merged**, and the branch is deleted on merge.

## Release: `dev` → `main` (maintainers)

1. Check that `https://josemiguez98.github.io/algo-quest/dev/` looks right.
2. Open a PR from `dev` into `main` titled `release: <yyyy-mm-dd>`, listing the merged PRs.
3. Merge with a **merge commit** (not squash), so `dev` and `main` share history.
4. The deploy workflow publishes both environments.

## Hotfix (maintainers)

1. `git switch -c fix/<slug> origin/main`, fix it and open the PR into `main`.
2. After merging, bring `main` back into `dev` with a PR from `main` into `dev` (merge commit).

## Safety

- **Never push, open, update or merge a PR without the contributor's explicit OK in the current conversation.** Pushing and opening PRs are publishing actions.
- Never force-push `dev` or `main`. On your own branch, use `--force-with-lease` only after rebasing.
- Don't commit `dist/`, `test-results/`, `playwright-report/` or `.shot*.mjs`; they are already gitignored.
