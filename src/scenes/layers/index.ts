import type { BarsLayer } from '../bars';
import { auxRow } from './aux-row';
import { buckets } from './buckets';
import { counts } from './counts';
import { heapTree } from './heap-tree';
import { liftedKey } from './lifted-key';
import { partition } from './partition';

/** Bars-scene layers addressable by the ids algorithms list in `layers`. */
export const BAR_LAYERS: Record<string, BarsLayer> = {
  'lifted-key': liftedKey,
  'aux-row': auxRow,
  partition,
  'heap-tree': heapTree,
  counts,
  buckets,
};
