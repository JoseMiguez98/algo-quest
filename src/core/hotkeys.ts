export type Action =
  | 'toggle'
  | 'forward'
  | 'back'
  | 'reset'
  | 'shuffle'
  | 'faster'
  | 'slower'
  | 'mute'
  | 'code'
  | 'info'
  | 'edit'
  | 'help'
  | 'close'
  | 'start'
  | 'end';

export interface Binding {
  action: Action;
  keys: string[];
  /** What the help overlay shows, e.g. "Space". */
  display: string;
}

/** The single source of truth for keyboard shortcuts across every page. */
export const BINDINGS: readonly Binding[] = [
  { action: 'toggle', keys: [' ', 'k'], display: 'Space' },
  { action: 'forward', keys: ['ArrowRight', 'l'], display: '→' },
  { action: 'back', keys: ['ArrowLeft', 'j'], display: '←' },
  { action: 'start', keys: ['Home'], display: 'Home' },
  { action: 'end', keys: ['End'], display: 'End' },
  { action: 'reset', keys: ['r'], display: 'R' },
  { action: 'shuffle', keys: ['n'], display: 'N' },
  { action: 'faster', keys: ['+', '=', 'ArrowUp'], display: '+ / ↑' },
  { action: 'slower', keys: ['-', '_', 'ArrowDown'], display: '− / ↓' },
  { action: 'mute', keys: ['m'], display: 'M' },
  { action: 'code', keys: ['c'], display: 'C' },
  { action: 'info', keys: ['i'], display: 'I' },
  { action: 'edit', keys: ['e'], display: 'E' },
  { action: 'help', keys: ['?'], display: '?' },
  { action: 'close', keys: ['Escape'], display: 'Esc' },
];

const isTyping = (t: EventTarget | null): boolean =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export function bindHotkeys(handlers: Partial<Record<Action, () => void>>, target: Window = window): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const binding = BINDINGS.find((b) => b.keys.includes(key));
    const fn = binding && handlers[binding.action];
    if (!fn) return;
    if (key === ' ' && e.target instanceof HTMLButtonElement) return;
    if (key.startsWith('Arrow') && e.target instanceof HTMLInputElement) return;
    e.preventDefault();
    fn();
  };
  target.addEventListener('keydown', onKey);
  return () => target.removeEventListener('keydown', onKey);
}
