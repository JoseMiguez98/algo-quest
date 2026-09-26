import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Quick Sort',
  tagline: 'Elegí un pivote, separá menores y mayores, repetí',
  summary:
    'Divide y vencerás con partición de Lomuto: elige un pivote, lo lleva a A[hi] y recorre el tramo dejando a la izquierda todo lo que es ≤ pivote. Al final pone el pivote justo después de esa zona, en su posición definitiva, y ordena recursivamente cada lado. La elección del pivote decide si es rápido o cuadrático.',
  steps: [
    'Elegí el pivote según la estrategia y movelo a A[hi] (por defecto ya es A[hi]).',
    'Recorré j de lo a hi − 1: si A[j] ≤ pivote, avanzá la frontera i e intercambiá A[i] con A[j].',
    'Intercambiá A[i+1] con A[hi]: el pivote queda en su lugar final p.',
    'Ordená recursivamente A[lo..p−1] y A[p+1..hi]; los tramos de un elemento ya están listos.',
  ],
  whenToUse:
    'El ordenamiento de propósito general más usado en la práctica: in-place y muy rápido en promedio, O(n log n). No es estable y su peor caso es O(n²) (con pivote fijo y datos ya ordenados); mediana de tres o pivote aleatorio lo evitan casi siempre.',
  references: [
    { title: 'Quicksort — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Quicksort' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.3 Quicksort', url: 'https://algs4.cs.princeton.edu/23quicksort/' },
    { title: 'VisuAlgo — Sorting (animación interactiva)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos. Cada partición deja un pivote en su lugar final.',
    base: 'El tramo [{lo}] tiene solo {value}: ya está en su lugar.',
    'move-pivot': 'Llevamos el pivote {value} de la posición {from} al final del tramo.',
    pivot: 'Particionamos [{lo}..{hi}] con pivote {pivot}: los ≤ {pivot} irán a la izquierda.',
    'compare-le': '{a} ≤ {pivot}: va a la zona izquierda, avanzamos la frontera.',
    'compare-gt': '{a} > {pivot}: se queda a la derecha, seguimos.',
    swap: 'Intercambiamos: {b} entra a la zona ≤ pivote y {a} pasa a la derecha.',
    grow: 'Ya estaba en la frontera: la zona ≤ pivote crece hasta la posición {i}.',
    place: 'Ponemos el pivote {pivot} en la posición {p}: ahí queda para siempre.',
    done: '¡Ordenado!',
  },
  legend: {
    pivot: 'Pivote',
    active: 'Frontera i (≤ pivote)',
  },
  options: {
    pivot: 'Pivote',
    'pivot.last': 'Último',
    'pivot.first': 'Primero',
    'pivot.median3': 'Mediana de tres',
    'pivot.random': 'Aleatorio',
  },
};

export default content;
