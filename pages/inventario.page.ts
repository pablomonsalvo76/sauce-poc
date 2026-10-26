import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Pantalla de inventario (listado de productos).
 */
export class InventarioPage extends BasePage {
  private readonly linkCarrito: Locator;
  /** Título de la pantalla de inventario. */
  readonly titulo: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByTestId('title');
    this.linkCarrito = page.getByTestId('shopping-cart-link');
  }

  /** Agrega al carrito el producto con el nombre indicado. */
  async agregarProductoAlCarrito(nombre: string): Promise<void> {
    await this.page.getByTestId(this.testIdAgregarAlCarrito(nombre)).click();
  }

  /** Navega al carrito desde el ícono del encabezado. */
  async irAlCarrito(): Promise<void> {
    await this.linkCarrito.click();
  }

  /** Construye el test id del botón "Add to cart" (ej. "Sauce Labs Backpack" -> add-to-cart-sauce-labs-backpack). */
  private testIdAgregarAlCarrito(nombre: string): string {
    return `add-to-cart-${nombre.toLowerCase().replace(/\s+/g, '-')}`;
  }
}
