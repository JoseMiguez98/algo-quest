---
name: gitflow
description: Algo Quest Gitflow — feature branches off dev, the dev/main environments, commits, PR checklist, releases and hotfixes. Use whenever creating a branch, committing, opening a PR, releasing dev to main or fixing production.
allowed-tools: Read, Bash(git status*), Bash(git diff*), Bash(git log*), Bash(git branch*), Bash(git switch*), Bash(git checkout*), Bash(git add*), Bash(git commit*), Bash(git fetch*), Bash(git rebase*), Bash(npm test*), Bash(npm run *), Bash(gh pr view*), Bash(gh pr checks*), Bash(gh run *)
---

# Gitflow

Algo Quest is built to be extended with AI agents. The project rules live in `AGENTS.md`, and the task workflows are the skills in `.claude/skills/`. Follow them so every contribution meets the same bar.

The repo follows a lightweight Gitflow:

| Gitflow role | Here |
|---|---|
| Develop | `dev`, the default branch |
| Production | `main` |
| Feature branches | `algo/…`, `theme/…`, `feat/…`, `fix/…`, `docs/…`, `chore/…` off `dev`, squash-merged back into `dev` |
| Release | `release/<yyyy-mm-dd>` off `dev`, merged into `main` with a merge commit, then `main` synced back into `dev` |
| Hotfix | `hotfix/<slug>` off `main`, merged into `main` with a merge commit, then `main` synced back into `dev` |

Resulting history: `dev` has one squashed commit per PR, `main` has one merge commit per release or hotfix, and `dev` always contains `main`.

## Environments

| Branch | Environment | URL |
|---|---|---|
| `dev` | Integration and preview (DEV badge, no analytics) | https://josemiguez98.github.io/algo-quest/dev/ |
| `main` | Production | https://josemiguez98.github.io/algo-quest/ |

Both branches are protected. Changes land only through PRs that have a green CI (`test` job), are up to date with their base **and have an approval from the maintainer, @JoseMiguez98**, who is the code owner of the whole repo (`.github/CODEOWNERS`). A new push to the PR requires a new approval. `dev` is the default branch.

**`main` belongs to the maintainer.** Only @JoseMiguez98 creates `release/*` and `hotfix/*` branches and opens or merges PRs into `main`. Contributors and agents always target `dev`. Found a production bug? Open an issue or a `fix/…` PR into `dev`, and the maintainer decides whether it ships as a hotfix.

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

- Target **`dev`**. Never `main`.
- Fill in `.github/pull_request_template.md`. For an algorithm, include the fidelity row and the references you checked.
- Attach a screenshot or GIF for visual changes.
- CI (`.github/workflows/ci.yml`) must be green and @JoseMiguez98 must approve. Feature PRs are **squash-merged**, and the branch is deleted on merge.

## Out of date or in conflict

Other PRs land in `dev` while yours is open. PRs must be up to date with `dev` before they merge, so sooner or later GitHub will say **"out of date"** or **"This branch has conflicts"**. Resolving it is the author's job, and an agent handles it well. Just ask: *"rebase my branch on `origin/dev` and resolve the conflicts following the gitflow skill"*.

1. Rebase, don't merge. Never merge `dev` into your branch or use GitHub's web conflict editor: both add merge commits to your branch.
   ```bash
   git fetch origin && git rebase origin/dev
   ```
2. For each conflicted file (`git diff --name-only --diff-filter=U`), understand **both** intents before editing:
   - your side: what your PR needs from that code;
   - the `dev` side: what changed and why. Read the PR that landed: `git log --oneline origin/dev -- <file>`, then `gh pr view <number>`.
3. Resolve so both intents survive. What `dev` removed or changed on purpose stays that way, and your change is re-applied on top of it. Never take "ours" or "theirs" wholesale without reading.
4. If the intents contradict (for example, `dev` deleted what your PR extends), stop and ask the contributor or comment on the PR. Don't guess.
5. `git add <file>` and `git rebase --continue`, then run the four checks (`typecheck`, `test`, `e2e`, `build`). A clean rebase can still break the build.
6. With the contributor's OK, `git push --force-with-lease`. Only ever on your own branch.
7. Leave a short PR comment saying what conflicted and how you resolved it. The new push asks for a new approval, so this helps the reviewer.

## Release (maintainer only)

1. Check that `https://josemiguez98.github.io/algo-quest/dev/` looks right.
2. Cut the release from the latest `dev`:
   ```bash
   git fetch origin && git switch -c release/<yyyy-mm-dd> origin/dev && git push -u origin HEAD
   ```
3. Open a PR from `release/<yyyy-mm-dd>` into `main` titled `release: <yyyy-mm-dd>`. List what ships, one squashed PR per line:
   ```bash
   git log --first-parent --no-merges --format='- %s' origin/main..HEAD
   ```
   No commits go straight onto the release branch. If it needs a fix, merge the fix into `dev`, delete the branch and cut it again.
4. With CI green, merge with a **merge commit**. The release branch is deleted on merge, and the deploy workflow publishes both environments.
5. Sync `main` back into `dev` (see below).

## Hotfix (maintainer only)

1. `git fetch origin && git switch -c hotfix/<slug> origin/main`, fix it and open the PR into `main` titled `fix: …`.
2. Verify the fix by hand or with a throwaway test (see `write-tests`), and merge with a **merge commit** once CI is green.
3. Sync `main` back into `dev`.

## Sync `main` back into `dev` (maintainer only)

After every release or hotfix, so `dev` always contains `main` and the next release PR is up to date:

```bash
git fetch origin && git switch dev && git merge --ff-only origin/dev
git merge --ff-only origin/main || git merge --no-edit origin/main
git push origin dev
```

- If nothing landed in `dev` since the release branch was cut, this is a fast-forward and adds no commit.
- Otherwise it adds one `Merge remote-tracking branch 'origin/main' into dev` commit. For a release, that merge brings no code changes, because the release came from `dev`.
- After a hotfix the merge does bring code. Resolve any conflict locally and run the four checks before pushing. CI also runs on the push to `dev`.
- This is the only direct push to a protected branch, and only the maintainer can make it. It never needs `--force`.

## Safety

- **Never push, open, update or merge a PR without the contributor's explicit OK in the current conversation.** Pushing and opening PRs are publishing actions.
- Never force-push `dev` or `main`. On your own branch, use `--force-with-lease` only after rebasing.
- Don't commit `dist/`, `test-results/`, `playwright-report/` or `.shot*.mjs`; they are already gitignored.
