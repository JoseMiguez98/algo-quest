import type { Step } from '../core/types';
import type { Stage } from '../scenes/stage';

/** A playground editor owns its tool row and pointer handling; the page owns playback. */
export interface Editor {
  tools: HTMLElement;
  /** Current (edited) input. */
  value(): unknown;
  /** Lets the editor overlay selection marks on the preview step. */
  decorate(step: Step<unknown>): Step<unknown>;
  attach(stage: Stage): void;
  detach(): void;
}

export interface EditorHost {
  /** Called after every change; the page re-renders the preview. */
  changed(): void;
  /** Called when the scene must be rebuilt because the input structure changed. */
  rebuilt(): void;
}
