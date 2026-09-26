import type { AlgorithmDef, Category } from '../core/algorithm';
import aStar from './graph/a-star';
import backtrackingMaze from './graph/backtracking-maze';
import bellmanFord from './graph/bellman-ford';
import bfs from './graph/bfs';
import bidirectionalBfs from './graph/bidirectional-bfs';
import dfs from './graph/dfs';
import dijkstra from './graph/dijkstra';
import floydWarshall from './graph/floyd-warshall';
import greedyBestFirst from './graph/greedy-best-first';
import bubbleSort from './sorting/bubble-sort';
import bucketSort from './sorting/bucket-sort';
import countingSort from './sorting/counting-sort';
import heapSort from './sorting/heap-sort';
import insertionSort from './sorting/insertion-sort';
import mergeSort from './sorting/merge-sort';
import quickSort from './sorting/quick-sort';
import radixSort from './sorting/radix-sort';
import selectionSort from './sorting/selection-sort';
import shellSort from './sorting/shell-sort';

/** Adding an algorithm = one folder + one line here. Order is the menu order (simple → advanced). */
export const algorithms = [
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  bucketSort,
  bfs,
  dfs,
  bidirectionalBfs,
  dijkstra,
  aStar,
  greedyBestFirst,
  bellmanFord,
  floydWarshall,
  backtrackingMaze,
] as AlgorithmDef<never>[];

export const byId = (id: string): AlgorithmDef<never> | undefined => algorithms.find((a) => a.id === id);

export const byCategory = (c: Category): AlgorithmDef<never>[] => algorithms.filter((a) => a.category === c);
