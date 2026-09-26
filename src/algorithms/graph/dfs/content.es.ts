import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Búsqueda en profundidad (DFS)',
  tagline: 'Se mete lo más hondo posible antes de volver atrás',
  summary:
    'DFS sigue un camino hasta que no puede avanzar más y recién ahí retrocede para probar la siguiente rama. Esta versión es recursiva: la pila de llamadas guarda el camino actual desde el origen. Si hay un destino, se detiene apenas lo encuentra, así que el camino hallado es válido pero no necesariamente el más corto.',
  steps: [
    'Marcá el nodo actual como visitado (si es el destino, terminaste).',
    'Recorré sus vecinos en orden; los ya visitados se ignoran.',
    'Ante el primer vecino sin visitar, bajá recursivamente a él.',
    'Cuando un nodo no tiene más vecinos nuevos, está terminado: volvé a su padre y seguí con el próximo vecino.',
  ],
  whenToUse:
    'Recorrer todo un grafo con poca memoria, detectar ciclos, orden topológico, componentes fuertemente conexas, puentes o generar laberintos. No lo uses para caminos mínimos: para eso está BFS (sin pesos) o Dijkstra.',
  references: [
    { title: 'Búsqueda en profundidad — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/B%C3%BAsqueda_en_profundidad' },
    { title: 'CLRS, Introduction to Algorithms, §20.3 (22.3 en 3.ª ed.)', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { title: 'Depth First Search — cp-algorithms', url: 'https://cp-algorithms.com/graph/depth-first-search.html' },
  ],
  narration: {
    start: 'Empezamos la recursión en {s}.',
    visit: 'Visitamos {u} a profundidad {depth}: queda en la pila mientras exploramos sus vecinos.',
    seen: '{v} ya fue visitado: bajar de nuevo formaría un ciclo, se ignora.',
    descend: '{v} no fue visitado: {u} queda esperando y bajamos a {v}.',
    resume: 'Volvimos de {v} a {u}: seguimos con el próximo vecino de {u}.',
    backtrack: '{u} no tiene vecinos nuevos: está terminado, retrocedemos a {p}.',
    'finish-root': '{u} no tiene más vecinos nuevos: el origen está terminado.',
    found: 'Llegamos al destino {t}: la pila de llamadas es el camino, con {len} aristas.',
    'done-found': 'Camino encontrado: {len} aristas (no necesariamente el más corto).',
    'done-all': 'Recursión terminada: visitamos {count} nodos alcanzables desde el origen.',
    'done-unreachable': 'Exploramos los {count} nodos alcanzables sin encontrar el destino: no hay camino.',
  },
  legend: { frontier: 'En la pila (esperando)', current: 'Nodo actual', visited: 'Terminado', tree: 'Arista del árbol DFS' },
};

export default content;
