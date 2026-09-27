import { defineConfig } from '@playwright/test';

const ci = Boolean(process.env.CI);
// CI tests the production build (run `npm run build` first); locally the dev server keeps the loop fast.
const server = ci ? { command: 'npm run preview', url: 'http://localhost:5181' } : { command: 'npm run dev', url: 'http://localhost:5180' };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: server.url, viewport: { width: 1280, height: 860 }, trace: ci ? 'on-first-retry' : 'off' },
  webServer: { ...server, reuseExistingServer: !ci },
});
