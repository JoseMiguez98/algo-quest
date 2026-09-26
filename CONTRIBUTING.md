# Cómo contribuir a Algo Quest

> **English summary.** Algo Quest is an educational site, so accuracy comes first. Every algorithm core is property-tested against an independent reference, and every piece of content cites sources that were actually checked.
>
> Branch off `dev`, open your PR into `dev`, and keep `npm run typecheck && npm test && npm run e2e && npm run build` green. Content ships in both Spanish and English.
>
> Checklists: [adding an algorithm](.claude/skills/add-algorithm/SKILL.md), [adding a theme](.claude/skills/add-theme/SKILL.md) and [git workflow](.claude/skills/contribute/SKILL.md). Issues and PRs in English are welcome.

¡Gracias por sumarte! Podés aportar de muchas formas: un algoritmo nuevo, un theme, una traducción, un bug, una referencia mejor o una explicación más clara.

## Antes de empezar

- Para cambios grandes (una categoría nueva, un theme, cambios de arquitectura), abrí primero un issue con la plantilla correspondiente. Así acordamos el enfoque antes de que inviertas tiempo.
- Para algo chico (un typo, un bug evidente), mandá el PR directamente.
- Al participar aceptás el [Código de Conducta](CODE_OF_CONDUCT.md).

## Preparar el entorno

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

## La arquitectura en una línea

**Los algoritmos solo emiten eventos semánticos** (`compare`, `swap`, `visit`, `relax`…) con un snapshot inmutable del estado. Nunca conocen colores, sonidos ni el DOM.

A partir de esos eventos:
- las escenas (`src/scenes/`) traducen el estado a primitivas;
- el theme (`src/themes/`) decide cómo se ve y cómo suena cada una.

El mapa completo de carpetas está en el [README](README.md#cómo-está-organizado).

## La vara de exactitud

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

## Agregar un algoritmo

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

## Agregar un theme

Seguí [`.claude/skills/add-theme/SKILL.md`](.claude/skills/add-theme/SKILL.md). Un theme implementa `Theme` (`src/themes/contract.ts`) y tiene cuatro partes:

1. **Tokens:** todos los `RequiredColor` y un color por estado visual.
2. **CSS:** el skin de todos los componentes.
3. **Renderer:** `PixelRenderer` con un estilo propio, o uno nuevo.
4. **Sound pack:** todos los cues, sintetizados con Web Audio y sin archivos de audio.

Tiene que pasar la auditoría de accesibilidad (`tests/e2e/a11y.spec.ts`) sin violaciones, incluido el contraste AA.

## Contenido y traducciones

- Todo texto visible existe en **español y en inglés**.
  - La UI está en `src/i18n/`.
  - Los algoritmos, en `content.es.ts` y `content.en.ts`.
  - `src/algorithms/content.test.ts` falla si falta una clave.
- El español usa voseo rioplatense ("elegí", "levantá") con tildes correctas.
- Cada algoritmo cita **2–3 referencias que abriste y verificaste**: Wikipedia, CLRS o Sedgewick, cp-algorithms, VisuAlgo. No se inventan URLs.
- Las narraciones explican el *por qué* de cada paso, no solo el *qué*: "7 > 3 → se intercambian".

## Ramas, commits y PRs

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

**Merge:** con el CI en verde, el PR se mergea con squash. Un maintainer después promueve `dev` a `main`.

### Checklist del PR

- [ ] `npm run typecheck && npm test && npm run e2e && npm run build` pasan.
- [ ] Si es un algoritmo: tests contra una referencia independiente, fila en `docs/fidelity.md`, contenido ES/EN y referencias verificadas.
- [ ] Si es un theme: todos los `RequiredColor`, la CSS cubre todas las clases y la auditoría a11y pasa.
- [ ] Captura o GIF si cambia algo visual.
- [ ] Probado a mano en escritorio y mobile (~390 px).

## Estilo de código

- **TypeScript estricto** (`noUncheckedIndexedAccess`) y sin `any` salvo que esté justificado.
- **Nombres claros antes que comentarios.** Comentá solo lo que alguien entendería mal sin el comentario (un invariante, un workaround), en una línea.
- **Imitá el código de al lado:** mismo idioma, mismos helpers (`h()` para DOM, `ui.*` para componentes) y cero dependencias nuevas sin discutirlo antes.
- **Accesibilidad:** todo control es un elemento DOM real con foco visible, las animaciones respetan `prefers-reduced-motion` y el canvas tiene `aria-label`.

## Licencia

Al contribuir aceptás que tu aporte se publique bajo la [licencia MIT](LICENSE) del proyecto.
