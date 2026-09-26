import type { SoundPack } from '../core/sound';

/** Semantic visual states shared by every scene. Themes decide what each looks like. */
export type VisualState =
  | 'default'
  | 'compare'
  | 'swap'
  | 'write'
  | 'pivot'
  | 'min'
  | 'max'
  | 'key'
  | 'sorted'
  | 'inactive'
  | 'active'
  | 'frontier'
  | 'current'
  | 'visited'
  | 'path'
  | 'dead'
  | 'frontier-b'
  | 'visited-b'
  | 'meet'
  | 'focus'
  | 'tree'
  | 'tree-b'
  | 'rejected'
  | 'relaxed'
  | 'cycle';

export type TextTone = 'normal' | 'muted' | 'accent' | 'inverse';

export interface ThemeTokens {
  /** Every value becomes a CSS custom property: --color-<key>. */
  color: Record<string, string>;
  state: Record<VisualState, string>;
  font: { display: string; body: string };
  fontUrls: string[];
}

export interface TextOptions {
  align?: 'left' | 'center' | 'right';
  tone?: TextTone;
  color?: string;
  scale?: number;
}

/**
 * Drawing primitives in logical stage pixels. Scenes describe *what* to draw
 * (a bar in state "compare"); the theme's renderer decides *how* it looks.
 */
export interface StageRenderer {
  readonly lineHeight: number;
  /** Clears and prepares a frame of the given logical size. */
  begin(width: number, height: number): void;
  /** Copies the frame to the visible canvas. */
  present(target: HTMLCanvasElement): void;
  color(state: VisualState): string;
  rect(x: number, y: number, w: number, h: number, color: string): void;
  line(x1: number, y1: number, x2: number, y2: number, color: string, dashed?: boolean): void;
  text(s: string, x: number, y: number, o?: TextOptions): void;
  measure(s: string, scale?: number): number;
  bar(x: number, y: number, w: number, h: number, state: VisualState, o?: { ghost?: boolean }): void;
  slot(x: number, y: number, w: number, h: number, o?: { active?: boolean }): void;
  node(cx: number, cy: number, r: number, state: VisualState, label: string, o?: { ring?: 'start' | 'target' | null }): void;
  edge(x1: number, y1: number, x2: number, y2: number, state: VisualState, o?: { directed?: boolean; trim?: number; weight?: string; bend?: number }): void;
  cell(x: number, y: number, size: number, state: VisualState | 'wall' | 'open', label?: string): void;
  pointer(x: number, y: number, label: string, o?: { up?: boolean; state?: VisualState }): void;
  panel(x: number, y: number, w: number, h: number, title?: string): void;
  tag(x: number, y: number, s: string, state: VisualState, o?: { align?: 'left' | 'center' | 'right' }): void;
}

export interface Theme {
  id: string;
  name: string;
  tokens: ThemeTokens;
  /** Component stylesheet (CSS text). */
  css: string;
  /** Optional border-image sources exposed as --frame-<key>. */
  frames?: Record<string, string>;
  createRenderer(): StageRenderer;
  sounds: SoundPack;
}
