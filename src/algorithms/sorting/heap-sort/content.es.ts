import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Heap Sort',
  tagline: 'Armá un montículo de máximos y sacá la raíz una y otra vez',
  summary:
    'Ve el arreglo como un árbol binario completo (hijos de i en 2i+1 y 2i+2) y lo convierte en un montículo de máximos, donde cada padre es mayor o igual que sus hijos. Así el mayor queda en la raíz: se lo intercambia con el último elemento del montículo, el montículo se achica en uno y se hunde la nueva raíz para restaurar la propiedad. Ordena en el lugar, siempre en O(n log n).',
  steps: [
    'Construí el montículo de abajo hacia arriba: hundí cada nodo desde ⌊n/2⌋−1 hasta 0.',
    'Hundir un nodo: compararlo con sus hijos y, si alguno es mayor, intercambiarlo con el hijo mayor y repetir.',
    'Intercambiá la raíz (el máximo) con el último elemento del montículo: queda en su lugar final.',
    'Achicá el montículo en uno y hundí la nueva raíz; repetí hasta que quede un solo elemento.',
  ],
  whenToUse:
    'Cuando necesitás O(n log n) garantizado sin memoria extra, por ejemplo como respaldo de introsort. En la práctica suele ser más lento que quicksort por su mal uso de la caché, y no es estable.',
  references: [
    { title: 'Heapsort — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Heapsort' },
    { title: 'Sedgewick & Wayne, Algorithms, §2.4 Priority Queues', url: 'https://algs4.cs.princeton.edu/24pq/' },
    { title: 'VisuAlgo — Binary Heap', url: 'https://visualgo.net/en/heap' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos: primero lo convertimos en un montículo de máximos.',
    heapify: 'Hundimos el nodo {i} ({value}) para que su subárbol cumpla la propiedad de montículo.',
    'left-larger': 'El hijo izquierdo {child} es mayor que el padre {parent}: es candidato a subir.',
    'left-smaller': 'El hijo izquierdo {child} no supera al padre {parent}.',
    'right-larger': 'El hijo derecho {child} supera a {best}: es el mayor de los tres.',
    'right-smaller': 'El hijo derecho {child} no supera a {best}.',
    settle: '{value} es mayor o igual que sus hijos: ya está en su lugar dentro del montículo.',
    leaf: '{value} es una hoja: no tiene hijos, no hay nada que hundir.',
    'sift-swap': 'Intercambiamos {a} con su hijo mayor {b} y seguimos hundiendo.',
    'heap-built': 'Montículo listo: el máximo, {max}, está en la raíz.',
    extract: 'Sacamos el máximo {max} a la posición {end}, que ya es su lugar final.',
    done: '¡Ordenado!',
  },
  legend: {
    active: 'Nodo que se hunde',
    compare: 'Hijo comparado',
    max: 'Hijo mayor',
    sorted: 'Extraído (ordenado)',
  },
};

export default content;
