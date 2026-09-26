import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['megadrive', 'rpg', 'modern'])
for (const [name, url] of [
  ['home', '/'],
  ['visualizer (bars)', '/sorting/heap-sort/'],
  ['visualizer (graph)', '/graph/dijkstra/'],
  ['compare', '/compare/'],
] as const) {
  test(`${theme}: ${name} has no WCAG A/AA violations`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('algo-visualizer:settings', JSON.stringify({ theme: t })), theme);
    await page.goto(url);
    await page.waitForTimeout(400);
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const summary = res.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(summary).toEqual([]);
  });
}
