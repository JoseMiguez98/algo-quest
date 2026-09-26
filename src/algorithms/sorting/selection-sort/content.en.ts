import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Selection Sort',
  tagline: 'Find the smallest remaining element and put it in front',
  summary:
    'It splits the array into a sorted part on the left and an unsorted part on the right. Each pass scans the whole unsorted part to find its minimum and swaps it with the first unsorted element. It always makes the same number of comparisons, but at most n − 1 swaps.',
  steps: [
    'Take i as the candidate minimum of A[i..n−1].',
    'Compare each A[j] with the current minimum; if A[j] is smaller, it becomes the new minimum.',
    'At the end of the pass, swap A[i] with the minimum (unless it is already there).',
    'A[i] is now final; repeat with i + 1.',
  ],
  whenToUse:
    'When writes are expensive and comparisons are cheap: it does at most n − 1 swaps. Otherwise it is always O(n²), even on sorted input, and it is not stable. Insertion sort usually beats it in practice.',
  references: [
    { title: 'Selection sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Selection_sort' },
    { title: 'Sedgewick & Wayne, Algorithms 4th ed. — §2.1 Elementary Sorts', url: 'https://algs4.cs.princeton.edu/21elementary/' },
    { title: 'VisuAlgo — Sorting (interactive animation)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: 'An array of {n} elements. Each pass finds the smallest remaining value and moves it to the front.',
    pass: 'Pass {pass}: find the minimum from position {i}; start by assuming it is A[{i}].',
    'compare-lt': '{a} < {b}: found a value smaller than the current minimum.',
    'compare-ge': '{a} ≥ {b}: not smaller than the current minimum, move on.',
    'new-min': 'New minimum: {value} at position {index}.',
    swap: 'Swap {a} with the minimum {b} to bring it to the front.',
    'no-swap': '{value} was already the minimum and in place: no swap needed.',
    lock: '{value} is in its final position ({index}).',
    done: 'Sorted!',
  },
  legend: {
    min: 'Current minimum',
  },
};

export default content;
