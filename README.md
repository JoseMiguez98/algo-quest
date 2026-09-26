# Algo Quest

[![CI](https://github.com/JoseMiguez98/algo-quest/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/JoseMiguez98/algo-quest/actions/workflows/ci.yml)
[![Deploy](https://github.com/JoseMiguez98/algo-quest/actions/workflows/deploy.yml/badge.svg)](https://github.com/JoseMiguez98/algo-quest/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Visualizaciones educativas de algoritmos de ordenamiento y de grafos, con estética de consola de 16 bits,
sonido sintetizado por código, pseudocódigo en vivo, modo playground y comparador.

**Jugalo en https://josemiguez98.github.io/algo-quest/**. La versión en desarrollo (rama `dev`) está en [`/dev/`](https://josemiguez98.github.io/algo-quest/dev/).

```bash
npm install
npm run dev        # http://localhost:5180
npm test           # tests de exactitud (Vitest + fast-check)
npm run e2e        # tests end-to-end y de accesibilidad (Playwright + axe)
npm run build      # sitio estático en dist/
```

Para publicar en una subcarpeta (por ejemplo GitHub Pages en `/algo-quest/`): `BASE_PATH=/algo-quest/ npm run build`.
El deploy lo hace `.github/workflows/deploy.yml` en cada push a `main` o a `dev`.
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

## Contribuir

Los aportes son bienvenidos: algoritmos, themes, traducciones, fixes y mejores explicaciones. Empezá por
[CONTRIBUTING.md](CONTRIBUTING.md).

- **Agregar un algoritmo:** una carpeta en `src/algorithms/<categoría>/<id>/` más una línea en `src/algorithms/registry.ts`. El checklist está en [`.claude/skills/add-algorithm`](.claude/skills/add-algorithm/SKILL.md).
- **Agregar un theme:** tokens, CSS, renderer y sound pack en `src/themes/<id>/`. Ver [`.claude/skills/add-theme`](.claude/skills/add-theme/SKILL.md).
- **Ramas y PRs:** las ramas salen de `dev` y los PRs van hacia `dev`. `main` es producción. Ver [`.claude/skills/contribute`](.claude/skills/contribute/SKILL.md).

Con [Claude Code](https://claude.com/claude-code), esas tres skills se cargan solas cuando pedís, por ejemplo, "agregá comb sort".

## Métricas

El sitio publicado cuenta visitas y eventos de uso (play, paso atrás, edición, comparaciones) con
[GoatCounter](https://www.goatcounter.com/). GoatCounter no usa cookies ni datos personales, y respeta *Do Not Track*.
Solo se activa en producción cuando existe la variable `VITE_GOATCOUNTER`; ni en local ni en `/dev/` se envía nada.
El código está en `src/core/analytics.ts`.

## Atajos de teclado

`Espacio` play/pausa · `→`/`←` paso · `Home`/`End` inicio/fin · `R` reiniciar · `N` datos nuevos · `+`/`−` velocidad ·
`M` sonido · `E` modo edición · `C` código · `I` info · `?` ayuda · `Esc` cerrar.

## Licencia

[MIT](LICENSE) © 2026 JoseMiguez98
