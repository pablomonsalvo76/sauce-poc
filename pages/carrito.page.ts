import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Pantalla del carrito de compras.
 */
export class CarritoPage extends BasePage {
  private readonly botonCheckout: Locator;
  /** Productos que hay en el carrito. */
  readonly productos: Locator;

  constructor(page: Page) {
    super(page);
    this.productos = page.getByTestId('inventory-item');
    this.botonCheckout = page.getByTestId('checkout');
  }

  /** Inicia el checkout. */
  async clickCheckout(): Promise<void> {
    await this.botonCheckout.click();
  }
}
