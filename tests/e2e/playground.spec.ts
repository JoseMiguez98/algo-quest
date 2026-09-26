import { expect, test, type Page } from '@playwright/test';

async function canvasPoint(page: Page, fx: number, fy: number) {
  const box = (await page.locator('.stage-canvas').boundingBox())!;
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

test('array editor: drag a bar, validate typed values, share state through the URL', async ({ page }) => {
  await page.goto('/visualizer.html?algo=bubble-sort');
  await page.keyboard.press('e');
  const values = page.getByRole('textbox', { name: /Valores|Values/ });
  await expect(values).toBeVisible();
  const before = await values.inputValue();

  const bar = await canvasPoint(page, 0.2, 0.5);
  await page.mouse.move(bar.x, bar.y);
  await page.mouse.down();
  await page.mouse.move(bar.x, bar.y - 80, { steps: 5 });
  await page.mouse.up();
  await expect(values).not.toHaveValue(before);

  await values.fill('3, 99, 1');
  await values.press('Enter');
  await expect(page.locator('.edit-error')).toBeVisible();

  await values.fill('4, 3, 2, 1');
  await values.press('Enter');
  await page.getByRole('button', { name: /Listo|Done/ }).click();
  await expect(page).toHaveURL(/d=4%2C3%2C2%2C1|d=4,3,2,1/);
  await page.keyboard.press('End');
  await expect(page.locator('.transport__count')).toContainText(/\d+\/\d+/);

  await page.reload();
  await expect(page.locator('.transport__count')).toContainText(/1\/\d+/);
  await page.keyboard.press('e');
  await expect(values).toHaveValue('4, 3, 2, 1');
});

test('graph editor: generate a maze for Dijkstra and run it', async ({ page }) => {
  await page.goto('/visualizer.html?algo=dijkstra');
  await page.keyboard.press('e');
  await page.getByRole('combobox', { name: /Generador|Generator/ }).selectOption('maze');
  await page.getByRole('button', { name: /Generar|Generate/ }).click();
  await expect(page.getByRole('radio', { name: /Muro|Wall/ })).toBeVisible();
  await page.keyboard.press('e');
  await page.keyboard.press('End');
  await expect(page.locator('.narration__text')).not.toBeEmpty();
  expect(page.url()).toContain('g=');
});

test('graph editor: add a node and connect it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/visualizer.html?algo=bfs');
  await page.keyboard.press('e');
  await page.getByRole('radio', { name: /Nodo|Node/ }).click();
  await page.locator(".stage-canvas").scrollIntoViewIfNeeded();
  const empty = await canvasPoint(page, 0.06, 0.1);
  await page.mouse.click(empty.x, empty.y);
  await page.getByRole('radio', { name: /Arista|Edge/ }).click();
  await page.mouse.click(empty.x, empty.y);
  const src = new URL(page.url());
  expect(src.searchParams.get('g')).toBeNull();
  await page.keyboard.press('Escape');
  const g = new URL(page.url()).searchParams.get('g');
  expect(g).not.toBeNull();
  const packed = JSON.parse(Buffer.from(g!.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  expect(packed.n.length).toBe(19);
  expect(errors).toEqual([]);
});
