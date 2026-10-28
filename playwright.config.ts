import { defineConfig, devices } from '@playwright/test';
import { env } from './test-data';

const isCI = Boolean(process.env.CI);

/** Cubre el login demorado de performance_glitch_user sin esperas fijas. */
const TIMEOUT_EXPECT_MS = 10_000;

/** Resultados en JSON que lee scripts/armar-insumo.mts para el análisis con IA. */
const RESULTADOS_JSON = 'resultados/resultados.json';

/**
 * Configuración de Playwright Test para la POC de SauceDemo.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [
    ['html'],
    ['allure-playwright', { resultsDir: 'allure-results' }],
    ['json', { outputFile: RESULTADOS_JSON }],
  ],
  expect: {
    timeout: TIMEOUT_EXPECT_MS,
  },
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
