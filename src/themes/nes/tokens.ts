import type { ThemeTokens } from '../contract';

/** Colors picked from the NES 2C02 PPU palette (hex index in comments). */
export const nesTokens: ThemeTokens = {
  color: {
    bg: '#000000', // $0F
    window: '#0000BC', // $02 — classic RPG menu window
    'window-deep': '#00008C',
    border: '#FCFCFC', // $30
    text: '#FCFCFC',
    muted: '#BCBCBC', // $10
    dim: '#787878', // $2D
    accent: '#F8B800', // $28 — cursor / focus
    info: '#3CBCFC', // $21
    success: '#58D854', // $2A
    danger: '#F83800', // $16
    brick: '#E45C10', // $17
    stage: '#000000',
    'on-accent': '#000000',
  },
  state: {
    default: '#6888FC', // $22
    compare: '#F8B800', // $28
    swap: '#F83800', // $16
    write: '#00E8D8', // $2C
    pivot: '#D800CC', // $14
    min: '#F878F8', // $24
    max: '#F878F8',
    key: '#FCA044', // $27
    sorted: '#58D854', // $2A
    inactive: '#787878', // $2D
    active: '#FCFCFC', // $30
    frontier: '#F8B800',
    current: '#F83800',
    visited: '#3CBCFC', // $21
    path: '#58D854',
    dead: '#787878',
    'frontier-b': '#F878F8',
    'visited-b': '#D800CC',
    meet: '#FCFCFC',
    focus: '#FCA044',
    tree: '#3CBCFC',
    'tree-b': '#F878F8',
    rejected: '#A81000', // $06
    relaxed: '#F8B800',
    cycle: '#F83800',
  },
  font: {
    display: "'Press Start 2P', monospace",
    body: "'Pixelify Sans', system-ui, sans-serif",
  },
  fontUrls: ['https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Press+Start+2P&display=swap'],
};
