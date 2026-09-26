import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Búsqueda A*',
  tagline: 'Dijkstra con brújula: prioriza lo que parece más cerca del destino',
  summary:
    'A* ordena la cola por f = g + h: g es el costo real desde el origen y h una estimación de lo que falta hasta el destino. Así explora primero los nodos que parecen estar en el mejor camino. Si h nunca sobreestima (admisible) y es consistente, el primer camino que saca al destino es óptimo, y en general visita muchos menos nodos que Dijkstra.',
  steps: [
    'Poné g[origen] = 0 y el origen en OPEN con f = h(origen).',
    'Sacá el nodo de menor f (a igual f, el de menor h); si ya está en CLOSED es una entrada vieja y se descarta.',
    'Pasalo a CLOSED (si es el destino, terminaste).',
    'Para cada vecino fuera de CLOSED: si g[u] + w < g[v], actualizá g[v] y su padre, e insertalo en OPEN con f = g[v] + h(v).',
    'La heurística por defecto es euclidiana en grafos libres y Manhattan en grillas: admisibles y consistentes si cada peso es ≥ la distancia que cubre.',
  ],
  whenToUse:
    'Buscar un camino entre dos puntos cuando podés estimar la distancia al destino: pathfinding en videojuegos, robótica, mapas y navegación. Con h = 0 se vuelve Dijkstra; con peso > 1 gana velocidad a costa de la optimalidad.',
  references: [
    { title: 'Algoritmo de búsqueda A* — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Algoritmo_de_b%C3%BAsqueda_A*' },
    { title: 'Hart, Nilsson y Raphael (1968), «A Formal Basis for the Heuristic Determination of Minimum Cost Paths»', url: 'https://doi.org/10.1109/TSSC.1968.300136' },
    { title: 'Introduction to the A* Algorithm — Red Blob Games', url: 'https://www.redblobgames.com/pathfinding/a-star/introduction.html' },
  ],
  narration: {
    start: 'Empezamos en {s}: g = 0 y h = {h}, entra a OPEN.',
    stale: 'Sacamos {u} con f = {key}, pero ya está en CLOSED: entrada vieja, se descarta.',
    extract: 'Sacamos {u}, el de menor f = {g} + {h} = {key}: pasa a CLOSED.',
    found: 'Sacamos el destino {t}: con h admisible, su costo {cost} es óptimo.',
    'done-found': 'Camino encontrado: costo {cost} en {len} aristas.',
    closed: '{v} ya está en CLOSED: se ignora.',
    seen: '{v} ya fue descubierto: se ignora.',
    'no-improve': 'Por aquí g[{v}] sería {cand}, que no mejora {old}: no se toca.',
    discover: 'Descubrimos {v} desde {u}: g = {g}, f = {key}. Entra a OPEN.',
    improve: 'Pasar por {u} deja g[{v}] = {g} < {old}: mejor camino, reinsertamos con f = {key}.',
    'done-all': 'OPEN quedó vacío: se cerraron {count} nodos.',
    'done-unreachable': 'OPEN quedó vacío sin llegar al destino: no hay camino.',
  },
  legend: {
    frontier: 'En OPEN',
    current: 'Recién extraído',
    visited: 'En CLOSED',
    focus: 'Entrada vieja',
    tree: 'Mejor padre conocido',
    relaxed: 'Arista relajada',
    rejected: 'Descartada',
  },
  options: {
    heuristic: 'Heurística h',
    'heuristic.manhattan': 'Manhattan (|Δx| + |Δy|)',
    'heuristic.euclidean': 'Euclidiana (línea recta)',
    'heuristic.zero': 'Cero (equivale a Dijkstra)',
    weight: 'Peso de h',
    'weight.1': '×1 (A* clásico, óptimo)',
    'weight.1.5': '×1,5 (A* ponderado: más rápido, puede no ser óptimo)',
    'weight.3': '×3 (casi voraz: muy rápido, puede no ser óptimo)',
  },
};

export default content;
