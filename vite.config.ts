import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  test: {
    include: ['src/**/*.test.ts'],
  },
});
