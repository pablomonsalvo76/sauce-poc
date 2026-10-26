# POC Playwright + IA — Guía de prompts (Punto 1: proyecto funcionando)

Sitio: **https://www.saucedemo.com** · Stack: **Playwright Test + TypeScript** · Entrega interna: **miércoles 28/10/26** (el equipo entrega el jueves 29/10)

**Alcance:** esta guía cubre solo el **entregable 1**, es decir, el código funcionando. El reporte Allure, el análisis y el documento los hacen tus compañeros, pero vos les dejás todo listo para que puedan hacerlo (ver [Qué le pasás al equipo](#qué-le-pasás-al-equipo)).

---

## Ruta rápida

| # | Paso | Resultado |
|---|------|-----------|
| 0 | Reglas del equipo | Contexto que heredan todos los prompts |
| 1 | Estructura del proyecto | Carpetas, config, dependencias, Allure configurado |
| 2 | Datos externos | JSON con los 4 casos + `.env` |
| 3 | Page Objects | BasePage + una page por pantalla + fixtures |
| 4 | Tests | TC01–TC04 data-driven |
| 5 | Autorrevisión | ESLint + TypeScript sin errores, y la IA audita su código contra las reglas |
| 6 | Ejecución y corrección | Suite en verde + `allure-results/` generado |

## Después de cada prompt (3 hábitos)

| Hábito | Qué hacés | Para qué sirve |
|--------|-----------|----------------|
| **1. Medir** | Anotás los minutos que tardó el paso en el [Registro de tiempos](#registro-de-tiempos) | Demuestra con números si la IA aceleró el trabajo |
| **2. Guardar con Git** | Un commit con lo que generó la IA y, si corregís algo, otro commit aparte | Queda registrado qué hizo la IA y qué cambiaste vos |
| **3. Anotar** | El prompt tal como lo usaste y cada corrección en el [Registro de correcciones](#registro-de-correcciones) | Material para los entregables 3 y 4 |

Formato de los commits (separa lo de la IA de lo tuyo):

```bash
git add -A
git commit -m "ia: prompt 3 - page objects"
```

```bash
git add -A
git commit -m "fix manual: prompt 3 - selector del boton login"
```

Al final, `git log --oneline` muestra toda la historia: cada commit `ia:` es lo que hizo la IA y cada `fix manual:` es lo que tuviste que corregir.

---

## Casos de prueba

| ID | Caso | Usuario | Resultado esperado |
|----|------|---------|--------------------|
| TC01 | Login exitoso | `standard_user` | Inventario visible, título "Products" |
| TC02 | Login con usuario bloqueado | `locked_out_user` | "Epic sadface: Sorry, this user has been locked out." |
| TC03 | Login con credenciales inválidas | usuario/clave inválidos | "Epic sadface: Username and password do not match any user in this service" |
| TC04 | Compra de punta a punta | `standard_user` | Producto → carrito → checkout → "Thank you for your order!" |

> Agregá un caso de TC01 con `performance_glitch_user` (login lento a propósito). **Demuestra** que las esperas inteligentes funcionan sin sleeps.

---

## Estructura esperada

```text
poc-saucedemo/
├── pages/            base.page.ts, login.page.ts, inventario.page.ts, carrito.page.ts, checkout.page.ts
├── fixtures/         pages.fixture.ts      (inyecta las pages con test.extend)
├── helpers/          login.helper.ts       (flujo de login reutilizable)
├── test-data/        users.json, checkout.json, messages.json, index.ts (loader tipado)
├── tests/            login.spec.ts, compra.spec.ts
├── playwright.config.ts
├── .env.example      (BASE_URL, SAUCE_PASSWORD)
├── package.json + package-lock.json
└── README.md
```

---

## Prompt 0 — Reglas del equipo (contexto)

```text
Sos un ingeniero senior de automatización QA. Vas a generar una POC de automatización sobre
https://www.saucedemo.com con Playwright Test y TypeScript. Durante toda la sesión, seguí
estas reglas OBLIGATORIAS.

1. Stack
- Playwright Test + TypeScript en modo strict. Reporters: allure-playwright + html.
- dotenv para variables de entorno. Sin frameworks adicionales (sin Cucumber, sin Selenium).

2. Page Object Model
- Una clase por pantalla en /pages. Todas extienden una BasePage que recibe la Page de
  Playwright y encapsula lo común (abrir, esperar visible).
- Los locators son propiedades private readonly definidas en el constructor. Los métodos
  públicos expresan la intención del usuario (escribirUsuario, clickLogin,
  agregarProductoAlCarrito), nunca clics sueltos desde el test.
- Las pages no hacen aserciones de negocio; exponen locators o devuelven valores y el test valida.
- Las pages se inyectan en los tests con fixtures (test.extend) en /fixtures. Los tests nunca
  hacen `new LoginPage(page)`.
- Los flujos reutilizables (login completo) van en /helpers, no se duplican en los tests.

3. Datos en archivo externo — nada hardcodeado
- Usuarios, productos, datos de checkout y mensajes esperados viven en /test-data/*.json,
  con un loader tipado (test-data/index.ts).
- BASE_URL y la contraseña vienen de .env y se leen en un solo lugar; incluir .env.example.
  .env no se versiona.
- En tests y pages no hay ningún literal de datos, mensajes ni URLs. Los timeouts son
  constantes con nombre o van en playwright.config.ts.

4. Esperas inteligentes
- Solo aserciones web-first (await expect(locator).toBeVisible / toHaveText / toHaveURL) y el
  auto-waiting de Playwright.
- PROHIBIDO: page.waitForTimeout, setTimeout, sleeps fijos, force: true, { timeout: 0 },
  loops de reintento manuales.

5. Selectores
- SauceDemo expone atributos data-test: configurá testIdAttribute: 'data-test' y usá
  getByTestId. Si no hay test id: getByRole > getByText. Sin XPath ni CSS dependiente del
  layout (nth-child, div > div).

6. Tests
- Data-driven: los casos negativos de login se generan iterando los datos del JSON.
- Cada test es independiente (sin estado compartido ni orden de ejecución).
- Pasos numerados con test.step: "01 Abrir página", "02 Ingresar credenciales"...
- Cada expect lleva mensaje claro (segundo argumento de expect).
- Allure: epic, feature, severidad y tags (smoke, regression) en cada test.
- Config: retries 1 solo en CI, trace 'on-first-retry', screenshot 'only-on-failure',
  video 'retain-on-failure'.

7. Estilo
- Nombres de métodos y pasos en español, como en nuestro repositorio. JSDoc breve en clases
  y métodos públicos.

8. Salida
- Mostrá primero el árbol de carpetas y después cada archivo completo. Sin placeholders ni "...".
- Si algo es ambiguo, indicá tu supuesto en una línea y seguí.

Respondé "REGLAS CARGADAS" y esperá la próxima instrucción.
```

---

## Prompt 1 — Estructura del proyecto

```text
Creá la estructura del proyecto:
- Árbol de carpetas completo.
- package.json con versiones EXACTAS (sin ^ ni ~):
    @playwright/test 1.62.0 (la misma versión de Playwright que nuestro repo)
    allure-playwright, dotenv, typescript y @types/node en su última versión estable.
  Scripts: test, test:headed, test:smoke, test:regression, report, lint, typecheck.
- Control automático de calidad: ESLint (flat config) con typescript-eslint y
  eslint-plugin-playwright usando su configuración recomendada, y además como error:
  playwright/no-wait-for-timeout, playwright/no-force-option, playwright/missing-playwright-await,
  playwright/no-element-handle, playwright/prefer-web-first-assertions.
  Script "lint": eslint . y script "typecheck": tsc --noEmit.
- Inicializá git (git init) con el .gitignore listo antes del primer commit.
- Comandos de instalación: npm install (genera package-lock.json, que se versiona),
  npx playwright install chromium.
- playwright.config.ts: baseURL desde process.env.BASE_URL, testIdAttribute 'data-test',
  proyecto chromium, reporters [['html'], ['allure-playwright', { resultsDir: 'allure-results' }]],
  y las reglas de trace/screenshot/video/retries.
- tsconfig.json (strict), .env.example, .gitignore (node_modules, test-results,
  playwright-report, allure-results, allure-report, .env).
- README corto: instalar con npm ci, instalar navegadores, ejecutar todo, ejecutar por tag, y
  una nota de que armar el reporte necesita el CLI de Allure (no viene con el proyecto).
Todavía no generes pages ni tests.
```

## Prompt 2 — Datos externos

```text
Generá los datos de prueba para TC01–TC04 (incluí un caso extra de TC01 con
performance_glitch_user):
- test-data/users.json: standard, lockedOut, invalid, performanceGlitch. La contraseña NO va
  en el JSON: se toma de process.env.SAUCE_PASSWORD (excepto la del usuario inválido, que es
  un dato de prueba).
- test-data/checkout.json: nombre, apellido, código postal y producto.
- test-data/messages.json: título del inventario, errores de login y confirmación de compra,
  con el texto EXACTO que muestra el sitio.
- test-data/index.ts: interfaces + export tipado, y que falle con un error claro si falta
  una variable de entorno.
Mostrame los datos resultantes para revisarlos antes de seguir.
```

## Prompt 3 — Page Objects

```text
Generá BasePage y los Page Objects:
- LoginPage: abrir(), escribirUsuario, escribirClave, clickLogin, mensajeError (locator).
- InventarioPage: titulo (locator), agregarProductoAlCarrito(nombre), irAlCarrito.
- CarritoPage: productos (locator), clickCheckout.
- CheckoutPage: completarDatos({ nombre, apellido, codigoPostal }), continuar, finalizar,
  mensajeConfirmacion (locator).
El test id de cada producto se construye a partir del nombre en un único helper privado
(ej. "Sauce Labs Backpack" -> add-to-cart-sauce-labs-backpack).
Agregá helpers/login.helper.ts y fixtures/pages.fixture.ts que exporte `test` y `expect`
con todas las pages inyectadas.
```

## Prompt 4 — Tests

```text
Escribí los tests usando SOLO las fixtures, el helper de login y test-data:
- tests/login.spec.ts: TC01 exitoso (standard y performanceGlitch), TC02 bloqueado,
  TC03 inválido. Los negativos se generan con un loop sobre los datos.
- tests/compra.spec.ts: TC04 de punta a punta.
Cada test: pasos numerados con test.step, Allure epic/feature/severidad, tag @smoke o
@regression, expect web-first con mensaje claro. Ningún literal de datos en los tests.
Dame el comando para ejecutar todo y el comando para ejecutar solo smoke.
```

## Prompt 5 — Autorrevisión (no lo saltees)

Primero el control automático (no depende de la opinión de la IA):

```bash
npm run lint
```

```bash
npm run typecheck
```

Si alguno da errores, pegale la salida a la IA antes del prompt de revisión.

```text
Ejecuté npm run lint y npm run typecheck. Salida: <pegar, o "sin errores">.
Primero corregí todos esos errores sin desactivar reglas ni usar eslint-disable.
Después actuá como revisor de código estricto. Auditá TODOS los archivos generados contra las reglas
del Prompt 0. Devolvé una tabla: Archivo | Línea | Regla incumplida | Corrección.
Revisá en especial: literales hardcodeados (URLs, usuarios, contraseñas, mensajes, timeouts),
waitForTimeout o setTimeout, force: true, XPath o CSS frágil, aserciones dentro de pages,
`new Page(...)` en tests, tests que dependen de otros, expect sin mensaje y tipos `any`.
Después aplicá las correcciones y devolvé solo los archivos modificados.
```

## Prompt 6 — Ejecución y corrección

Copiá `.env.example` a `.env`, completalo y ejecutá:

```bash
npx playwright test
```

```text
Esta es la salida de la ejecución: <pegar>.
Para cada falla, antes de proponer cambios presentá:
1. Pasos del test y en qué paso falla.
2. Page y método involucrados.
3. Causa raíz: bug de la aplicación, bug del test o entorno.
Después proponé la corrección mínima respetando las reglas.
No agregues esperas, reintentos ni cambies la aserción para ocultar el problema.
```

Repetí hasta que quede en verde. Confirmá que se generó `allure-results/` con un resultado por caso.

---

## Registro de tiempos

| Prompt | Minutos con IA (incluye revisar y corregir) | Estimación sin IA (minutos) |
|--------|---------------------------------------------|-----------------------------|
| 0–1 Estructura |  |  |
| 2 Datos |  |  |
| 3 Page Objects |  |  |
| 4 Tests |  |  |
| 5 Revisión |  |  |
| 6 Ejecución y corrección |  |  |
| **Total** |  |  |

> La estimación sin IA hacela antes de arrancar cada paso, así no te influye el resultado.

---

## Registro de correcciones

| Paso | Qué generó la IA | Qué corregimos | Regla / motivo |
|------|------------------|----------------|----------------|
| ej. 3 | `page.locator('#login-button')` | Se cambió a `getByTestId('login-button')` | Selectores estables |
| ej. 4 | Literal "Products" en el spec | Se movió a `messages.json` | Nada hardcodeado |
|   |  |  |  |

---

## Qué le pasás al equipo

| Para | Qué |
|------|-----|
| Allure (entregable 2) | Proyecto que corre con un comando y genera `allure-results/` |
| Prompts (entregable 3) | Esta guía con los prompts **tal como los usaste** |
| Documento (entregable 4) | El Registro de correcciones, el Registro de tiempos, el `git log --oneline` y qué generó bien la IA sin tocar nada |

## Checklist de entrega

- [ ] `npm ci && npx playwright install chromium && npx playwright test` corre en verde en una carpeta limpia
- [ ] Los 4 casos (+ performance_glitch_user) en verde
- [ ] `npm run lint` y `npm run typecheck` sin errores (y sin `eslint-disable`)
- [ ] Búsqueda sin resultados de `waitForTimeout`, `setTimeout`, `force: true` y `secret_sauce` en `pages/` y `tests/`
- [ ] Commits `ia:` y `fix manual:` por cada paso; Registro de tiempos completo
- [ ] `allure-results/` se genera en cada ejecución
- [ ] `package-lock.json` versionado; repo o `.zip` sin `node_modules`, reportes ni `.env`

## Cronograma

| Día | Trabajo |
|-----|---------|
| Lun 26 | Prompts 0–2 |
| Mar 27 | Prompts 3–5 |
| Mié 28 | Prompt 6, suite en verde, se lo pasás al equipo |
