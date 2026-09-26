import { expect, test } from '@playwright/test';

test('compare runs two sorters on the same data and scores them', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/compare/?a=bubble-sort&b=merge-sort');
  await expect(page.locator('.fighter')).toHaveCount(2);
  await page.keyboard.press('End');
  await expect(page.locator('.fighter.is-done')).toHaveCount(2);
  await expect(page.locator('.results tbody tr')).not.toHaveCount(0);
  await expect(page.locator('.results td.is-better').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('switching category and players keeps the URL in sync', async ({ page }) => {
  await page.goto('/compare/');
  await page.getByRole('button', { name: /Grafos|Graphs/ }).click();
  await expect(page).toHaveURL(/a=dijkstra&b=a-star/);
  await page.locator('.fighter-select').nth(1).selectOption('backtracking-maze');
  await expect(page).toHaveURL(/b=backtracking-maze/);
  await expect(page.locator('.edit-warnings')).not.toBeEmpty();
  await page.keyboard.press('End');
  await expect(page.locator('.results')).toContainText(/\d/);
});

test('sync mode finishes both at the same time', async ({ page }) => {
  await page.goto('/compare/?a=selection-sort&b=heap-sort&mode=sync');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.fighter.is-done')).toHaveCount(0);
});
