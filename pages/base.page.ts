import type { Locator, Page } from '@playwright/test';

/**
 * Base de todos los Page Objects: encapsula la navegación y las esperas comunes.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navega a una ruta relativa a la baseURL. */
  protected async abrirRuta(ruta: string): Promise<void> {
    await this.page.goto(ruta);
  }

  /** Espera a que el elemento esté visible usando el auto-waiting de Playwright. */
  protected async esperarVisible(elemento: Locator): Promise<void> {
    await elemento.waitFor({ state: 'visible' });
  }
}
