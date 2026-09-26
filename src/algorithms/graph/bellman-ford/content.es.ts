import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bellman-Ford',
  tagline: 'Relaja todas las aristas, pasada tras pasada',
  summary:
    'Bellman-Ford calcula el camino más corto desde un origen a todos los nodos, incluso con pesos negativos. En cada pasada recorre la lista completa de aristas y relaja cada una: si ir por u mejora la distancia a v, la actualiza. Como un camino simple tiene a lo sumo |V| − 1 aristas, alcanzan |V| − 1 pasadas. Una pasada extra que todavía mejore algo delata un ciclo negativo.',
  steps: [
    'Poné distancia 0 al origen e ∞ al resto.',
    'Hacé hasta |V| − 1 pasadas: en cada una, relajá todas las aristas (u, v, w) en orden.',
    'Si una pasada entera no cambia ninguna distancia, cortá antes: ya convergió.',
    'Si hiciste todas las pasadas, recorré las aristas una vez más: si alguna todavía mejora, hay un ciclo negativo.',
  ],
  whenToUse:
    'Grafos con pesos negativos, detección de ciclos negativos (por ejemplo, arbitraje de monedas) o protocolos de ruteo por vector de distancias. Si todos los pesos son no negativos, Dijkstra es mucho más rápido.',
  references: [
    { title: 'Algoritmo de Bellman-Ford — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Algoritmo_de_Bellman-Ford' },
    { title: 'R. Bellman, “On a routing problem” (1958)', url: 'https://doi.org/10.1090/qam/102435' },
    { title: 'Bellman-Ford — cp-algorithms', url: 'https://cp-algorithms.com/graph/bellman_ford.html' },
  ],
  narration: {
    start: 'Origen {s} con distancia 0; con {n} nodos alcanzan como mucho {passes} pasadas.',
    pass: 'Pasada {pass} de {passes}: relajamos todas las aristas de nuevo.',
    unreached: '{u} todavía no fue alcanzado: la arista {u}→{v} no puede mejorar nada.',
    'no-improve': 'Ir a {v} por {u} cuesta {cand}, no mejora {old}: la dejamos.',
    relax: 'Relajamos {u}→{v}: {cand} mejora {old}, así que {v} ahora llega por {u}.',
    converged: 'La pasada {pass} no cambió nada: las distancias ya son definitivas, cortamos antes.',
    detect: 'Hicimos todas las pasadas: una más revisa si alguna arista todavía mejora (ciclo negativo).',
    verify: '{u}→{v} ya no mejora nada: sin ciclo negativo por acá.',
    cycle: '{u}→{v} todavía mejora tras |V| − 1 pasadas: ciclo negativo {cycle}.',
    'done-cycle': 'Hay un ciclo negativo alcanzable: las distancias pueden bajar sin límite.',
    found: 'Camino más corto hasta {t}: costo {cost}.',
    done: 'Listo tras {passes} pasadas: cada nodo alcanzable tiene su distancia mínima.',
  },
  legend: { visited: 'Alcanzado', relaxed: 'Arista relajada', dead: 'En ciclo negativo' },
};

export default content;
