# 🤝 Cómo contribuir a Algo Quest

[![PRs welcome](https://img.shields.io/badge/PRs-bienvenidos-brightgreen)](#-checklist-del-pr)
[![AI agents ready](https://img.shields.io/badge/AI_agents-ready-8a2be2)](AGENTS.md)
[![Runtime dependencies: 0](https://img.shields.io/badge/runtime_deps-0-brightgreen)](package.json)
[![Good first issues](https://img.shields.io/github/issues/JoseMiguez98/algo-quest/good%20first%20issue?label=good%20first%20issues&color=7057ff)](https://github.com/JoseMiguez98/algo-quest/labels/good%20first%20issue)

> **English summary.** Algo Quest is a visualizer and playground for computer science algorithms, and **it is built to be extended with AI agents**.
>
> [`AGENTS.md`](AGENTS.md) and the shared skills in [`.claude/skills/`](.claude/skills/) give every contributor's agent the same workflow and quality bar.
>
> The ground rules:
> - Accuracy first: every algorithm core is property-tested against an independent reference.
> - Zero runtime dependencies.
> - No image or audio files: everything is drawn and synthesized in code.
> - Content ships in both Spanish and English.
>
> Branch off `dev`, open your PR into `dev`, and keep `npm run typecheck && npm test && npm run e2e && npm run build` green. Issues and PRs in English are welcome.

¡Gracias por sumarte! Podés aportar de muchas formas: un algoritmo nuevo, un theme, una traducción, un bug, una referencia mejor o una explicación más clara.

> [!TIP]
> ⭐ **Si todavía no lo hiciste, dejale una estrella al repo.** Ayuda a que más gente encuentre el proyecto, y más
> gente significa más algoritmos y más themes.
>
> ¿Buscás por dónde empezar? Mirá los issues con la etiqueta
> [`good first issue`](https://github.com/JoseMiguez98/algo-quest/labels/good%20first%20issue).

## 🤖 Contribuir con un AI agent

Este repo está pensado para que contribuyas **trabajando junto a un AI agent**. El objetivo es que todos sigamos los mismos pasos y la misma vara de calidad, sin importar quién escriba el código.

| Archivo | Qué le da al agente |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Las reglas del proyecto. Lo leen Claude Code (vía `CLAUDE.md`), Cursor, Codex, Copilot y otros |
| [`.claude/skills/add-algorithm`](.claude/skills/add-algorithm/SKILL.md) | El paso a paso para agregar un algoritmo o una categoría |
| [`.claude/skills/add-theme`](.claude/skills/add-theme/SKILL.md) | El paso a paso para crear un theme |
| [`.claude/skills/contribute`](.claude/skills/contribute/SKILL.md) | Ramas, commits, PRs, releases y hotfixes |

**Cómo trabajar:**

1. Con [Claude Code](https://claude.com/claude-code), las skills se activan solas. Pedí "agregá comb sort" o "haceme un theme de Game Boy" y el agente sigue el checklist completo.
2. Con otro agente, indicale que lea `AGENTS.md` y la skill que corresponda antes de empezar.
3. **Vos seguís siendo responsable del PR.**
   - Revisá lo que generó el agente.
   - Abrí el visualizer y miralo paso a paso.
   - Verificá las referencias.
   - El agente nunca debería hacer push ni abrir PRs sin tu OK.
4. Si el agente se trabó en algo que la skill no explicaba, **mejorar la skill en el mismo PR (o en otro) también es un aporte**. Las skills son documentación viva.

Sin agente también podés contribuir: las skills se leen como checklists comunes.

## 🧭 Antes de empezar

- Para cambios grandes (una categoría nueva, un theme, cambios de arquitectura), abrí primero un issue con la plantilla correspondiente. Así acordamos el enfoque antes de que inviertas tiempo.
- Para algo chico (un typo, un bug evidente), mandá el PR directamente.
- Al participar aceptás el [Código de Conducta](CODE_OF_CONDUCT.md).

## 🛠️ Preparar el entorno

Requiere Node 20 o superior.

```bash
git clone https://github.com/JoseMiguez98/algo-quest.git
cd algo-quest
git switch dev
npm install
npx playwright install chromium   # solo la primera vez, para los e2e
npm run dev                       # http://localhost:5180
```

| Comando | Qué hace |
|---|---|
| `npm test` | Tests de exactitud (Vitest + fast-check) |
| `npm run e2e` | End-to-end y accesibilidad (Playwright + axe) |
| `npm run typecheck` | TypeScript estricto |
| `npm run build` | Sitio estático en `dist/` |

## 🏗️ La arquitectura en una línea

**Los algoritmos solo emiten eventos semánticos** (`compare`, `swap`, `visit`, `relax`…) con un snapshot inmutable del estado. Nunca conocen colores, sonidos ni el DOM.

A partir de esos eventos:
- las escenas (`src/scenes/`) traducen el estado a primitivas;
- el theme (`src/themes/`) decide cómo se ve y cómo suena cada una.

El mapa completo de carpetas está en el [README](README.md).

## 🧱 Todo se hace con código

Algo Quest no tiene librerías en runtime ni archivos de assets. Los aportes tienen que respetar lo mismo:

- **Sin dependencias en runtime.** `package.json` no tiene `dependencies` y así se queda. Si una herramienta de desarrollo nueva hace falta, se discute antes en un issue.
- **Sin imágenes, audio ni fuentes de íconos.** Las alternativas son estas:

| En lugar de | Usá |
|---|---|
| PNG, JPG o GIF, sprites | Primitivas del renderer del theme (canvas), o SVG armado en código con `src/themes/pixel/svg.ts` |
| Íconos | `src/ui/icons.ts`: íconos 8×8 definidos pixel por pixel |
| MP3 o WAV | Cues del `SoundPack` sintetizados con Web Audio |
| Música grabada | Un `MusicTrack` procedural |

Las únicas excepciones son las tipografías de la interfaz desde Google Fonts (con licencia OFL) y el contador de GoatCounter en producción. Las capturas y GIFs de `docs/media/` sirven solo para documentar en el README y nunca se importan desde `src/`.

## 🎯 La vara de exactitud

Es un sitio para aprender, así que un algoritmo mal mostrado es peor que ninguno. Para que se acepte un algoritmo:

1. **Núcleo puro y grabado.** Un generador que solo toca los datos a través de `SortRecorder` o `GraphRecorder`, para que los contadores sean honestos.
2. **Tests contra una referencia independiente.**
   - Tests de propiedades con fast-check que comparan el resultado y los contadores contra una implementación de referencia escrita aparte.
   - Tests de los invariantes propios del algoritmo.
3. **Rasgos demostrados.**
   - Si dice "estable", hay un test de estabilidad.
   - Si dice "no estable", hay un caso concreto que lo muestra.
   - Si dice "óptimo", sus costos coinciden con la referencia.
4. **Una fila en [`docs/fidelity.md`](docs/fidelity.md)** con la variante implementada, la referencia y los invariantes testeados.

Nunca se debilita un test para que pase: se corrige el algoritmo.

## ➕ Agregar un algoritmo

Seguí el checklist de [`.claude/skills/add-algorithm/SKILL.md`](.claude/skills/add-algorithm/SKILL.md). Resumen:

1. Creá `src/algorithms/<categoría>/<id>/` con estos archivos:
   - `algorithm.ts` (pseudocódigo + `run`);
   - `algorithm.test.ts`;
   - `content.es.ts` y `content.en.ts`;
   - `index.ts` (`defineAlgorithm`).
2. Agregá una línea en `src/algorithms/registry.ts` y una fila en `docs/fidelity.md`.
3. El menú, la URL, los controles, el playground, el comparador y los e2e lo toman solos.

Si usás [Claude Code](https://claude.com/claude-code), pedile "agregá el algoritmo X": la skill `add-algorithm` lo guía paso a paso. Si no lo usás, el mismo archivo sirve como checklist.

Para una **categoría nueva** (árboles, strings, geometría…), abrí primero un issue: la skill lista todo lo que hay que tocar.

## 🎨 Agregar un theme

Seguí [`.claude/skills/add-theme/SKILL.md`](.claude/skills/add-theme/SKILL.md). Un theme implementa `Theme` (`src/themes/contract.ts`) y tiene cuatro partes:

1. **Tokens:** todos los `RequiredColor` y un color por estado visual.
2. **CSS:** el skin de todos los componentes.
3. **Renderer:** `PixelRenderer` con un estilo propio, o uno nuevo.
4. **Sound pack:** todos los cues, sintetizados con Web Audio y sin archivos de audio.

Tiene que pasar la auditoría de accesibilidad (`tests/e2e/a11y.spec.ts`) sin violaciones, incluido el contraste AA.

## 🌎 Contenido y traducciones

- Todo texto visible existe en **español y en inglés**.
  - La UI está en `src/i18n/`.
  - Los algoritmos, en `content.es.ts` y `content.en.ts`.
  - `src/algorithms/content.test.ts` falla si falta una clave.
- El español usa voseo rioplatense ("elegí", "levantá") con tildes correctas.
- Cada algoritmo cita **2–3 referencias que abriste y verificaste**: Wikipedia, CLRS o Sedgewick, cp-algorithms, VisuAlgo. No se inventan URLs.
- Las narraciones explican el *por qué* de cada paso, no solo el *qué*: "7 > 3 → se intercambian".

## 🌿 Ramas, commits y PRs

El detalle está en [`.claude/skills/contribute/SKILL.md`](.claude/skills/contribute/SKILL.md).

**Ramas y entornos:**

| Rama | Entorno |
|---|---|
| `dev` | Integración y preview en https://josemiguez98.github.io/algo-quest/dev/ |
| `main` | Producción en https://josemiguez98.github.io/algo-quest/ |

**Tu rama:**
- Sale de `dev` con un prefijo: `algo/<id>`, `theme/<id>`, `feat/…`, `fix/…`, `docs/…` o `chore/…`.
- El PR va hacia `dev`.

**Commits:**
- Usan [Conventional Commits](https://www.conventionalcommits.org/) con un asunto corto, por ejemplo `feat(algo): add comb sort`.
- Van sin trailers de atribución a herramientas de IA.

**Merge:** hacen falta el CI en verde y la **aprobación del maintainer (@JoseMiguez98)**, que es obligatoria en `dev` y en `main`. Si subís cambios nuevos al PR, hay que volver a aprobarlo. Después el PR se mergea con squash, y el maintainer promueve `dev` a `main`.

### ✅ Checklist del PR

- [ ] `npm run typecheck && npm test && npm run e2e && npm run build` pasan.
- [ ] Sin dependencias en runtime nuevas y sin archivos de imagen o audio.
- [ ] Si trabajaste con un agente: revisaste el resultado a mano y la skill quedó al día si hizo falta.
- [ ] Si es un algoritmo: tests contra una referencia independiente, fila en `docs/fidelity.md`, contenido ES/EN y referencias verificadas.
- [ ] Si es un theme: todos los `RequiredColor`, la CSS cubre todas las clases y la auditoría a11y pasa.
- [ ] Captura o GIF si cambia algo visual.
- [ ] Probado a mano en escritorio y mobile (~390 px).

## ✍️ Estilo de código

- **TypeScript estricto** (`noUncheckedIndexedAccess`) y sin `any` salvo que esté justificado.
- **Nombres claros antes que comentarios.** Comentá solo lo que alguien entendería mal sin el comentario (un invariante, un workaround), en una línea.
- **Imitá el código de al lado:** mismo idioma, mismos helpers (`h()` para DOM, `ui.*` para componentes) y cero dependencias nuevas sin discutirlo antes.
- **Accesibilidad:** todo control es un elemento DOM real con foco visible, las animaciones respetan `prefers-reduced-motion` y el canvas tiene `aria-label`.

## 📄 Licencia

Al contribuir aceptás que tu aporte se publique bajo la [licencia MIT](LICENSE) del proyecto.
