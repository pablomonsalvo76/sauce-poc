import * as allure from 'allure-js-commons';
import { expect, test } from '../fixtures/pages.fixture';
import { iniciarSesion } from '../helpers/login.helper';
import { casosLoginExitoso, casosLoginNegativos, mensajes } from '../test-data';

const EPIC = 'SauceDemo';
const FEATURE = 'Login';

test.describe('Login', () => {
  for (const caso of casosLoginExitoso) {
    test(`${caso.id} ${caso.descripcion}`, { tag: ['@smoke', '@regression'] }, async ({ loginPage, inventarioPage }) => {
      await allure.epic(EPIC);
      await allure.feature(FEATURE);
      await allure.severity(allure.Severity.BLOCKER);

      await test.step('01 Iniciar sesión', async () => {
        await iniciarSesion(loginPage, caso.usuario);
      });

      await test.step('02 Validar inventario visible', async () => {
        await expect(
          inventarioPage.titulo,
          `El inventario debe mostrar el título "${mensajes.inventoryTitle}"`,
        ).toHaveText(mensajes.inventoryTitle);
      });
    });
  }

  for (const caso of casosLoginNegativos) {
    test(`${caso.id} ${caso.descripcion}`, { tag: '@regression' }, async ({ loginPage }) => {
      await allure.epic(EPIC);
      await allure.feature(FEATURE);
      await allure.severity(allure.Severity.CRITICAL);

      await test.step('01 Iniciar sesión', async () => {
        await iniciarSesion(loginPage, caso.usuario);
      });

      await test.step('02 Validar mensaje de error', async () => {
        await expect(loginPage.mensajeError, `El login debe fallar con "${caso.mensajeEsperado}"`).toHaveText(
          caso.mensajeEsperado,
        );
      });
    });
  }
});
