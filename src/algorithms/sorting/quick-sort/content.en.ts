import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Quick Sort',
  tagline: 'Pick a pivot, split smaller from larger, repeat',
  summary:
    'Divide and conquer with Lomuto partitioning: it picks a pivot, moves it to A[hi] and scans the range, gathering everything ≤ pivot on the left. It then drops the pivot right after that region, into its final position, and recursively sorts each side. The pivot choice decides whether it is fast or quadratic.',
  steps: [
    'Choose the pivot by the selected strategy and move it to A[hi] (by default it already is A[hi]).',
    'Scan j from lo to hi − 1: if A[j] ≤ pivot, advance the boundary i and swap A[i] with A[j].',
    'Swap A[i+1] with A[hi]: the pivot lands in its final position p.',
    'Recursively sort A[lo..p−1] and A[p+1..hi]; single-element ranges are already done.',
  ],
  whenToUse:
    'The most widely used general-purpose sort: in-place and very fast on average, O(n log n). It is not stable and its worst case is O(n²) (fixed pivot on sorted input); median-of-three or a random pivot avoids that almost always.',
  references: [
    { title: 'Quicksort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Quicksort' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.3 Quicksort', url: 'https://algs4.cs.princeton.edu/23quicksort/' },
    { title: 'VisuAlgo — Sorting (interactive animation)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'An array of {n} elements. Every partition puts one pivot in its final place.',
    base: 'Range [{lo}] holds only {value}: it is already in place.',
    'move-pivot': 'Move the pivot {value} from position {from} to the end of the range.',
    pivot: 'Partition [{lo}..{hi}] around pivot {pivot}: values ≤ {pivot} go to the left.',
    'compare-le': '{a} ≤ {pivot}: it belongs in the left region, advance the boundary.',
    'compare-gt': '{a} > {pivot}: it stays on the right, move on.',
    swap: 'Swap: {b} joins the ≤ pivot region and {a} moves to the right.',
    grow: 'Already at the boundary: the ≤ pivot region grows to position {i}.',
    place: 'Put the pivot {pivot} at position {p}: it stays there for good.',
    done: 'Sorted!',
  },
  legend: {
    pivot: 'Pivot',
    active: 'Boundary i (≤ pivot)',
  },
  options: {
    pivot: 'Pivot',
    'pivot.last': 'Last',
    'pivot.first': 'First',
    'pivot.median3': 'Median of three',
    'pivot.random': 'Random',
  },
};

export default content;
