import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Merge Sort',
  tagline: 'Dividí a la mitad, ordená cada mitad y mezclalas',
  summary:
    'Divide y vencerás, de arriba hacia abajo: parte el arreglo a la mitad recursivamente hasta llegar a tramos de un solo elemento, que ya están ordenados. Después mezcla cada par de mitades ordenadas tomando siempre el menor de los dos frentes, escribe el resultado en un búfer auxiliar B y lo copia de vuelta a A.',
  steps: [
    'Si el tramo tiene un solo elemento, ya está ordenado.',
    'Si no, calculá mid y ordená recursivamente A[lo..mid] y A[mid+1..hi].',
    'Mezclá: compará A[i] con A[j] y copiá a B el menor (con empate, el de la izquierda, así es estable).',
    'Cuando una mitad se agota, copiá a B lo que queda de la otra.',
    'Copiá B[lo..hi] de vuelta a A[lo..hi].',
  ],
  whenToUse:
    'Cuando necesitás O(n log n) garantizado y estabilidad, o al ordenar listas enlazadas o datos externos (en disco). El costo es O(n) de memoria extra; para arreglos en memoria quicksort suele ser más rápido.',
  references: [
    { title: 'Ordenamiento por mezcla — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_por_mezcla' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.2 Mergesort', url: 'https://algs4.cs.princeton.edu/22mergesort/' },
    { title: 'VisuAlgo — Sorting (animación interactiva)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos. Lo partimos a la mitad hasta que cada pedazo sea trivial.',
    base: 'El tramo [{lo}] tiene solo {value}: un elemento ya está ordenado.',
    split: 'Partimos [{lo}..{hi}] después de {mid}, para ordenar cada mitad por separado.',
    'merge-start': 'Mezclamos las mitades ordenadas de [{lo}..{hi}], cortadas después de {mid}.',
    'compare-le': '{a} ≤ {b}: tomamos {a} de la izquierda (con empate gana la izquierda: estable).',
    'compare-gt': '{a} > {b}: {b} de la derecha es menor, lo tomamos.',
    'write-aux': 'Copiamos {value} a B[{k}].',
    rest: 'Una mitad se agotó: copiamos {value} a B[{k}] sin comparar.',
    'copy-back': 'Copiamos B[{lo}..{hi}] de vuelta a A: ese tramo ya está ordenado.',
    done: '¡Ordenado!',
  },
  legend: {
    inactive: 'Ya copiado a B',
    write: 'Copiado de vuelta',
  },
};

export default content;
