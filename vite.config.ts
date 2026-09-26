import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { algorithmPages } from './build/pages-plugin';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
  plugins: [algorithmPages()],
  build: {
    rollupOptions: {
      input: { index: resolve(__dirname, 'index.html'), visualizer: resolve(__dirname, 'visualizer.html'), compare: resolve(__dirname, 'compare.html'), notFound: resolve(__dirname, '404.html') },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    // Property tests run thousands of cases; shared CI runners are several times slower than a laptop.
    testTimeout: 30_000,
  },
});
