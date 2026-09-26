import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Merge Sort',
  tagline: 'Split in half, sort each half, merge them',
  summary:
    'Top-down divide and conquer: it recursively halves the array until every piece has a single element, which is trivially sorted. Then it merges each pair of sorted halves by always taking the smaller of the two front elements, writing the result into an auxiliary buffer B and copying it back into A.',
  steps: [
    'A range with a single element is already sorted.',
    'Otherwise compute mid and recursively sort A[lo..mid] and A[mid+1..hi].',
    'Merge: compare A[i] with A[j] and copy the smaller into B (ties take the left one, so it is stable).',
    'When one half runs out, copy the rest of the other half into B.',
    'Copy B[lo..hi] back into A[lo..hi].',
  ],
  whenToUse:
    'When you need guaranteed O(n log n) and stability, or when sorting linked lists or external (on-disk) data. The price is O(n) extra memory; for in-memory arrays quicksort is usually faster.',
  references: [
    { title: 'Merge sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Merge_sort' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.2 Mergesort', url: 'https://algs4.cs.princeton.edu/22mergesort/' },
    { title: 'VisuAlgo — Sorting (interactive animation)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'An array of {n} elements. We keep halving it until every piece is trivial.',
    base: 'Range [{lo}] holds only {value}: a single element is already sorted.',
    split: 'Split [{lo}..{hi}] after {mid} so each half can be sorted on its own.',
    'merge-start': 'Merge the two sorted halves of [{lo}..{hi}], split after {mid}.',
    'compare-le': '{a} ≤ {b}: take {a} from the left (ties go left, keeping it stable).',
    'compare-gt': '{a} > {b}: {b} on the right is smaller, take it.',
    'write-aux': 'Copy {value} into B[{k}].',
    rest: 'One half is used up: copy {value} into B[{k}] without comparing.',
    'copy-back': 'Copy B[{lo}..{hi}] back into A: that range is now sorted.',
    done: 'Sorted!',
  },
  legend: {
    inactive: 'Already copied to B',
    write: 'Copied back',
  },
};

export default content;
