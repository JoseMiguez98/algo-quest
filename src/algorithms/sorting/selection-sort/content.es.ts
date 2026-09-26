import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Selection Sort',
  tagline: 'Busca el mínimo de lo que falta y ponelo al frente',
  summary:
    'Divide el arreglo en una parte ordenada a la izquierda y otra pendiente a la derecha. En cada pasada recorre toda la parte pendiente para encontrar el mínimo y lo intercambia con el primer elemento pendiente. Hace siempre la misma cantidad de comparaciones, pero como mucho n − 1 intercambios.',
  steps: [
    'Tomá i como candidato a mínimo de A[i..n−1].',
    'Compará cada A[j] con el mínimo actual; si A[j] es menor, pasa a ser el nuevo mínimo.',
    'Al terminar la pasada, intercambiá A[i] con el mínimo (si no es él mismo).',
    'A[i] queda en su lugar final; repetí con i + 1.',
  ],
  whenToUse:
    'Cuando escribir en memoria es caro y comparar es barato: hace a lo sumo n − 1 intercambios. Por lo demás es O(n²) siempre, incluso con datos ya ordenados, y no es estable. Insertion sort suele ganarle en la práctica.',
  references: [
    { title: 'Ordenamiento por selección — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_por_selecci%C3%B3n' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.1 Elementary Sorts', url: 'https://algs4.cs.princeton.edu/21elementary/' },
    { title: 'VisuAlgo — Sorting (animación interactiva)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos. Cada pasada busca el mínimo de lo que falta y lo pone al frente.',
    pass: 'Pasada {pass}: buscamos el mínimo desde la posición {i}; arrancamos suponiendo que es A[{i}].',
    'compare-lt': '{a} < {b}: encontramos un valor menor que el mínimo actual.',
    'compare-ge': '{a} ≥ {b}: no es menor que el mínimo actual, seguimos.',
    'new-min': 'Nuevo mínimo: {value} en la posición {index}.',
    swap: 'Intercambiamos {a} con el mínimo {b} para llevarlo al frente.',
    'no-swap': '{value} ya era el mínimo y está en su lugar: no hace falta intercambiar.',
    lock: '{value} quedó en su posición final ({index}).',
    done: '¡Ordenado!',
  },
  legend: {
    min: 'Mínimo actual',
  },
};

export default content;
