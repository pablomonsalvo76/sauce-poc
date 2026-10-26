import * as allure from 'allure-js-commons';
import { expect, test } from '../fixtures/pages.fixture';
import { iniciarSesion } from '../helpers/login.helper';
import { checkout, mensajes, usuarios } from '../test-data';

const EPIC = 'SauceDemo';
const FEATURE = 'Compra';

test.describe('Compra', () => {
  test(
    'TC04 Compra de punta a punta',
    { tag: ['@smoke', '@regression'] },
    async ({ loginPage, inventarioPage, carritoPage, checkoutPage }) => {
      await allure.epic(EPIC);
      await allure.feature(FEATURE);
      await allure.severity(allure.Severity.BLOCKER);

      await test.step('01 Iniciar sesión', async () => {
        await iniciarSesion(loginPage, usuarios.standard);
        await expect(inventarioPage.titulo, 'El login debe llevar al inventario').toHaveText(
          mensajes.inventoryTitle,
        );
      });

      await test.step('02 Agregar producto al carrito', async () => {
        await inventarioPage.agregarProductoAlCarrito(checkout.product);
        await inventarioPage.irAlCarrito();
      });

      await test.step('03 Validar producto en el carrito', async () => {
        await expect(carritoPage.productos, 'El carrito debe tener un solo producto').toHaveCount(1);
        await expect(carritoPage.productos, `El carrito debe contener "${checkout.product}"`).toContainText(
          checkout.product,
        );
      });

      await test.step('04 Completar datos de checkout', async () => {
        await carritoPage.clickCheckout();
        await checkoutPage.completarDatos(checkout.customer);
        await checkoutPage.continuar();
      });

      await test.step('05 Finalizar compra', async () => {
        await checkoutPage.finalizar();
        await expect(
          checkoutPage.mensajeConfirmacion,
          `La compra debe confirmarse con "${mensajes.orderConfirmation}"`,
        ).toHaveText(mensajes.orderConfirmation);
      });
    },
  );
});
