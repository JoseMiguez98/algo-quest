import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:5180', viewport: { width: 1280, height: 860 } },
  webServer: { command: 'npm run dev', url: 'http://localhost:5180', reuseExistingServer: true },
});
