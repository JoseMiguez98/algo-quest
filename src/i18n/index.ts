import { interpolate } from '../core/algorithm';
import { settings, type Lang } from '../core/settings';
import type { Primitive } from '../core/types';
import en from './en';
import es from './es';

export type UiKey = keyof typeof es;

const tables: Record<Lang, Record<UiKey, string>> = { es, en };

export function t(key: UiKey, params?: Record<string, Primitive>): string {
  return interpolate(tables[settings.get().lang][key] ?? key, params);
}

export function has(key: string): key is UiKey {
  return key in es;
}

export const lang = (): Lang => settings.get().lang;
