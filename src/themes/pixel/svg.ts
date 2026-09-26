export const svgUrl = (w: number, h: number, body: string): string =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`)}")`;

export const px = (x: number, y: number, c: string, w = 1, h = 1): string => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;

/** Sprite from rows of characters mapped to colors ('.' is transparent). */
export function sprite(rows: string[], colors: Record<string, string>): string {
  const body = rows.flatMap((row, y) => [...row].flatMap((ch, x) => (colors[ch] ? [px(x, y, colors[ch]!)] : []))).join('');
  return svgUrl(rows[0]!.length, rows.length, body);
}
