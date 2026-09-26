# Fidelidad algorítmica

Cada visualizer reproduce una traza generada por un núcleo puro en `src/algorithms/**/algorithm.ts`.
Los tests (`npm test`, Vitest + fast-check) comparan cada núcleo contra implementaciones de referencia
independientes sobre miles de entradas aleatorias, además de los datasets curados de `src/data/legacy-graphs.ts`.

Contrato común verificado para todos: la traza empieza en `start` y termina en `done`, cada paso apunta a una
línea de pseudocódigo existente, los contadores nunca decrecen y ningún snapshot se muta después de emitido.

## Sorting

| Algoritmo | Variante | Referencia | Invariantes verificados |
|---|---|---|---|
| Bubble | Rango decreciente + salida temprana, `>` estricto | Knuth TAOCP 5.2.2 | resultado, estabilidad, comparaciones/swaps = referencia, swaps = inversiones, sufijo final tras cada pasada |
| Selection | Mínimo con `<`, un swap por pasada, sin swap si `min = i` | Sedgewick 2.1 | n(n−1)/2 comparaciones, ≤ n−1 swaps, prefijo final, inestabilidad demostrable `[2,2,1]` |
| Insertion | Desplazamientos (no swaps), `>` estricto | CLRS 2.1 | estabilidad, desplazamientos = inversiones, prefijo ordenado, un solo hueco mientras la clave está levantada |
| Merge | Top-down, `mid = ⌊(lo+hi)/2⌋`, buffer auxiliar B, `≤` | CLRS 2.3 | estabilidad, comparaciones = referencia, `A[lo..hi]` ordenado tras cada merge, profundidad ⌈log₂ n⌉ |
| Quick | Lomuto, pivote en `A[hi]` (opciones: first, median3, random), `≤` | CLRS 7.1 | soporta duplicados, invariante de partición, conteos = referencia, sin contar self-swaps, inestabilidad demostrable |
| Heap | Max-heap 0-indexado, build bottom-up, sift-down iterativo | CLRS 6.4 | heap válido tras build y tras cada extracción, conteos = referencia, inestabilidad demostrable `[1,1]` |
| Counting | Estable (recorrido inverso), claves desplazadas por `min` (acepta negativos) | CLRS 8.2 | estabilidad, 0 comparaciones, 2n escrituras, `C[v]` = #elementos ≤ v tras prefijos |
| Radix | LSD, base configurable (default 10), counting sort estable por dígito | CLRS 8.3 | cualquier cantidad de dígitos, tras la pasada p = orden estable por los últimos p dígitos, rechaza negativos |
| Bucket | k buckets (default 5) por rango entero, insertion sort por bucket | CLRS 8.4 (adaptado a enteros) | estabilidad, cada ítem en el bucket cuyo rango anunciado lo contiene, acepta negativos |

## Grafos

Orden de vecinos documentado: grillas en sentido horario desde la derecha (→ ↓ ← ↑); otros grafos por índice ascendente.

| Algoritmo | Variante | Referencia | Invariantes verificados |
|---|---|---|---|
| BFS | Marca al encolar; con destino, se detiene al desencolarlo | CLRS 22.2 | distancias = referencia, camino mínimo en saltos, cada nodo descubierto una vez, desencolado por distancia no decreciente |
| DFS | Recursivo, marca al entrar | CLRS 22.3 | preorden = referencia, tiempos de descubrimiento/fin anidados, camino = pila de recursión |
| BFS bidireccional | Capa completa por turno (alternado u opción "frontera menor"), mejor encuentro de la capa | Pohl 1971 | longitud = BFS en grafos dirigidos y no dirigidos, ambos modos |
| Dijkstra | Heap binario con borrado perezoso; nodos finales se omiten | CLRS 24.3 | distancias = referencia O(V²), finaliza en orden no decreciente, nunca relaja nodos finales |
| A* | f = g + h, desempate por h, cierre al extraer | Hart, Nilsson, Raphael 1968 | óptimo con h admisible y consistente (euclídea/Manhattan), expande ≤ Dijkstra, A* ponderado da camino válido |
| Greedy best-first | Prioridad h, sin reapertura | Russell & Norvig 3.5 | camino válido si existe, costo ≥ óptimo, dataset trampa subóptimo |
| Bellman-Ford | V−1 pasadas, salida temprana, pasada de detección | CLRS 24.1 | = Dijkstra sin negativos, = Floyd con negativos, ciclo extraído existe y pesa < 0 |
| Floyd-Warshall | k exterior, matriz `next` para reconstrucción | CLRS 25.2 | = V × Dijkstra, exactamente V³ chequeos, caminos reconstruidos óptimos, diagonal negativa = ciclo |
| Backtracking (laberinto) | DFS recursivo con memo de visitados (opción "puro": solo prohíbe el camino actual) | Skiena 7.1 | encuentra salida sii es alcanzable (ambos modos), camino en pantalla = pila de recursión |

## Correcciones respecto de los visualizers originales

- Quick sort fallaba con valores repetidos y contaba swaps nulos.
- Radix sort estaba fijado a 3 dígitos.
- Counting sort mostraba `CMP:0` fijo.
- Heap, selection y quick afirmaban inestabilidad sin datos que la demostraran.
- Dijkstra relajaba nodos ya finales; A* ocultaba entradas obsoletas del heap; GBFS y A* cerraban nodos en momentos distintos.
- Bellman-Ford podía fallar al extraer un ciclo negativo que contiene al origen (hallado por los tests nuevos).
