# Algo Quest

Visualizaciones educativas de algoritmos de ordenamiento y de grafos, con estética de consola de 16 bits,
sonido sintetizado por código, pseudocódigo en vivo, modo playground y comparador.

```bash
npm install
npm run dev        # http://localhost:5180
npm test           # tests de exactitud (Vitest + fast-check)
npm run e2e        # tests end-to-end y de accesibilidad (Playwright + axe)
npm run build      # sitio estático en dist/
```

Para publicar en una subcarpeta (por ejemplo GitHub Pages en `/algo-quest/`): `BASE_PATH=/algo-quest/ npm run build`.
El resultado en `dist/` es 100 % estático: una página por algoritmo (`/sorting/quick-sort/`), la portada y `/compare/`.

## Cómo está organizado

| Carpeta | Qué hay |
|---|---|
| `src/algorithms/<categoría>/<id>/` | Un algoritmo: núcleo puro, tests, definición y textos ES/EN |
| `src/core/` | Player (paso adelante/atrás), trazas, hotkeys, settings, sonido, sesión, rutas |
| `src/scenes/` | Escenas que dibujan estados (`bars`, `graph`) y capas reutilizables (`layers/`) |
| `src/themes/` | Contrato de theme y los themes (`megadrive`, `rpg`, `modern`) |
| `src/ui/` | Componentes y paneles independientes del theme |
| `src/playground/` | Editores de datos, grafos y grillas; estado compartible por URL |
| `src/pages/` | Portada, visualizer y comparador |
| `docs/fidelity.md` | Qué variante implementa cada algoritmo y qué invariantes se testean |

La regla central: **los algoritmos solo emiten eventos semánticos** (`compare`, `swap`, `visit`, `relax`…) con un
snapshot inmutable del estado. Nunca conocen colores, sonidos ni el DOM. Las escenas traducen el estado a primitivas
(`bar`, `node`, `edge`…), y el theme decide cómo se ve y suena cada una.

## Cómo agregar un algoritmo

1. Creá `src/algorithms/<sorting|graph>/<id>/algorithm.ts`:
   - Exportá `pseudocode` (líneas con `id`, `indent` y `text`).
   - Exportá `run(input, options)` como generador. Usá `SortRecorder` o `GraphRecorder`: son los únicos que tocan los datos y los contadores.
   - Cada `yield r.step(evento, idDeLínea, claveDeNarración, { params, vars, marks… })` es un paso de la animación.
2. Escribí `algorithm.test.ts`. Usá `checkContract` del `testing.ts` de la categoría (valida el resultado, que el snapshot sea inmutable, las líneas de pseudocódigo y los contadores) y agregá invariantes propios contra una implementación de referencia independiente.
3. Creá `content.es.ts` y `content.en.ts` (tipo `AlgorithmContent`). Deben incluir:
   - Una plantilla de narración por cada clave que emita el algoritmo.
   - Un resumen, los pasos y "cuándo usarlo".
   - 2–3 referencias verificadas.
4. Creá `index.ts` con `defineAlgorithm({...})`:
   - Qué escena y capas usa, el input (rango y preset, o dataset de `src/data`) y las opciones.
   - Complejidad, rasgos, contadores visibles, leyenda y duraciones relativas por evento.
5. Agregá **una línea** en `src/algorithms/registry.ts`.

Eso es todo: el menú, la URL `/categoría/id/`, el HTML con su `<title>`, los controles, los hotkeys, los sonidos, el
playground, el comparador y el test de cobertura de contenido (`src/algorithms/content.test.ts`) lo toman solos.
Si el algoritmo necesita algo visual nuevo, escribí una capa en `src/scenes/layers/` y agregá su id a `layers`.

## Cómo agregar un theme

Un theme (`src/themes/contract.ts`) tiene cuatro piezas:

1. **`tokens`**: colores (los de `RequiredColor` son obligatorios; el compilador avisa si falta alguno), los colores de cada estado visual y las tipografías. Todo se expone como variables CSS `--color-*` / `--state-*`.
2. **`css`**: el skin de los componentes (`.ui-button`, `.ui-window`, `.cart`, …). La estructura está en `src/ui/layout.css` y no hace falta tocarla.
3. **`createRenderer()`**: un `StageRenderer` con las primitivas de dibujo. Podés reutilizar `PixelRenderer` con un `PixelStyle` propio (como Mega Drive), o escribir uno nuevo (como `modern`, que dibuja vectorial y con antialias).
4. **`sounds`**: un `SoundPack` que implementa los cues semánticos (`compare`, `swap`, `found`, `complete`, `ui-*`…) y, si querés, `music`.

Registralo en `src/themes/index.ts` y ya aparece en el selector de estilo.

## Atajos de teclado

`Espacio` play/pausa · `→`/`←` paso · `Home`/`End` inicio/fin · `R` reiniciar · `N` datos nuevos · `+`/`−` velocidad ·
`M` sonido · `E` modo edición · `C` código · `I` info · `?` ayuda · `Esc` cerrar.
