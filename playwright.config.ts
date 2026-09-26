import { defineConfig } from '@playwright/test';

const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:5180', viewport: { width: 1280, height: 860 }, trace: ci ? 'on-first-retry' : 'off' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5180', reuseExistingServer: !ci },
});
