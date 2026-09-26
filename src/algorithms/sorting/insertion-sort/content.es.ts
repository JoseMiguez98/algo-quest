import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Insertion Sort',
  tagline: 'Levantá cada elemento y deslizalo hasta su lugar',
  summary:
    'Mantiene ordenado el prefijo A[0..i−1]. En cada paso levanta A[i] como clave, desplaza una posición a la derecha a los elementos del prefijo que son mayores que la clave y la inserta en el hueco que queda. Es como ordenar las cartas en la mano: rápido si ya están casi en orden.',
  steps: [
    'Levantá la clave key ← A[i]; su casilla queda libre.',
    'Compará key con A[j], yendo de derecha a izquierda por el prefijo ordenado.',
    'Mientras A[j] > key, desplazá A[j] una posición a la derecha (sin intercambios).',
    'Cuando A[j] ≤ key o llegás al principio, poné key en A[j+1].',
  ],
  whenToUse:
    'Ideal para arreglos chicos o casi ordenados: es estable, in-place y O(n) en el mejor caso. Por eso los algoritmos híbridos (Timsort, introsort) lo usan para los tramos cortos. Con datos grandes y desordenados es O(n²).',
  references: [
    { title: 'Ordenamiento por inserción — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_por_inserci%C3%B3n' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.1 Elementary Sorts', url: 'https://algs4.cs.princeton.edu/21elementary/' },
    { title: 'VisuAlgo — Sorting (animación interactiva)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos. El primero solo ya es un prefijo ordenado.',
    pick: 'Levantamos {value} (posición {i}) para insertarlo en el prefijo ordenado.',
    'compare-gt': '{a} > {key}: {a} tiene que ir después de la clave, lo desplazamos.',
    'compare-le': '{a} ≤ {key}: encontramos el lugar, la clave va justo a su derecha.',
    shift: 'Desplazamos {value} de la posición {from} a la {to} para abrir hueco.',
    boundary: 'Llegamos al principio: la clave es la menor del prefijo.',
    insert: 'Ponemos {value} en la posición {index}; el prefijo sigue ordenado.',
    done: '¡Ordenado!',
  },
  legend: {
    key: 'Clave levantada',
    write: 'Desplazado',
  },
};

export default content;
