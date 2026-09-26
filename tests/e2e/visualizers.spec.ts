import { expect, test } from '@playwright/test';

const IDS = [
  'bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'counting-sort', 'radix-sort', 'bucket-sort',
  'bfs', 'dfs', 'bidirectional-bfs', 'dijkstra', 'a-star', 'greedy-best-first', 'bellman-ford', 'floyd-warshall', 'backtracking-maze',
];

for (const id of IDS) {
  test(`${id}: runs end to end with the standard controls`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`/visualizer.html?algo=${id}`);
    const count = page.locator('.transport__count');
    await expect(count).toContainText(/1\/\d+/);
    const narration = page.locator('.narration__text');
    const first = await narration.textContent();

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(count).toContainText(/3\/\d+/);
    await page.keyboard.press('ArrowLeft');
    await expect(count).toContainText(/2\/\d+/);

    await page.keyboard.press('End');
    const total = (await count.textContent())!.match(/(\d+)\/(\d+)/)!;
    expect(total[1]).toBe(total[2]);
    await expect(narration).not.toHaveText(first ?? '');
    await expect(page.locator('.code__line.is-active, .code__line')).not.toHaveCount(0);

    await page.keyboard.press('Home');
    await expect(count).toContainText(/1\/\d+/);
    expect(errors).toEqual([]);
  });
}

test('language and theme switches rebuild the page', async ({ page }) => {
  await page.goto('/visualizer.html?algo=bfs');
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Búsqueda en anchura (BFS)');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Breadth-first search (BFS)');
  await page.locator('.app-bar .theme-select').selectOption('rpg');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'rpg');
  await page.locator('.app-bar .theme-select').selectOption('megadrive');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'megadrive');
});

test('help overlay opens with ? and closes with Escape', async ({ page }) => {
  await page.goto('/visualizer.html?algo=quick-sort');
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('options re-run the algorithm', async ({ page }) => {
  await page.goto('/visualizer.html?algo=quick-sort');
  const count = page.locator('.transport__count');
  const before = await count.textContent();
  await page.locator('.stage-toolbar select').selectOption('first');
  await expect(count).not.toHaveText(before!);
});

test('home lists every algorithm and opens one from the keyboard', async ({ page }) => {
  await page.goto('/');
  const carts = page.locator('.cart');
  await expect(carts).toHaveCount(IDS.length);
  await page.getByRole('button', { name: /START/ }).click();
  await expect(carts.first()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(carts.nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/sorting\/selection-sort\/$/);
  await expect(page.locator('.transport__count')).toContainText(/1\/\d+/);
});

test('home search filters and explains empty results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('floyd');
  await expect(page.locator('.cart:visible')).toHaveCount(1);
  await page.getByRole('searchbox').fill('zzz');
  await expect(page.locator('.empty')).toBeVisible();
});
