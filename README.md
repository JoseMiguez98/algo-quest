<div align="center">

# 🎮 Algo Quest

**A visualizer and playground for computer science algorithms, with the soul of a 16-bit console.**

[![Play now](https://img.shields.io/badge/▶_play_now-josemiguez98.github.io-ffd800?style=for-the-badge&labelColor=000024)](https://josemiguez98.github.io/algo-quest/)

[![GitHub stars](https://img.shields.io/github/stars/JoseMiguez98/algo-quest?style=flat&logo=github&label=stars)](https://github.com/JoseMiguez98/algo-quest/stargazers)
[![CI](https://github.com/JoseMiguez98/algo-quest/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/JoseMiguez98/algo-quest/actions/workflows/ci.yml)
[![Deploy](https://github.com/JoseMiguez98/algo-quest/actions/workflows/deploy.yml/badge.svg)](https://github.com/JoseMiguez98/algo-quest/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
<br>
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)
[![Runtime dependencies: 0](https://img.shields.io/badge/runtime_deps-0-brightgreen)](package.json)
[![Assets: 100% code](https://img.shields.io/badge/assets-100%25_code-ff5ed1)](#-made-100--with-code)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![AI agents ready](https://img.shields.io/badge/AI_agents-ready-8a2be2)](AGENTS.md)

<img src="docs/media/demo.gif" alt="Heap Sort animating step by step in the Mega Drive theme, with the pseudocode highlighted alongside" width="800">

**[Play](https://josemiguez98.github.io/algo-quest/)** · **[Contribute](CONTRIBUTING.md)** · **[Report a bug](https://github.com/JoseMiguez98/algo-quest/issues/new?template=bug.yml)** · **[Request an algorithm](https://github.com/JoseMiguez98/algo-quest/issues/new?template=new-algorithm.yml)**

</div>

> [!TIP]
> ⭐ **Like Algo Quest? Give the repo a star.** It's free, it helps more people find it, and it motivates us to
> add new algorithms.

## ✨ What you can do

Watch, step by step, how sorts put things in order and how graph algorithms explore. Then get your hands dirty.

- 🔍 **Step by step, forward and backward.** Every comparison is shown, heard and explained in a narration.
- 📜 **Live pseudocode.** The line being executed is highlighted, next to the current variables.
- 🧪 **Playground.** Edit the data, drag bars, build your own graphs and mazes, and share them by URL.
- ⚔️ **Versus mode.** Two algorithms on the same input, head to head, with a live scoreboard.
- 🕹️ **Three styles.** Mega Drive, 8-bit RPG and Modern, each with its own synthesized sound.
- 🌎 **Spanish and English**, keyboard navigable and audited with axe (WCAG AA).

**19 algorithms** across two worlds:

| World | Algorithms |
|---|---|
| 1 · Sorting | Bubble · Selection · Insertion · Shell · Merge · Quick · Heap · Counting · Radix · Bucket |
| 2 · Graphs and traversals | BFS · DFS · Bidirectional BFS · Dijkstra · A* · Greedy best-first · Bellman-Ford · Floyd-Warshall · Backtracking (maze) |

## 📸 Screenshots

| Home | Quick Sort |
|---|---|
| <img src="docs/media/home.png" alt="Home page with the Algo Quest logo and a Floyd-Warshall demo" width="420"> | <img src="docs/media/sorting.png" alt="Quick Sort mid-partition, with the pseudocode highlighted" width="420"> |
| **A\*** | **Versus mode** |
| <img src="docs/media/graph.png" alt="A* exploring a graph with the g+h values over each node" width="420"> | <img src="docs/media/compare.png" alt="Bubble Sort versus Quick Sort on the same data" width="420"> |
| **Playground** | **Mobile** |
| <img src="docs/media/playground.png" alt="Dijkstra graph editor with tools to move nodes and edges" width="420"> | <img src="docs/media/mobile.png" alt="Merge Sort on a phone, with gamepad-style controls" width="200"> |

## 🚀 Run it locally

```bash
npm install
npm run dev        # http://localhost:5180
npm test           # accuracy tests (Vitest + fast-check)
npm run e2e        # end-to-end and accessibility tests (Playwright + axe)
npm run build      # static site in dist/
```

To publish under a subfolder (for example GitHub Pages at `/algo-quest/`): `BASE_PATH=/algo-quest/ npm run build`.
Deployment is handled by `.github/workflows/deploy.yml` on every push to `main` or `dev`.
The output in `dist/` is 100 % static: one page per algorithm (`/sorting/quick-sort/`), the home page and `/compare/`.

## 🧱 Made 100 % with code

**No runtime libraries.** `package.json` has no `dependencies`: the site is vanilla TypeScript. Vite, Vitest,
Playwright and friends are build and test tools, and never reach the browser.

**The site ships not a single image or audio file.** Everything you see and hear is generated on the fly. The screenshots in `docs/media/` exist only for this README and are not published with the site.

| What | How it's made |
|---|---|
| Bars, nodes, grids and animations | Canvas drawn by each theme's renderer |
| Window frames, buttons and icons | SVG built in code, pixel by pixel |
| Backgrounds, stars and mountains | Seeded pixel-art SVG (`src/themes/megadrive/decor.ts`) and CSS |
| Text inside the canvas | A 5×7 bitmap font defined in `src/themes/pixel/bitmap-font.ts` |
| Sound effects and music | Web Audio: pulse and triangle waves, LFSR noise and 2-operator FM synthesis, with procedural music |

**External resources**, in plain sight:
- The UI typefaces (Press Start 2P, Pixelify Sans and Inter, all OFL-licensed) are loaded from Google Fonts.
- In production, the [GoatCounter](#-metrics) counter is loaded.

The same rule applies to contributions: no runtime dependencies and no asset files.

## 🗂️ How it's organized

| Folder | What's inside |
|---|---|
| `src/algorithms/<category>/<id>/` | One algorithm: pure core, tests, definition and ES/EN texts |
| `src/core/` | Player (step forward/back), traces, hotkeys, settings, sound, session, routes |
| `src/scenes/` | Scenes that draw states (`bars`, `graph`) and reusable layers (`layers/`) |
| `src/themes/` | Theme contract and the themes (`megadrive`, `rpg`, `modern`) |
| `src/ui/` | Theme-independent components and panels |
| `src/playground/` | Data, graph and grid editors; URL-shareable state |
| `src/pages/` | Home, visualizer and comparator |
| `docs/fidelity.md` | Which variant each algorithm implements and which invariants are tested |

The core rule: **algorithms only emit semantic events** (`compare`, `swap`, `visit`, `relax`…) with an immutable
snapshot of the state. They never know about colors, sounds or the DOM. Scenes translate the state into primitives
(`bar`, `node`, `edge`…), and the theme decides how each one looks and sounds.

## 🤖 Contributing with AI agents

Algo Quest is designed for contributing **side by side with an AI agent**. The repo ships the instructions the
agent needs, so every contributor follows the same steps, the same rules and the same quality bar:

| File | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Project rules for any agent (Claude Code, Cursor, Codex, Copilot…) |
| [`.claude/skills/add-algorithm`](.claude/skills/add-algorithm/SKILL.md) | Add an algorithm or a category: core, tests against a reference, ES/EN content and registration |
| [`.claude/skills/add-theme`](.claude/skills/add-theme/SKILL.md) | Create a theme: tokens, CSS, renderer, sounds and accessibility audit |
| [`.claude/skills/contribute`](.claude/skills/contribute/SKILL.md) | Branches, commits, PRs, releases and hotfixes |

With [Claude Code](https://claude.com/claude-code) the skills kick in on their own: ask it to "add comb sort" or
"make me a Game Boy theme" and it follows the full checklist. With another agent, point it to `AGENTS.md`. If you'd
rather work without an agent, the skills read as plain checklists.

Getting started:
1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Create your branch from `dev`.
3. Open the PR into `dev`. `main` is production.

If you hit a step the agent couldn't figure out, **improving the skill is a contribution too**: that way the next
contributor won't run into the same wall.

## 📊 Metrics

The published site counts visits and usage events (play, step back, edit, comparisons) with
[GoatCounter](https://www.goatcounter.com/). GoatCounter uses no cookies or personal data, and respects *Do Not Track*.
It only turns on in production when the `VITE_GOATCOUNTER` variable is set; nothing is sent locally or from `/dev/`.
The code lives in `src/core/analytics.ts`.

## ⌨️ Keyboard shortcuts

`Space` play/pause · `→`/`←` step · `Home`/`End` start/end · `R` restart · `N` new data · `+`/`−` speed ·
`M` sound · `E` edit mode · `C` code · `I` info · `?` help · `Esc` close.

## 💜 Contributors

Thanks to everyone who adds algorithms, themes, translations and fixes.

<a href="https://github.com/JoseMiguez98/algo-quest/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=JoseMiguez98/algo-quest" alt="Algo Quest contributors">
</a>

## ⭐ Star history

<a href="https://star-history.com/#JoseMiguez98/algo-quest&Date">
  <img src="https://api.star-history.com/svg?repos=JoseMiguez98/algo-quest&type=Date" alt="Star history chart" width="600">
</a>

## 📄 License

[MIT](LICENSE) © 2026 JoseMiguez98

<div align="center">

**If Algo Quest helped you or made you smile, ⭐ give it a star: it's the best way to support the project.**

</div>
