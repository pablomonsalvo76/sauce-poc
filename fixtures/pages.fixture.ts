import { test as base } from '@playwright/test';
import { CarritoPage } from '@pages/carrito.page';
import { CheckoutPage } from '@pages/checkout.page';
import { InventarioPage } from '@pages/inventario.page';
import { LoginPage } from '@pages/login.page';

/** Page Objects disponibles en cada test. */
interface Pages {
  loginPage: LoginPage;
  inventarioPage: InventarioPage;
  carritoPage: CarritoPage;
  checkoutPage: CheckoutPage;
}

/**
 * `test` con todas las pages inyectadas: los tests nunca las instancian.
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventarioPage: async ({ page }, use) => {
    await use(new InventarioPage(page));
  },
  carritoPage: async ({ page }, use) => {
    await use(new CarritoPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
