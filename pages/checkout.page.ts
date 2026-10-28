import type { Locator, Page } from '@playwright/test';
import type { DatosCliente } from '@data';
import { BasePage } from './base.page';

/**
 * Pantallas del checkout: datos del cliente, resumen y confirmación.
 */
export class CheckoutPage extends BasePage {
  /** Campos del formulario de datos del cliente. */
  readonly campoNombre: Locator;
  readonly campoApellido: Locator;
  readonly campoCodigoPostal: Locator;
  private readonly botonContinuar: Locator;
  private readonly botonFinalizar: Locator;
  /** Título de la pantalla actual del checkout. */
  readonly titulo: Locator;
  /** Encabezado de confirmación de la orden. */
  readonly mensajeConfirmacion: Locator;

  constructor(page: Page) {
    super(page);
    this.campoNombre = page.getByTestId('firstName');
    this.campoApellido = page.getByTestId('lastName');
    this.campoCodigoPostal = page.getByTestId('postalCode');
    this.botonContinuar = page.getByTestId('continue');
    this.botonFinalizar = page.getByTestId('finish');
    this.titulo = page.getByTestId('title');
    this.mensajeConfirmacion = page.getByTestId('complete-header');
  }

  /** Completa el formulario con los datos del cliente. */
  async completarDatos({ nombre, apellido, codigoPostal }: DatosCliente): Promise<void> {
    await this.campoNombre.fill(nombre);
    await this.campoApellido.fill(apellido);
    await this.campoCodigoPostal.fill(codigoPostal);
  }

  /** Avanza al resumen de la orden. */
  async continuar(): Promise<void> {
    await this.botonContinuar.click();
  }

  /** Confirma la orden. */
  async finalizar(): Promise<void> {
    await this.botonFinalizar.click();
  }
}
