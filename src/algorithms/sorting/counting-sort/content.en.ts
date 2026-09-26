import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Counting Sort',
  tagline: 'Count how often each value appears and place them without comparing',
  summary:
    'It never compares elements: it counts how many times each value appears in an array C indexed by value − minimum (so negatives work). Then it accumulates the counts so C[v] says how many elements are ≤ v, which is exactly where the last of them belongs. Scanning A right to left, it places each element into an output array B, keeping equal values in their original order. It runs in O(n + k), where k is the value range.',
  steps: [
    'Find the minimum lo and the maximum; create C with k + 1 zeros, where k = max − lo.',
    'Scan A and add 1 to C[A[i] − lo] for each element.',
    'Accumulate: C[v] += C[v − 1], so C[v] counts how many elements are ≤ v.',
    'Scan A right to left: decrement C[A[i] − lo] and write A[i] into B at that position.',
    'Copy B back into A.',
  ],
  whenToUse:
    'Ideal for integers whose range is small relative to n (ages, grades, bytes). With a huge range, the O(k) memory and time make it impractical. Being stable, it is the building block of radix sort.',
  references: [
    { title: 'Counting sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Counting_sort' },
    { title: 'VisuAlgo — Sorting (Counting Sort)', url: 'https://visualgo.net/en/sorting' },
    { title: 'Programiz — Counting Sort', url: 'https://www.programiz.com/dsa/counting-sort' },
  ],
  narration: {
    start: 'An array of {n} elements: we will sort it by counting, not comparing.',
    range: 'Values range from {lo} to {hi}: value v goes in slot v − {lo}, from 0 to {k}.',
    init: 'Create C with {size} zeroed slots, one per possible value.',
    count: 'Read {value}: slot {slot} goes up to {count}.',
    prefix: 'Accumulate: {total} elements are ≤ {value}, so C[{v}] = {total}.',
    place: '{value} goes to B[{pos}]; scanning right to left keeps equal values in order.',
    'copy-back': 'Copy B back into A: the array is now sorted.',
    done: 'Sorted!',
  },
  legend: {
    active: 'Reading A[i]',
    write: 'Written to B',
  },
};

export default content;
