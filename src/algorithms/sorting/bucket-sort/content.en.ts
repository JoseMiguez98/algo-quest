import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Bucket Sort',
  tagline: 'Scatter into range buckets, sort each one, then gather',
  summary:
    'It splits the value range [min, max] into k equal-width buckets and drops each element into its bucket. Since the buckets are already ordered relative to each other, it is enough to sort each one on its own (here with insertion sort, which is fast on few elements) and concatenate them in order. With evenly spread data each bucket stays small and the average cost approaches O(n + k).',
  steps: [
    'Find the minimum and maximum and create k empty buckets covering that range.',
    'Put each x into bucket ⌊(x − min) · k / (max − min + 1)⌋.',
    'Sort every bucket with insertion sort.',
    'Concatenate the buckets, first to last, back into A.',
  ],
  whenToUse:
    'When values are fairly uniformly spread over a known range. If they pile up in a few buckets it degrades to insertion sort, O(n²) in the worst case, and it needs O(n + k) extra memory.',
  references: [
    { title: 'Bucket sort — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bucket_sort' },
    { title: 'Programiz — Bucket Sort', url: 'https://www.programiz.com/dsa/bucket-sort' },
  ],
  narration: {
    start: 'An array of {n} elements: we will scatter it into {k} buckets by value.',
    range: 'Values range from {lo} to {hi}: we split that range into {k} equal-width buckets.',
    scatter: '{value} lands in bucket {bucket} based on where it sits in the range.',
    'bucket-sort': 'Bucket {bucket} holds {size} elements: sort it with insertion sort.',
    'bucket-trivial': 'Bucket {bucket} holds {size} elements: already sorted.',
    'compare-gt': '{a} > {key}: {a} must shift right.',
    'compare-le': '{a} ≤ {key}: found the spot for {key}.',
    shift: 'Shift {value} one place right to make room for the key.',
    insert: 'Insert {value} at position {index} of the bucket.',
    gather: 'Copy {value} from bucket {bucket} to A[{index}]: buckets are already in order.',
    done: 'Sorted!',
  },
  legend: {
    write: 'Placed',
    key: 'Key',
    compare: 'Compared with key',
  },
  options: {
    buckets: 'Buckets',
    'buckets.3': '3 buckets',
    'buckets.5': '5 buckets',
    'buckets.8': '8 buckets',
  },
};

export default content;
