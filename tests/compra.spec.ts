import * as allure from 'allure-js-commons';
import { expect, test } from '../fixtures/pages.fixture';
import { iniciarSesion } from '../helpers/login.helper';
import { checkout, mensajes, usuarios, type Usuario } from '../test-data';
import type { CarritoPage } from '../pages/carrito.page';
import type { CheckoutPage } from '../pages/checkout.page';
import type { InventarioPage } from '../pages/inventario.page';
import type { LoginPage } from '../pages/login.page';

const EPIC = 'SauceDemo';
const FEATURE = 'Compra';

/** Pages que usa el flujo de compra. */
interface PagesCompra {
  loginPage: LoginPage;
  inventarioPage: InventarioPage;
  carritoPage: CarritoPage;
  checkoutPage: CheckoutPage;
}

/**
 * Compra de punta a punta con el usuario indicado: login, carrito, checkout y confirmación.
 */
async function comprarDePuntaAPunta(
  usuario: Usuario,
  { loginPage, inventarioPage, carritoPage, checkoutPage }: PagesCompra,
): Promise<void> {
  await allure.epic(EPIC);
  await allure.feature(FEATURE);
  await allure.severity(allure.Severity.BLOCKER);

  await test.step('01 Iniciar sesión', async () => {
    await iniciarSesion(loginPage, usuario);
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
    await expect(checkoutPage.campoNombre, 'El nombre debe quedar cargado').toHaveValue(checkout.customer.nombre);
    await expect(checkoutPage.campoApellido, 'El apellido debe quedar cargado').toHaveValue(
      checkout.customer.apellido,
    );
    await expect(checkoutPage.campoCodigoPostal, 'El código postal debe quedar cargado').toHaveValue(
      checkout.customer.codigoPostal,
    );
    await checkoutPage.continuar();
    await expect(
      checkoutPage.titulo,
      `Los datos deben aceptarse y mostrar "${mensajes.checkoutOverviewTitle}"`,
    ).toHaveText(mensajes.checkoutOverviewTitle);
  });

  await test.step('05 Finalizar compra', async () => {
    await checkoutPage.finalizar();
    await expect(
      checkoutPage.mensajeConfirmacion,
      `La compra debe confirmarse con "${mensajes.orderConfirmation}"`,
    ).toHaveText(mensajes.orderConfirmation);
  });
}

test.describe('Compra', () => {
  test('TC04 Compra de punta a punta', { tag: ['@smoke', '@regression'] }, async ({
    loginPage,
    inventarioPage,
    carritoPage,
    checkoutPage,
  }) => {
    await comprarDePuntaAPunta(usuarios.standard, { loginPage, inventarioPage, carritoPage, checkoutPage });
  });

  test('TC05 Compra de punta a punta con problem_user', { tag: '@regression' }, async ({
    loginPage,
    inventarioPage,
    carritoPage,
    checkoutPage,
  }) => {
    await comprarDePuntaAPunta(usuarios.problem, { loginPage, inventarioPage, carritoPage, checkoutPage });
  });
});
