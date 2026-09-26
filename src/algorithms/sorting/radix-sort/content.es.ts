import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Radix Sort (LSD)',
  tagline: 'Ordená dígito por dígito, del menos al más significativo',
  summary:
    'Ordena enteros no negativos mirando un dígito por vez en la base elegida, empezando por las unidades. En cada pasada aplica un counting sort estable sobre ese dígito. Como la pasada es estable, los elementos con el mismo dígito conservan el orden que dejaron las pasadas anteriores, así que después de la última (el dígito más significativo del máximo) el arreglo queda ordenado. Tarda O(d · (n + b)), con d dígitos en base b.',
  steps: [
    'Calculá cuántos dígitos tiene el máximo en base b: esa es la cantidad de pasadas.',
    'En cada pasada, contá cuántos elementos tienen cada dígito (0 a b − 1) en la posición actual.',
    'Acumulá los conteos para saber dónde termina el grupo de cada dígito.',
    'Recorré A de derecha a izquierda y ubicá cada elemento en B según su dígito: es estable.',
    'Copiá B en A y pasá al siguiente dígito (exp × b).',
  ],
  whenToUse:
    'Bueno para muchos enteros o claves de largo fijo (IDs, IPs, fechas) cuando d es chico: puede ganarle a los métodos por comparación. Esta versión solo acepta enteros no negativos y usa O(n + b) de memoria extra.',
  references: [
    { title: 'Ordenamiento Radix — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_Radix' },
    { title: 'Sedgewick & Wayne, Algorithms, §5.1 String Sorts (LSD)', url: 'https://algs4.cs.princeton.edu/51radix/' },
    { title: 'VisuAlgo — Sorting (Radix Sort)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: '{n} elementos en base {base}: el máximo {max} tiene {passes} dígitos, así que haremos {passes} pasadas.',
    pass: 'Pasada {pass} de {passes}: ordenamos por el dígito de peso {exp}.',
    count: '{value} tiene {digit} en este dígito: sumamos uno a C[{digit}].',
    prefix: 'Acumulamos: {total} elementos tienen dígito ≤ {digit}.',
    place: '{value} (dígito {digit}) va a B[{pos}]; de derecha a izquierda para que sea estable.',
    'copy-back': 'Pasada {pass} lista: A queda ordenado por los dígitos hasta el de peso {exp}.',
    done: '¡Ordenado!',
  },
  legend: {
    active: 'Leyendo A[i]',
  },
  options: {
    base: 'Base',
    'base.2': 'Binaria (2)',
    'base.4': 'Base 4',
    'base.10': 'Decimal (10)',
    'base.16': 'Hexadecimal (16)',
  },
};

export default content;
