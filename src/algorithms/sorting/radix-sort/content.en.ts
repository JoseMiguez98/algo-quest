import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Radix Sort (LSD)',
  tagline: 'Sort digit by digit, from least to most significant',
  summary:
    'It sorts non-negative integers one digit at a time in the chosen base, starting from the ones place. Each pass runs a stable counting sort on that digit. Because each pass is stable, elements sharing a digit keep the order earlier passes gave them, so after the last pass (the top digit of the maximum) the array is sorted. It runs in O(d · (n + b)) for d digits in base b.',
  steps: [
    'Count the digits of the maximum in base b: that is the number of passes.',
    'In each pass, count how many elements have each digit (0 to b − 1) at the current position.',
    'Accumulate the counts to know where each digit group ends.',
    'Scan A right to left and place each element into B by its digit: this keeps it stable.',
    'Copy B into A and move on to the next digit (exp × b).',
  ],
  whenToUse:
    'Good for many integers or fixed-length keys (IDs, IPs, dates) when d is small: it can beat comparison sorts. This version only accepts non-negative integers and needs O(n + b) extra memory.',
  references: [
    { title: 'Radix sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Radix_sort' },
    { title: 'Sedgewick & Wayne, Algorithms, §5.1 String Sorts (LSD)', url: 'https://algs4.cs.princeton.edu/51radix/' },
    { title: 'VisuAlgo — Sorting (Radix Sort)', url: 'https://visualgo.net/en/sorting' },
  ],
  narration: {
    start: '{n} elements in base {base}: the max {max} has {passes} digits, so we make {passes} passes.',
    pass: 'Pass {pass} of {passes}: sort by the digit worth {exp}.',
    count: '{value} has digit {digit} here: add one to C[{digit}].',
    prefix: 'Accumulate: {total} elements have a digit ≤ {digit}.',
    place: '{value} (digit {digit}) goes to B[{pos}]; right to left keeps it stable.',
    'copy-back': 'Pass {pass} done: A is now sorted by every digit up to the one worth {exp}.',
    done: 'Sorted!',
  },
  legend: {
    active: 'Reading A[i]',
  },
  options: {
    base: 'Base',
    'base.2': 'Binary (2)',
    'base.4': 'Base 4',
    'base.10': 'Decimal (10)',
    'base.16': 'Hexadecimal (16)',
  },
};

export default content;
