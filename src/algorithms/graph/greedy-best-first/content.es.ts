import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Búsqueda voraz primero el mejor',
  tagline: 'Siempre hacia lo que parece más cerca del destino',
  summary:
    'La búsqueda voraz primero el mejor (greedy best-first) elige siempre el nodo de OPEN con la menor heurística h, es decir, el que parece estar más cerca del destino. Ignora por completo el costo acumulado g. Por eso suele llegar muy rápido, pero el camino que encuentra no tiene por qué ser el más corto: una pared o un desvío caro la pueden engañar.',
  steps: [
    'Poné el origen en OPEN con prioridad h(origen) y marcalo como descubierto.',
    'Sacá de OPEN el nodo con la menor h y cerralo.',
    'Si es el destino, reconstruí el camino siguiendo los padres.',
    'Cada vecino todavía no descubierto recuerda de dónde vino y entra a OPEN con prioridad h. Los ya descubiertos no se reabren.',
    'Repetí hasta encontrar el destino o vaciar OPEN.',
  ],
  whenToUse:
    'Cuando importa encontrar algún camino rápido y no necesariamente el óptimo: juegos, prototipos o espacios enormes con una buena heurística. Si necesitás el camino más corto, usá A*.',
  references: [
    { title: 'Best-first search — Wikipedia (inglés)', url: 'https://en.wikipedia.org/wiki/Best-first_search' },
    { title: 'Introduction to the A* Algorithm (Greedy Best First) — Red Blob Games', url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html' },
    { title: 'Heuristics — Amit Patel, Stanford', url: 'http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html' },
  ],
  narration: {
    start: 'Empezamos en {s} con h = {h}: entra a OPEN y queda descubierto.',
    stale: '{u} ya estaba cerrado: esta entrada vieja de OPEN (h {key}) se descarta.',
    extract: 'Sacamos {u}, el de menor h ({h}) en OPEN: es el que parece más cerca del destino.',
    found: 'Llegamos al destino {t}: el camino cuesta {cost}, aunque puede no ser el mínimo.',
    closed: '{v} ya está cerrado: la búsqueda voraz nunca lo reabre.',
    seen: '{v} ya fue descubierto: no lo agregamos de nuevo aunque este camino sea mejor.',
    'no-improve': 'Llegar a {v} con costo {cand} no mejora {old}: se ignora.',
    discover: 'Descubrimos {v} desde {u}: entra a OPEN con prioridad h = {key}.',
    improve: 'Mejor camino a {v} vía {u}: costo {g} (antes {old}); vuelve a OPEN con h = {key}.',
    'done-found': 'Camino encontrado: {len} aristas, costo {cost}. Rápido, pero sin garantía de ser el más corto.',
    'done-all': 'OPEN quedó vacía: cerramos {count} nodos.',
    'done-unreachable': 'OPEN quedó vacía sin llegar al destino: no hay camino.',
  },
  legend: { frontier: 'En OPEN', visited: 'Cerrado' },
  options: {
    heuristic: 'Heurística',
    'heuristic.manhattan': 'Manhattan',
    'heuristic.euclidean': 'Euclidiana',
  },
};

export default content;
