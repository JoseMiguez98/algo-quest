import type { GraphInput } from '../algorithms/graph/types';
import type { Step } from '../core/types';
import { t } from '../i18n';
import type { StructureView } from './panels/stats-panel';

type Extra = Record<string, unknown>;
const extra = (s: Step<unknown>) => (s.state as { extra: Extra }).extra;

/** Data-structure views keyed by the layer names algorithms declare. */
export function structureViews(layers: readonly string[], input: unknown): StructureView[] {
  const g = (input as GraphInput | undefined)?.graph;
  const label = (i: number) => g?.nodes[i]?.label ?? String(i);
  const views: Record<string, StructureView> = {
    queue: { title: t('structure.queue'), kind: 'queue', items: (s) => ((extra(s).queue as number[]) ?? []).map(label) },
    stack: { title: t('structure.stack'), kind: 'stack', items: (s) => ((extra(s).stack as number[]) ?? []).map(label) },
    pq: {
      title: t('structure.pq'),
      kind: 'queue',
      items: (s) => ((extra(s).open as { node: number; priority: number; stale: boolean }[]) ?? []).map((e) => `${label(e.node)}:${e.priority}${e.stale ? '×' : ''}`),
    },
  };
  return layers.flatMap((l) => (views[l] ? [views[l]] : []));
}
