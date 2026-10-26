import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'allure-results/', 'allure-report/'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts', 'pages/**/*.ts', 'fixtures/**/*.ts', 'helpers/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/prefer-web-first-assertions': 'error',
    },
  },
);
