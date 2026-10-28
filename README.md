# POC SauceDemo — Playwright + TypeScript

Automatización de https://www.saucedemo.com con Playwright Test, Page Object Model y datos externos.

## Requisitos

- Node.js 22.18 o superior (el script `npm run insumo` ejecuta TypeScript directo con Node).
- Git.
- Opcional: [CLI de Allure](https://allurereport.org/docs/install/) para ver el reporte Allure.

## Instalación

```bash
npm ci
npx playwright install chromium
```

Copiá `.env.example` a `.env` y completá `SAUCE_PASSWORD`. El `.env` no se versiona.

| Variable | Para qué sirve |
|----------|----------------|
| `BASE_URL` | URL del sitio (`https://www.saucedemo.com`) |
| `SAUCE_PASSWORD` | Contraseña de los usuarios de SauceDemo; se muestra en la pantalla de login del sitio |

Si falta alguna, la suite corta al arrancar con un error que dice qué variable completar.

## Ejecución

```bash
npm test                 # toda la suite
npm run test:smoke       # solo @smoke
npm run test:regression  # solo @regression
npm run test:headed      # con navegador visible
```

Para correr un solo archivo o un solo caso:

```bash
npx playwright test tests/login.spec.ts
npx playwright test -g "TC04"
```

Para ver el reporte HTML de la última corrida, con screenshots, videos y traces de las fallas:

```bash
npx playwright show-report
```

## Casos de prueba

| ID | Caso | Usuario | Tags | Archivo |
|----|------|---------|------|---------|
| TC01 | Login exitoso (dos variantes: estándar y lento) | `standard_user`, `performance_glitch_user` | @smoke @regression | `tests/login.spec.ts` |
| TC02 | Login con usuario bloqueado | `locked_out_user` | @regression | `tests/login.spec.ts` |
| TC03 | Login con credenciales inválidas | usuario/clave inválidos | @regression | `tests/login.spec.ts` |
| TC04 | Compra de punta a punta | `standard_user` | @smoke @regression | `tests/compra.spec.ts` |
| TC05 | Compra de punta a punta con `problem_user` | `problem_user` | @regression | `tests/compra.spec.ts` |

TC05 **falla a propósito**: el sitio tiene un bug en el checkout con `problem_user` y el caso existe para que el
análisis de resultados con IA tenga una falla real que investigar. Una corrida completa sana termina con 5 tests en
verde y TC05 en rojo en el paso 04. No lo marques como skip ni lo "arregles".

## Cómo funciona

### Estructura

```text
sauce-poc/
├── tests/            Specs: qué se prueba. Solo usan fixtures, helpers y test-data.
├── pages/            Page Objects: cómo se interactúa con cada pantalla (una clase por pantalla).
├── fixtures/         pages.fixture.ts: inyecta las pages en los tests con test.extend.
├── helpers/          Flujos reutilizables entre tests (ej. login.helper.ts).
├── test-data/        Datos de prueba en JSON + index.ts (loader tipado y lectura del .env).
├── scripts/          armar-insumo.mts: arma el insumo para el análisis con IA.
├── Docs/             PROMPTS-POC.md: guía de prompts con la que se generó la POC.
├── playwright.config.ts
└── eslint.config.mjs
```

Carpetas que se generan al correr y no se versionan: `test-results/` (evidencia de fallas), `playwright-report/`,
`allure-results/`, `allure-report/` y `resultados/`.

### Recorrido de un test

```text
tests/*.spec.ts ──usa──▶ fixtures/pages.fixture.ts ──crea──▶ pages/*.page.ts
       │                                                       │
       └──lee──▶ test-data/index.ts ◀── *.json y .env ◀──lee───┘ (rutas)
```

1. El spec importa `test` y `expect` desde `fixtures/pages.fixture.ts`, no desde `@playwright/test`. Así cada test
   recibe las pages ya creadas (`async ({ loginPage, inventarioPage }) => ...`).
2. Las pages encapsulan los selectores (`getByTestId`, con `data-test` como atributo) y exponen métodos con la
   intención del usuario: `escribirUsuario`, `agregarProductoAlCarrito`, `completarDatos`. No hacen aserciones.
3. Los datos (usuarios, productos, mensajes esperados, rutas) vienen de `test-data/`. La contraseña sale del `.env`.
4. El test valida con aserciones web-first (`await expect(locator).toHaveText(...)`), cada una con un mensaje que
   explica qué se esperaba. Los pasos se numeran con `test.step` ("01 Iniciar sesión", ...).
5. Cada corrida genera el reporte HTML, `allure-results/` y `resultados/resultados.json`.

### Reglas del proyecto

- **Nada hardcodeado:** ni URLs, ni usuarios, ni contraseñas, ni mensajes en `tests/` o `pages/`. Todo va en
  `test-data/` o en el `.env`.
- **Sin esperas fijas:** prohibido `waitForTimeout`, `setTimeout`, `force: true` y reintentos manuales. Se usan el
  auto-waiting de Playwright y las aserciones web-first. El timeout de `expect` (10 s) está en `playwright.config.ts`.
- **Selectores estables:** `getByTestId` primero; si no hay test id, `getByRole` y después `getByText`. Nada de XPath
  ni CSS dependiente del layout.
- **Tests independientes:** cada test hace su propio login y no depende del orden ni de otro test.
- **Alias de imports:** entre carpetas se usan `@pages/*`, `@fixtures/*`, `@helpers/*` y `@data` (definidos en
  `tsconfig.json`); dentro de una misma carpeta se importa con `./`.
- **Bug conocido:** TC05 lleva el tag `@known-bug`. `npm run test:ci` lo excluye para que un pipeline no quede en
  rojo; `npm test` lo sigue corriendo para el análisis.
- **Tags literales:** el `tag` de cada test se escribe fijo (`{ tag: ['@smoke', '@regression'] }`); ESLint no acepta
  tags calculados.
- **Allure:** cada test declara epic, feature y severidad.

`npm run lint` y `npm run typecheck` controlan buena parte de estas reglas. No se desactivan reglas con
`eslint-disable`.

## Cómo agregar casos

### Un caso negativo de login (ej. usuario vacío)

No hace falta tocar el spec: los negativos se generan recorriendo los datos.

1. Si el sitio muestra un mensaje nuevo, agregalo con el texto exacto en `test-data/messages.json` y su tipo en la
   interfaz `Mensajes` de `test-data/index.ts`.
2. Si usa un usuario nuevo, agregalo en `test-data/users.json` y en `usuarios` de `test-data/index.ts` (la contraseña
   de los usuarios válidos se toma de `env.sauceClave`).
3. Agregá el caso en `casosLoginNegativos` de `test-data/index.ts` con su `id`, `descripcion`, `usuario` y
   `mensajeEsperado`.

### Un login exitoso con otro usuario

Igual que el anterior, pero en `casosLoginExitoso`. El spec valida que se vea el inventario.

### Una compra con otro usuario o producto

- Otro producto: cambiá `product` en `test-data/checkout.json` (el test id del botón se arma a partir del nombre).
- Otro usuario: agregalo en `users.json` y `usuarios`, y sumá un test en `tests/compra.spec.ts` que llame a
  `comprarDePuntaAPunta(usuarios.<nuevo>, { ... })` con su propio ID y tags literales.

### Un flujo o pantalla nueva

1. **Page Object:** creá `pages/<pantalla>.page.ts` que extienda `BasePage`. Locators como `private readonly` en el
   constructor (públicos `readonly` solo si el test los necesita para validar) y métodos con la intención del usuario.
2. **Fixture:** registrala en `fixtures/pages.fixture.ts` (en la interfaz `Pages` y con un
   `<pantalla>Page: async ({ page }, use) => ...`).
3. **Datos:** todo lo que use el test va en un JSON de `test-data/` y se exporta tipado desde `test-data/index.ts`.
4. **Helper (opcional):** si el flujo se repite en varios tests, llevalo a `helpers/`.
5. **Spec:** en `tests/<flujo>.spec.ts`, con el siguiente ID libre (TC06, TC07...), tags literales, epic/feature/severidad
   de Allure, pasos numerados con `test.step` y cada `expect` con su mensaje.

### Antes de subir cambios

```bash
npm run lint
npm run typecheck
npm test
```

Lint y typecheck tienen que dar sin errores y la suite tiene que quedar como antes: todo en verde salvo TC05.

## Análisis de resultados con IA

Después de `npm test`:

```bash
npm run insumo
```

Genera `resultados/insumo-analisis.md` con el resumen de la corrida, la tabla de tests y, por cada falla, el paso donde
falla, el error, la evidencia (screenshot, video, trace) y el `error-context.md` de Playwright. Ese archivo se le pasa a
la IA con el Prompt 7 de [Docs/PROMPTS-POC.md](Docs/PROMPTS-POC.md).

## Reporte Allure

Cada ejecución genera `allure-results/`. Para armar y abrir el reporte (`npm run report`) se necesita el
[CLI de Allure](https://allurereport.org/docs/install/) instalado aparte: no viene con el proyecto.
