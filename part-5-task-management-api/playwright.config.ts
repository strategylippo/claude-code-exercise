import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  // Three-tier test configuration
  projects: [
    {
      name: 'smoke',
      testMatch: '**/*.smoke.spec.ts',
      use: {
        // Smoke tests should be fast and critical
      },
    },
    {
      name: 'sanity',
      testMatch: '**/*.sanity.spec.ts',
      use: {
        // Sanity tests check main features
      },
    },
    {
      name: 'regression',
      testDir: './tests/regression',
      testMatch: '**/*.spec.ts',
      use: {
        // Full regression tests all scenarios
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
