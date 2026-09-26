import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bucket Sort',
  tagline: 'Repartí en cubetas por rango, ordená cada una y juntalas',
  summary:
    'Divide el rango de valores [mín, máx] en k cubetas de igual ancho y reparte cada elemento en la suya. Como las cubetas están ordenadas entre sí, alcanza con ordenar cada una por separado (acá con insertion sort, que es rápido con pocos elementos) y concatenarlas en orden. Si los datos están bien repartidos, cada cubeta queda chica y el costo promedio se acerca a O(n + k).',
  steps: [
    'Buscá el mínimo y el máximo y creá k cubetas vacías que cubran ese rango.',
    'Poné cada x en la cubeta ⌊(x − mín) · k / (máx − mín + 1)⌋.',
    'Ordená cada cubeta con insertion sort.',
    'Concatená las cubetas de la primera a la última de vuelta en A.',
  ],
  whenToUse:
    'Cuando los valores están distribuidos de forma bastante uniforme en un rango conocido. Si se amontonan en pocas cubetas degenera en insertion sort, O(n²) en el peor caso, y necesita O(n + k) de memoria extra.',
  references: [
    { title: 'Ordenamiento por casilleros — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Ordenamiento_por_casilleros' },
    { title: 'Programiz — Bucket Sort', url: 'https://www.programiz.com/dsa/bucket-sort' },
  ],
  narration: {
    start: 'Arreglo de {n} elementos: lo vamos a repartir en {k} cubetas según su valor.',
    range: 'Valores entre {lo} y {hi}: partimos ese rango en {k} cubetas de igual ancho.',
    scatter: '{value} cae en la cubeta {bucket} según su posición dentro del rango.',
    'bucket-sort': 'Cubeta {bucket}: tiene {size} elementos, la ordenamos con insertion sort.',
    'bucket-trivial': 'Cubeta {bucket}: con {size} elementos ya está ordenada.',
    'compare-gt': '{a} > {key}: {a} tiene que correrse a la derecha.',
    'compare-le': '{a} ≤ {key}: encontramos el lugar de {key}.',
    shift: 'Corremos {value} un lugar a la derecha para hacerle espacio a la clave.',
    insert: 'Insertamos {value} en la posición {index} de la cubeta.',
    gather: 'Copiamos {value} de la cubeta {bucket} a A[{index}]: las cubetas ya van en orden.',
    done: '¡Ordenado!',
  },
  legend: {
    write: 'Colocado',
    key: 'Clave',
    compare: 'Comparado con la clave',
  },
  options: {
    buckets: 'Cubetas',
    'buckets.3': '3 cubetas',
    'buckets.5': '5 cubetas',
    'buckets.8': '8 cubetas',
  },
};

export default content;
