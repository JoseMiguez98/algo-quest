import type { AlgorithmDef, Category } from '../core/algorithm';
import bfs from './graph/bfs';
import bubbleSort from './sorting/bubble-sort';

/** Adding an algorithm = one folder + one line here. Order is the menu order. */
export const algorithms: AlgorithmDef<never>[] = [bubbleSort, bfs] as AlgorithmDef<never>[];

export const byId = (id: string): AlgorithmDef<never> | undefined => algorithms.find((a) => a.id === id);

export const byCategory = (c: Category): AlgorithmDef<never>[] => algorithms.filter((a) => a.category === c);
