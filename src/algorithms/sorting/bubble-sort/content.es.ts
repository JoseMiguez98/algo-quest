import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bubble Sort',
  tagline: 'Compara vecinos e intercambia hasta que nada se mueve',
  summary:
    'Recorre el arreglo comparando cada par de elementos vecinos y los intercambia si están en el orden incorrecto. En cada pasada, el mayor de los que quedan "burbujea" hasta el final. Si una pasada completa no hace ningún intercambio, el arreglo ya está ordenado y el algoritmo termina antes.',
  steps: [
    'Compará A[j] con A[j+1]; si el de la izquierda es mayor, intercambialos.',
    'Al terminar la pasada, el mayor elemento restante queda en su posición final.',
    'La siguiente pasada recorre un elemento menos.',
    'Si una pasada no intercambia nada, el arreglo está ordenado: se corta.',
  ],
  whenToUse:
    'Casi nunca en producción: es O(n²). Sirve para aprender la idea de invariante de bucle y es razonable con listas diminutas o casi ordenadas, donde la salida temprana lo vuelve lineal.',
  references: [
    { title: 'Bubble sort — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_de_burbuja' },
    { title: 'Knuth, The Art of Computer Programming, Vol. 3, §5.2.2', url: 'https://www-cs-faculty.stanford.edu/~knuth/taocp.html' },
    { title: 'VisuAlgo — Sorting', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos. Cada pasada lleva el mayor que queda hasta el final.',
    pass: 'Pasada {pass}: recorremos hasta la posición {end}.',
    'compare-gt': '{a} > {b}: están desordenados, hay que intercambiarlos.',
    'compare-le': '{a} ≤ {b}: ya están en orden, seguimos.',
    swap: 'Intercambiamos {a} y {b}.',
    lock: '{value} llegó a su lugar final (posición {index}).',
    'early-exit': 'Esta pasada no intercambió nada: el arreglo ya está ordenado.',
    done: '¡Ordenado!',
  },
};

export default content;
