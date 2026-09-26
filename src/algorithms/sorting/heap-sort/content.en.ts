import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Heap Sort',
  tagline: 'Build a max-heap, then pull the root off again and again',
  summary:
    'It treats the array as a complete binary tree (children of i at 2i+1 and 2i+2) and turns it into a max-heap, where every parent is at least as large as its children. The largest value then sits at the root: swap it with the last heap element, shrink the heap by one and sift the new root down to restore the heap. It sorts in place, always in O(n log n).',
  steps: [
    'Build the heap bottom-up: sift down every node from ⌊n/2⌋−1 down to 0.',
    'Sifting down: compare a node with its children; if one is larger, swap with the larger child and repeat.',
    'Swap the root (the maximum) with the last heap element: it is now in its final place.',
    'Shrink the heap by one and sift the new root down; repeat until one element is left.',
  ],
  whenToUse:
    'When you need guaranteed O(n log n) with no extra memory, e.g. as the fallback inside introsort. In practice it is usually slower than quicksort due to poor cache locality, and it is not stable.',
  references: [
    { title: 'Heapsort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Heapsort' },
    { title: 'Sedgewick & Wayne, Algorithms, §2.4 Priority Queues', url: 'https://algs4.cs.princeton.edu/24pq/' },
    { title: 'VisuAlgo — Binary Heap', url: 'https://visualgo.net/en/heap' },
  ],
  narration: {
    start: 'An array of {n} elements: first we turn it into a max-heap.',
    heapify: 'Sift down node {i} ({value}) so its subtree satisfies the heap property.',
    'left-larger': 'Left child {child} is larger than parent {parent}: it is a candidate to move up.',
    'left-smaller': 'Left child {child} does not beat parent {parent}.',
    'right-larger': 'Right child {child} beats {best}: it is the largest of the three.',
    'right-smaller': 'Right child {child} does not beat {best}.',
    settle: '{value} is at least as large as its children: it has settled in the heap.',
    leaf: '{value} is a leaf: no children, nothing to sift.',
    'sift-swap': 'Swap {a} with its larger child {b} and keep sifting down.',
    'heap-built': 'Heap built: the maximum, {max}, is at the root.',
    extract: 'Move the maximum {max} to position {end}, its final place.',
    done: 'Sorted!',
  },
  legend: {
    active: 'Node sifting down',
    compare: 'Child compared',
    max: 'Larger child',
    sorted: 'Extracted (sorted)',
  },
};

export default content;
