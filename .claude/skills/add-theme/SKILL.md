---
name: add-theme
description: Create a new visual/sound theme for Algo Quest (e.g. SNES, Game Boy, CRT terminal, high contrast). Use when someone asks for a new look, skin, palette or sound pack for the site.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm test*), Bash(npm run *), Bash(npx playwright test*)
---

# Add a theme

A theme swaps **how everything looks and sounds** without touching algorithms, scenes or UI logic. It is one folder in `src/themes/<id>/` implementing `Theme` from `src/themes/contract.ts`.

Pick the closest existing theme as a template and read all of its files first:

| Template | When |
|---|---|
| `megadrive/` | Pixel art: `PixelRenderer` + a custom `PixelStyle`, FM sound, procedural music, decorations |
| `rpg/` | Pixel art with a simpler NES APU sound pack |
| `modern/` | Vector: its own `VectorRenderer` with antialiasing and soft sounds |

## 1. `tokens.ts`: `ThemeTokens`

- `color`: every `RequiredColor` key is mandatory, and the compiler errors if one is missing. Extra keys become `--color-<key>` too.
- `state`: a color for every `VisualState` (compare, swap, sorted, frontier, visited, path…). States must stay distinguishable from each other **and** from `stage`.
- `font.display` / `font.body` plus `fontUrls` (Google Fonts only).
- If the theme emulates hardware with a fixed palette, validate it in a test, as `megadrive/palette.test.ts` does.

## 2. `style.css`: component skin

The layout lives in `src/ui/layout.css`; don't touch it. Your CSS only skins these classes, and it must cover all of them:

- **Chrome:** `.ui-button` (`--primary`, `--ghost`, `--icon`, `[aria-pressed]`, `:focus-visible`, `:disabled`), `.ui-window`, `.ui-window__title`, `.ui-chip` (`--good`, `--info`, `--warn`), `.theme-select`, `.search`, `.tabs`, `.tab`, `.tab-panel`, `.env-badge`.
- **Home:** `.logo`, `.logo__word`, `.hero__*`, `.press-start`, `.demo*`, `.filters`, `.world__title`, `.world__num`, `.cart*`, `.empty`, `.home-footer`, `.select-window`.
- **Visualizer:** `.app-bar__name`, `.app-bar__tagline`, `.stage`, `.narration*`, `.legend*`, `.live-counters`, `.code*`, `.vars`, `.info*`, `.refs`, `.complexity`, `.stats`, `.structure*`, `.edit-*`, `.picker*`, `.overlay`, `.keys`.
- **Transport:** `.transport*`, `.timeline*`, `.pad--dpad`, `.pad--face`.
- **Compare:** `.fighter*`, `.versus__vs`, `.results`.
- **Not found:** `.not-found`.

Use `grep -o "^\.[a-z][a-z0-9_-]*" src/themes/megadrive/style.css | sort -u` to diff your coverage against the reference theme. Use only the theme's `--color-*` / `--state-*` variables, never hard-coded colors from another theme. Respect `prefers-reduced-motion`.

## 3. `createRenderer()`: `StageRenderer`

- **Pixel look:** `new PixelRenderer(style)` from `src/themes/pixel/renderer.ts` with your own `PixelStyle` (see `megadrive/stage-style.ts`). It draws a low-res buffer with integer scaling and the 5×7 bitmap font.
- **Anything else:** implement every `StageRenderer` method (`bar`, `node`, `edge`, `cell`, `pointer`, `panel`, `tag`, `ground`, `text`, `measure`…). `transform` must be correct, because hit-testing in edit mode depends on it.

## 4. `sounds`: `SoundPack`

- `play(ctx, out, cue, tone, at)` must handle **every `Cue`** in `src/core/sound.ts`: algorithm cues plus `ui-move`, `ui-select`, `ui-back`, `ui-toggle`. `tone` (0..1) maps to pitch where it applies.
- Synthesize everything with Web Audio. No audio files.
- Keep cues short (< 150 ms for step cues) and don't clip. The master gain is shared.
- `music` is optional: a `MusicTrack` with a lookahead scheduler (see `megadrive/music.ts`).

## 5. Register and test

1. Write `index.ts` exporting the `Theme` (`id`, `name`, `tokens`, `css` via `?inline`, `createRenderer`, `sounds`).
2. Add it to the `themes` record in `src/themes/index.ts`. It then shows up in the style selector.
3. Add its id to the theme list in `tests/e2e/a11y.spec.ts`. **It must pass with 0 axe violations (WCAG A/AA contrast included)** on home, both visualizer scenes and compare.

```bash
npm run typecheck
npm test
npm run e2e
npm run build
```

Finally, review it by eye with `npm run dev`:
- Pick the theme in the selector.
- Check the home, a sorting and a graph visualizer (including edit mode), compare and `/404.html`.
- Check desktop and ~390 px mobile width.
- Check keyboard focus rings.
- Check sound on and off.
