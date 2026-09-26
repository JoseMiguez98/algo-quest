import type { Theme } from '../contract';
import { pixelFrame } from '../pixel/frame';
import { PixelRenderer } from '../pixel/renderer';
import { gem, mountains, starField } from './decor';
import { megaDriveMusic } from './music';
import { megaDriveSounds } from './sound-pack';
import { mdStageStyle } from './stage-style';
import css from './style.css?inline';
import { mdTokens } from './tokens';

const c = mdTokens.color;

export const megaDriveTheme: Theme = {
  id: 'megadrive',
  name: 'Mega Drive',
  tokens: mdTokens,
  css,
  frames: {
    window: pixelFrame(c.border!, 'rgba(0,0,72,0.92)', { outline: c.outline!, light: c['border-light']!, shade: c['border-shade']! }),
    dark: pixelFrame(c.muted!, c['bg-deep']!, { outline: c.outline!, light: c.text!, shade: c.dim! }),
    button: pixelFrame(c.muted!, '#242448', { outline: c.outline!, light: '#6C6C90', shade: '#000024' }),
    primary: pixelFrame(c['accent-shade']!, c.accent!, { outline: c.outline!, light: '#FCFC90', shade: c['accent-shade']! }),
    face: pixelFrame('#900000', c.danger!, { outline: c.outline!, light: '#FC9090', shade: '#900000' }),
    'stars-a': starField(3, 26),
    'stars-b': starField(9, 18),
    'mountains-far': mountains(5, c['mountain-far']!, 90, 60),
    mountains: mountains(8, c.mountain!, 60, 36),
    thumb: gem,
  },
  createRenderer: () => new PixelRenderer(mdTokens, mdStageStyle),
  sounds: { ...megaDriveSounds, music: () => megaDriveMusic() },
};
