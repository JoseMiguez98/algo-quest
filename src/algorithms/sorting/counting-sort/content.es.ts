import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Counting Sort',
  tagline: 'Contá cuántas veces aparece cada valor y ubicalos sin comparar',
  summary:
    'No compara elementos: cuenta cuántas veces aparece cada valor en un arreglo C, indexado por valor − mínimo (así admite negativos). Después acumula esos conteos para que C[v] diga cuántos elementos son ≤ v, que es justo la posición final del último de ellos. Recorriendo A de derecha a izquierda coloca cada elemento en el arreglo de salida B, lo que mantiene el orden de los iguales. Tarda O(n + k), con k el rango de valores.',
  steps: [
    'Buscá el mínimo lo y el máximo; creá C con k + 1 ceros, donde k = máx − lo.',
    'Recorré A y sumá 1 en C[A[i] − lo] por cada elemento.',
    'Acumulá: C[v] += C[v − 1], así C[v] cuenta cuántos elementos son ≤ v.',
    'Recorré A de derecha a izquierda: restá 1 a C[A[i] − lo] y escribí A[i] en B en esa posición.',
    'Copiá B de vuelta en A.',
  ],
  whenToUse:
    'Ideal con enteros de rango chico comparado con n (edades, notas, bytes). Si el rango es enorme, la memoria y el tiempo O(k) lo vuelven impráctico. Por ser estable es la base de radix sort.',
  references: [
    { title: 'Ordenamiento por cuentas — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_por_cuentas' },
    { title: 'VisuAlgo — Sorting (Counting Sort)', url: 'https://visualgo.net/en/sorting' },
    { title: 'Programiz — Counting Sort', url: 'https://www.programiz.com/dsa/counting-sort' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos: lo vamos a ordenar contando, sin comparar.',
    range: 'Valores entre {lo} y {hi}: el valor v va en la casilla v − {lo}, de 0 a {k}.',
    init: 'Creamos C con {size} casillas en cero, una por cada valor posible.',
    count: 'Leímos {value}: la casilla {slot} sube a {count}.',
    prefix: 'Acumulamos: hay {total} elementos ≤ {value}, así que C[{v}] = {total}.',
    place: '{value} va a B[{pos}]; ir de derecha a izquierda mantiene el orden de los iguales.',
    'copy-back': 'Copiamos B de vuelta en A: el arreglo ya está ordenado.',
    done: '¡Ordenado!',
  },
  legend: {
    active: 'Leyendo A[i]',
    write: 'Escrito en B',
  },
};

export default content;
