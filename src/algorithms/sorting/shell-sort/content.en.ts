import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Shell Sort',
  tagline: 'Insertion sort with shrinking jumps',
  summary:
    'It runs several insertion-sort passes, but compares elements h positions apart. With large gaps, values far from home travel quickly; by the final pass, with h = 1, it is a plain insertion sort over an almost sorted array, which is cheap. We use Knuth\'s sequence: 1, 4, 13, 40…',
  steps: [
    'Pick the starting gap h from 1, 4, 13, 40… (the largest below n/3).',
    'For each i ≥ h, lift A[i] and shift the larger A[j − h] forward, jumping h at a time.',
    'After the pass the array is h-sorted: every element is ≤ the one h places later.',
    'Divide h by 3 and repeat; the last pass, with h = 1, is an ordinary insertion sort.',
  ],
  whenToUse:
    'When you need better than O(n²) without extra memory or recursion: embedded systems or mid-sized arrays. It is not stable; for large data prefer merge sort or quick sort.',
  references: [
    { title: 'Shellsort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Shellsort' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed., §2.1 (Shellsort)', url: 'https://algs4.cs.princeton.edu/21elementary/' },
    { title: 'VisuAlgo — Sorting', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: '{n} elements. The gaps will be: {gaps}.',
    gap: 'New pass with gap h = {h}: we compare elements {h} places apart.',
    pick: 'Lift {value} (position {i}) to insert it within its subsequence.',
    'compare-gt': '{a} > {key}: {a} moves {h} places forward.',
    'compare-le': '{a} ≤ {key}: found the key\'s place.',
    shift: 'Move {value} from position {from} to {to}.',
    insert: 'Insert {value} at position {index}.',
    'h-sorted': 'Done: the array is now {h}-sorted. Shrink the gap.',
    sorted: 'The h = 1 pass is over: the array is sorted.',
    done: 'Sorted!',
  },
  legend: { key: 'Lifted key', write: 'Shifted' },
};

export default content;
