import type { AlgorithmDef } from './algorithm';

const base = (): string => import.meta.env.BASE_URL;

export const homeUrl = (): string => base();

export const algorithmUrl = (def: Pick<AlgorithmDef<never>, 'id' | 'category'>): string => `${base()}${def.category}/${def.id}/`;

export function algorithmIdFromLocation(fallback: string): string {
  const q = new URLSearchParams(location.search).get('algo');
  if (q) return q;
  return location.pathname.split('/').filter(Boolean).at(-1) ?? fallback;
}
