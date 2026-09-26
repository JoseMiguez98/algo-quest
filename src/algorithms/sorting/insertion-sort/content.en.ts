import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Insertion Sort',
  tagline: 'Lift each element and slide it into place',
  summary:
    'It keeps the prefix A[0..i−1] sorted. Each step lifts A[i] as the key, shifts every larger element of the prefix one slot to the right, and drops the key into the gap left behind. It is how you sort a hand of cards: fast when they are already nearly in order.',
  steps: [
    'Lift the key ← A[i]; its slot becomes free.',
    'Compare key with A[j], moving right to left through the sorted prefix.',
    'While A[j] > key, shift A[j] one slot to the right (no swaps).',
    'When A[j] ≤ key or you reach the start, put key into A[j+1].',
  ],
  whenToUse:
    'Great for small or nearly sorted arrays: stable, in-place and O(n) in the best case. That is why hybrid sorts (Timsort, introsort) use it for short runs. On large shuffled data it is O(n²).',
  references: [
    { title: 'Insertion sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Insertion_sort' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.1 Elementary Sorts', url: 'https://algs4.cs.princeton.edu/21elementary/' },
    { title: 'VisuAlgo — Sorting (interactive animation)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'An array of {n} elements. The first one alone is already a sorted prefix.',
    pick: 'Lift {value} (position {i}) to insert it into the sorted prefix.',
    'compare-gt': '{a} > {key}: {a} belongs after the key, so shift it right.',
    'compare-le': '{a} ≤ {key}: found the spot, the key goes right after it.',
    shift: 'Shift {value} from position {from} to {to} to open a gap.',
    boundary: 'Reached the start: the key is the smallest in the prefix.',
    insert: 'Place {value} at position {index}; the prefix stays sorted.',
    done: 'Sorted!',
  },
  legend: {
    key: 'Lifted key',
    write: 'Shifted',
  },
};

export default content;
