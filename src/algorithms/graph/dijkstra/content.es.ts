import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Algoritmo de Dijkstra',
  tagline: 'Siempre avanza por el nodo más cercano todavía no resuelto',
  summary:
    'Dijkstra calcula caminos mínimos desde un origen en grafos con pesos no negativos. Mantiene una cola de prioridad ordenada por distancia y, en cada paso, saca el nodo más cercano: como ningún peso es negativo, esa distancia ya es definitiva. Después relaja sus aristas, mejorando la distancia de los vecinos si pasar por él es más barato.',
  steps: [
    'Poné dist[origen] = 0, todas las demás en ∞, y el origen en el heap.',
    'Sacá la entrada de menor distancia; si el nodo ya es final, es una entrada vieja: descartala (borrado perezoso).',
    'Marcá el nodo como final (si es el destino, terminaste).',
    'Para cada vecino no final: si dist[u] + w < dist[v], actualizá dist[v] y su padre, e insertá una entrada nueva en el heap.',
  ],
  whenToUse:
    'Rutas más baratas en mapas, redes de transporte o de computadoras, siempre que los pesos sean ≥ 0. Con pesos negativos usá Bellman-Ford; si tenés un único destino y una buena heurística, A* suele explorar menos.',
  references: [
    { title: 'Algoritmo de Dijkstra — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Algoritmo_de_Dijkstra' },
    { title: 'E. W. Dijkstra (1959), «A note on two problems in connexion with graphs»', url: 'https://doi.org/10.1007/BF01386390' },
    { title: 'Dijkstra — cp-algorithms', url: 'https://cp-algorithms.com/graph/dijkstra.html' },
  ],
  narration: {
    start: 'Empezamos en {s}: distancia 0 y al heap; el resto arranca en ∞.',
    stale: 'Sacamos {u} con distancia {key}, pero ya es final: es una entrada vieja, se descarta.',
    extract: 'Sacamos {u} con la menor distancia ({key}): ningún otro camino puede ser más corto, queda final.',
    found: 'Sacamos el destino {t}: su distancia {cost} ya es definitiva.',
    'done-found': 'Camino más corto encontrado: costo {cost} en {len} aristas.',
    closed: '{v} ya es final: su distancia no puede mejorar, se ignora.',
    seen: '{v} ya fue descubierto: se ignora.',
    'no-improve': 'Por aquí llegaríamos a {v} con {cand}, que no mejora {old}: no se toca.',
    discover: 'Descubrimos {v} desde {u}: distancia {g} (antes {old}), entra al heap.',
    improve: 'Pasar por {u} lleva a {v} con {g} < {old}: camino más corto, actualizamos e insertamos de nuevo.',
    'done-all': 'El heap quedó vacío: {count} nodos con su distancia mínima definitiva.',
    'done-unreachable': 'El heap quedó vacío sin llegar al destino: no hay camino.',
  },
  legend: {
    frontier: 'En la cola de prioridad',
    current: 'Recién extraído',
    visited: 'Distancia final',
    focus: 'Entrada vieja',
    tree: 'Árbol de caminos mínimos',
    relaxed: 'Arista relajada',
    rejected: 'No mejora',
  },
};

export default content;
