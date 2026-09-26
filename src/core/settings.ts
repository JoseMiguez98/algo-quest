import { Emitter } from './emitter';
import type { Speed } from './player';

export type Lang = 'es' | 'en';

export interface Settings {
  lang: Lang;
  theme: string;
  volume: number;
  muted: boolean;
  speed: Speed;
  panel: 'code' | 'info' | 'stats';
  scanlines: boolean;
}

const KEY = 'algo-visualizer:settings';

const defaults = (): Settings => ({
  lang: typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en',
  theme: 'nes',
  volume: 0.6,
  muted: false,
  speed: 1,
  panel: 'code',
  scanlines: true,
});

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return { ...defaults(), ...(raw ? (JSON.parse(raw) as Partial<Settings>) : {}) };
  } catch {
    return defaults();
  }
}

class SettingsStore extends Emitter<{ change: Settings; [k: string]: unknown }> {
  private value = load();

  get(): Readonly<Settings> {
    return this.value;
  }

  set(patch: Partial<Settings>): void {
    this.value = { ...this.value, ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(this.value));
    } catch {
      /* storage unavailable: keep in memory */
    }
    this.emit('change', this.value);
  }
}

export const settings = new SettingsStore();
