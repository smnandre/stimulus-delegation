import { defineConfig } from '@playwright/test';

const PORT = process.env.TEST_PORT || 64995;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 5000, // 5 seconds
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npx serve . -l ${PORT}`,
    url: `http://localhost:${PORT}/tests/e2e/stimulus-delegation.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 10000, // 10 seconds for server startup
  },
});
