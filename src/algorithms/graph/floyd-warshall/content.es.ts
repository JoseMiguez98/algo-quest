import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Floyd-Warshall',
  tagline: 'Todos los caminos mínimos, un intermedio a la vez',
  summary:
    'Floyd-Warshall calcula el camino más corto entre todos los pares de nodos. Parte de la matriz de pesos directos y, para cada nodo k, se pregunta en cada par (i, j): ¿pasar por k mejora lo mejor que teníamos? Al terminar con k, los caminos pueden usar como intermedios cualquiera de los nodos ya probados. Una matriz next guarda el primer salto para reconstruir caminos.',
  steps: [
    'Armá dist con los pesos directos (0 en la diagonal, ∞ sin arista) y next[i][j] = j.',
    'Para cada k (bucle exterior), recorré todos los pares (i, j).',
    'Si dist[i][k] + dist[k][j] < dist[i][j], actualizá la distancia y next[i][j] ← next[i][k].',
    'Al final, un valor negativo en la diagonal indica un ciclo negativo.',
    'Para un camino u → v, seguí next[u][v] hasta llegar a v.',
  ],
  whenToUse:
    'Cuando necesitás distancias entre todos los pares en grafos chicos o densos (unos cientos de nodos), con pesos negativos permitidos, o para la clausura transitiva. En grafos grandes y dispersos conviene Dijkstra desde cada nodo.',
  references: [
    { title: 'Algoritmo de Floyd-Warshall — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Algoritmo_de_Floyd-Warshall' },
    { title: 'R. W. Floyd, “Algorithm 97: Shortest path” (1962)', url: 'https://doi.org/10.1145/367766.368168' },
    { title: 'Floyd-Warshall — cp-algorithms', url: 'https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html' },
  ],
  narration: {
    start: 'Matriz inicial de {n}×{n}: pesos directos, 0 en la diagonal e ∞ donde no hay arista.',
    pivot: 'Nuevo intermedio k = {k}: ¿pasar por {k} acorta algún par?',
    update: '{i} → {k} → {j} cuesta {via}, mejor que {old}: actualizamos y el camino ahora pasa por {k}.',
    'no-route': 'No hay camino {i} → {k} o {k} → {j}: pasar por {k} no sirve, queda {cur}.',
    'no-improve': '{i} → {k} → {j} cuesta {via}, no mejora lo mejor hasta ahora ({cur}).',
    cycle: 'dist[{v}][{v}] es negativa: hay un ciclo negativo y los caminos mínimos no están definidos.',
    'done-cycle': 'Terminamos con un ciclo negativo: las distancias afectadas no tienen mínimo.',
    found: 'Camino más corto de {s} a {t}: costo {cost}, reconstruido con next.',
    done: 'Listo: la matriz tiene la distancia mínima entre cada par de nodos.',
  },
  legend: { current: 'Intermedio k', frontier: 'Origen i', 'frontier-b': 'Destino j' },
};

export default content;
