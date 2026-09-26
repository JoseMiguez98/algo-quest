import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Búsqueda en anchura (BFS)',
  tagline: 'Explora por niveles, como una onda que se expande',
  summary:
    'BFS visita primero todos los vecinos del origen, después los vecinos de esos vecinos, y así sucesivamente. Usa una cola FIFO: lo que se descubre primero se procesa primero. Por eso, en un grafo sin pesos encuentra el camino con menos aristas hacia cada nodo.',
  steps: [
    'Poné el origen en la cola con distancia 0.',
    'Sacá el primer nodo de la cola.',
    'Cada vecino todavía no descubierto recibe distancia +1, recuerda de dónde vino y entra al final de la cola.',
    'Repetí hasta vaciar la cola (o hasta sacar el destino).',
  ],
  whenToUse:
    'Caminos mínimos en grafos sin pesos (laberintos, redes sociales, estados de un juego), detectar componentes conexas o calcular distancias en saltos. Si las aristas tienen pesos distintos, usá Dijkstra.',
  references: [
    { title: 'Búsqueda en anchura — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/B%C3%BAsqueda_en_anchura' },
    { title: 'CLRS, Introduction to Algorithms, §20.2 (22.2 en 3.ª ed.)', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { title: 'Breadth-first search — cp-algorithms', url: 'https://cp-algorithms.com/graph/breadth-first-search.html' },
  ],
  narration: {
    start: 'Empezamos en {s}: distancia 0 y a la cola.',
    dequeue: 'Sacamos {u} de la cola (distancia {d}) y revisamos sus vecinos.',
    seen: '{v} ya fue descubierto (distancia {d}): se ignora.',
    discover: 'Descubrimos {v} desde {u}: distancia {d}. Entra al final de la cola.',
    found: 'Sacamos el destino {t}: el camino más corto tiene {d} aristas.',
    'done-found': 'Camino más corto encontrado: {d} aristas.',
    'done-all': 'La cola quedó vacía: visitamos {count} nodos, cada uno con su distancia mínima en saltos.',
    'done-unreachable': 'La cola quedó vacía sin llegar al destino: no hay camino.',
  },
  legend: { frontier: 'En la cola', visited: 'Ya procesado' },
};

export default content;
