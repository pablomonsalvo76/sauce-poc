# POC SauceDemo — Playwright + TypeScript

Automatización de https://www.saucedemo.com con Playwright Test, Page Object Model y datos externos.

## Instalación

```bash
npm ci
npx playwright install chromium
```

Copiá `.env.example` a `.env` y completá `SAUCE_PASSWORD`.

## Ejecución

```bash
npm test                 # toda la suite
npm run test:smoke       # solo @smoke
npm run test:regression  # solo @regression
npm run test:headed      # con navegador visible
```

## Calidad

```bash
npm run lint
npm run typecheck
```

## Reporte Allure

Cada ejecución genera `allure-results/`. Para armar y abrir el reporte (`npm run report`) se necesita el
[CLI de Allure](https://allurereport.org/docs/install/) instalado aparte: no viene con el proyecto.
