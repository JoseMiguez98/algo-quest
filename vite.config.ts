import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      input: { visualizer: resolve(__dirname, 'visualizer.html') },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
