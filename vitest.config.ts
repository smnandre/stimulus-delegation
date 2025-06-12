import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      exclude: ['*.config.ts', 'tests/**'],
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    testTimeout: 5000, // 5 seconds timeout
  },
});
