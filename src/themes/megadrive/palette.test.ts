import { describe, expect, it } from 'vitest';
import { isMegaDriveColor } from './palette';
import { mdTokens } from './tokens';

describe('Mega Drive theme palette', () => {
  it.each([...Object.entries(mdTokens.color), ...Object.entries(mdTokens.state)])('%s = %s is a real 9-bit VDP color', (_, hex) => {
    expect(isMegaDriveColor(hex)).toBe(true);
  });
});
