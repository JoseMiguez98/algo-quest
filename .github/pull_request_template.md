## Qué cambia

<!-- Una o dos frases: qué y por qué. Enlazá el issue si existe (Closes #123). -->

## Tipo

- [ ] Algoritmo nuevo
- [ ] Theme nuevo
- [ ] Feature
- [ ] Fix
- [ ] Docs / contenido
- [ ] Chore / CI

## Checklist

- [ ] El PR apunta a `dev` (o a `main` solo si es un hotfix)
- [ ] `npm run typecheck && npm test && npm run e2e && npm run build` pasan
- [ ] Probado a mano en escritorio y mobile (~390 px)
- [ ] Captura o GIF si cambia algo visual

### Si es un algoritmo

- [ ] Tests de propiedades contra una referencia independiente
- [ ] Rasgos demostrados (estable / no estable / óptimo)
- [ ] Fila en `docs/fidelity.md`
- [ ] Contenido ES + EN con 2–3 referencias verificadas

**Variante implementada y referencias:**

### Si es un theme

- [ ] Define todos los `RequiredColor` y los estados visuales
- [ ] La CSS cubre todas las clases (ver la skill `add-theme`)
- [ ] Sound pack con todos los cues
- [ ] Agregado a `tests/e2e/a11y.spec.ts` con 0 violaciones
