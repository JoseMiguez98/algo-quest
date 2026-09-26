/** The Mega Drive VDP stores 3 bits per channel: these are the only 8 levels it can output. */
export const LEVELS = [0x00, 0x24, 0x48, 0x6c, 0x90, 0xb4, 0xd8, 0xfc] as const;

export const isMegaDriveColor = (hex: string): boolean => {
  const n = parseInt(hex.slice(1), 16);
  return [16, 8, 0].every((sh) => (LEVELS as readonly number[]).includes((n >> sh) & 255));
};
