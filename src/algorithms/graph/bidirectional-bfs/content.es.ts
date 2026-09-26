import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'BFS bidireccional',
  tagline: 'Dos BFS, una desde cada punta, que se encuentran en el medio',
  summary:
    'Lanza una BFS desde el origen y otra desde el destino (sobre las aristas invertidas) y las hace crecer hasta que se tocan. Como cada una sólo llega a la mitad de la distancia, explora muchos menos nodos que una BFS simple. Al primer contacto no corta: termina la capa entera y se queda con el encuentro más corto, así el camino es mínimo.',
  steps: [
    'Poné el origen en una frontera y el destino en la otra, ambos con distancia 0.',
    'Elegí un lado (por defecto se alternan; con la opción «menor», el de frontera más chica) y expandí su capa completa.',
    'Cada vecino ya alcanzado por el otro lado es un encuentro: largo = dX[u] + 1 + dY[v]; guardá el mejor.',
    'Los vecinos nuevos reciben distancia +1 y pasan a la próxima capa de ese lado.',
    'Al terminar una capa con algún encuentro, uní los dos medios caminos por el mejor.',
  ],
  whenToUse:
    'Camino mínimo entre dos nodos conocidos en grafos sin pesos con mucha ramificación: grados de separación en redes sociales, puzzles con estados, escaleras de palabras. Necesita poder recorrer las aristas al revés desde el destino.',
  references: [
    { title: 'Bidirectional search — Wikipedia (inglés)', url: 'https://en.wikipedia.org/wiki/Bidirectional_search' },
    { title: 'Everyone gets bidirectional BFS wrong — zdimension', url: 'https://zdimension.fr/everyone-gets-bidirectional-bfs-wrong/' },
  ],
  narration: {
    start: 'Arrancamos dos búsquedas: una desde {s} y otra desde {t}, las dos con distancia 0.',
    'done-same': 'El origen y el destino son el mismo nodo: el camino tiene 0 aristas.',
    'layer-forward': 'Turno del origen: expandimos su capa completa de {size} nodos a distancia {depth}.',
    'layer-backward': 'Turno del destino: expandimos su capa completa de {size} nodos a distancia {depth}.',
    expand: 'Expandimos {u}: revisamos sus vecinos.',
    meet: '{v} ya lo alcanzó el otro lado: encuentro por {u}–{v} de {length} aristas, el mejor hasta ahora.',
    'meet-worse': 'Otro encuentro por {u}–{v}, pero de {length} aristas: no mejora el que ya tenemos.',
    seen: '{v} ya fue descubierto desde este lado: se ignora.',
    discover: 'Descubrimos {v} desde {u}: distancia {d}, entra en la próxima capa.',
    found: 'La capa terminó con un encuentro: unimos los dos medios caminos, {len} aristas.',
    'done-found': 'Camino más corto encontrado: {len} aristas.',
    fail: 'Una de las fronteras quedó vacía sin tocar a la otra.',
    'done-unreachable': 'Las búsquedas nunca se encontraron: no hay camino entre origen y destino.',
  },
  legend: {
    frontier: 'Frontera desde el origen',
    'frontier-b': 'Frontera desde el destino',
    visited: 'Expandido desde el origen',
    'visited-b': 'Expandido desde el destino',
    meet: 'Punto de encuentro',
    tree: 'Árbol del origen',
    'tree-b': 'Árbol del destino',
  },
  options: {
    alternation: 'Qué lado expandir',
    'alternation.alternate': 'Alternar',
    'alternation.smaller': 'Frontera menor',
  },
};

export default content;
