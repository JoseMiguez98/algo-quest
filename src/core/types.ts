export type Primitive = number | string | boolean | null;

export interface Narration {
  key: string;
  params?: Record<string, Primitive>;
}

export interface Step<S> {
  /** Semantic event name; drives sound cues and the legend, never colors directly. */
  event: string;
  /** Id of the active pseudocode line, or null when no line applies. */
  line: string | null;
  /** Immutable snapshot of everything the scene needs to render this step. */
  state: S;
  vars: Record<string, Primitive>;
  counters: Record<string, number>;
  narration: Narration;
  phase?: string;
  /** 0..1 pitch hint for sound packs. */
  tone?: number;
}

export interface PseudoLine {
  id: string;
  indent: number;
  text: string;
}

export type Pseudocode = readonly PseudoLine[];
