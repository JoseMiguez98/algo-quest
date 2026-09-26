import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Shell Sort',
  tagline: 'Insertion sort con saltos que se achican',
  summary:
    'Hace varias pasadas de insertion sort, pero comparando elementos separados por un salto h. Con saltos grandes, los valores lejanos de su lugar viajan rápido; al final, con h = 1, queda un insertion sort sobre un arreglo casi ordenado, que es muy barato. Usamos la secuencia de Knuth: 1, 4, 13, 40…',
  steps: [
    'Elegí el salto inicial h de la secuencia 1, 4, 13, 40… (el mayor por debajo de n/3).',
    'Para cada i ≥ h, levantá A[i] y desplazá hacia adelante los A[j − h] mayores, saltando de a h.',
    'Al terminar la pasada, el arreglo queda h-ordenado: cada elemento es ≤ que el que está h lugares más allá.',
    'Dividí h por 3 y repetí; la última pasada, con h = 1, es un insertion sort común.',
  ],
  whenToUse:
    'Cuando necesitás algo más rápido que O(n²) sin memoria extra ni recursión: sistemas embebidos o arreglos medianos. No es estable; para datos grandes conviene merge sort o quick sort.',
  references: [
    { title: 'Ordenamiento Shell — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_Shell' },
    { title: 'Sedgewick & Wayne, Algorithms 4.ª ed., §2.1 (Shellsort)', url: 'https://algs4.cs.princeton.edu/21elementary/' },
    { title: 'Shellsort — Wikipedia (inglés): secuencias de saltos', url: 'https://en.wikipedia.org/wiki/Shellsort' },
  ],
  narration: {
    start: '{n} elementos. Los saltos van a ser: {gaps}.',
    gap: 'Nueva pasada con salto h = {h}: comparamos elementos separados por {h} lugares.',
    pick: 'Levantamos {value} (posición {i}) para insertarlo dentro de su subsecuencia.',
    'compare-gt': '{a} > {key}: {a} se corre {h} lugares hacia adelante.',
    'compare-le': '{a} ≤ {key}: encontramos el lugar de la clave.',
    shift: 'Movemos {value} de la posición {from} a la {to}.',
    insert: 'Insertamos {value} en la posición {index}.',
    'h-sorted': 'Listo: el arreglo quedó {h}-ordenado. Achicamos el salto.',
    sorted: 'La pasada con h = 1 terminó: el arreglo está ordenado.',
    done: '¡Ordenado!',
  },
  legend: { key: 'Clave levantada', write: 'Desplazado' },
};

export default content;
