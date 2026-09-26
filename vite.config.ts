import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
  build: {
    rollupOptions: {
      input: { index: resolve(__dirname, 'index.html'), visualizer: resolve(__dirname, 'visualizer.html') },
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
