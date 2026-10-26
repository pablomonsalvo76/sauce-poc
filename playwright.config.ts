import { defineConfig, devices } from '@playwright/test';
import { env } from './test-data';

const isCI = Boolean(process.env.CI);

/**
 * Configuración de Playwright Test para la POC de SauceDemo.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [['html'], ['allure-playwright', { resultsDir: 'allure-results' }]],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
