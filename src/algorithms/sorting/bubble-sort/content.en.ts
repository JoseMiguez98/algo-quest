import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bubble Sort',
  tagline: 'Compare neighbours and swap until nothing moves',
  summary:
    'It walks the array comparing each pair of neighbours and swaps them when they are out of order. After each pass the largest remaining element has "bubbled" to the end. If a whole pass makes no swaps, the array is already sorted and the algorithm stops early.',
  steps: [
    'Compare A[j] with A[j+1]; if the left one is larger, swap them.',
    'At the end of a pass, the largest remaining element is in its final position.',
    'The next pass scans one element fewer.',
    'If a pass makes no swaps, the array is sorted: stop.',
  ],
  whenToUse:
    'Almost never in production: it is O(n²). It is great for learning loop invariants and acceptable for tiny or nearly sorted lists, where the early exit makes it linear.',
  references: [
    { title: 'Bubble sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bubble_sort' },
    { title: 'Knuth, The Art of Computer Programming, Vol. 3, §5.2.2', url: 'https://www-cs-faculty.stanford.edu/~knuth/taocp.html' },
    { title: 'VisuAlgo — Sorting', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'An array of {n} elements. Each pass carries the largest remaining one to the end.',
    pass: 'Pass {pass}: we scan up to position {end}.',
    'compare-gt': '{a} > {b}: out of order, they must be swapped.',
    'compare-le': '{a} ≤ {b}: already in order, move on.',
    swap: 'Swap {a} and {b}.',
    lock: '{value} reached its final place (position {index}).',
    'early-exit': 'This pass made no swaps: the array is already sorted.',
    done: 'Sorted!',
  },
};

export default content;
