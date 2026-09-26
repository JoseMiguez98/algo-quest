/**
 * 12×12 pixel frame with notched corners, as a 9-slice border-image source.
 * `light`/`shade` give the top-left / bottom-right bevel used by 16-bit menus.
 */
export function pixelFrame(border: string, fill: string, o: { light?: string; shade?: string; outline?: string } = {}): string {
  const px: string[] = [];
  const on = (x: number, y: number, c: string) => px.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`);
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      const edge = Math.min(x, y, 11 - x, 11 - y);
      const corner = Math.min(x, 11 - x) + Math.min(y, 11 - y);
      if (corner < 2) continue;
      if (o.outline && (edge === 0 || corner === 2)) { on(x, y, o.outline); continue; }
      const ring = o.outline ? 1 : 0;
      if (edge === ring || (!o.outline && corner === 2) || (o.outline && corner === 3)) { on(x, y, border); continue; }
      if (edge === ring + 1 && (o.light || o.shade)) {
        const topLeft = x === ring + 1 || y === ring + 1;
        on(x, y, topLeft ? (o.light ?? fill) : (o.shade ?? fill));
        continue;
      }
      on(x, y, fill);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" shape-rendering="crispEdges">${px.join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
