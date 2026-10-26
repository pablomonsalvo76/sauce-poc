import type { Locator, Page } from '@playwright/test';
import { rutas } from '../test-data';
import { BasePage } from './base.page';

/**
 * Pantalla de login de SauceDemo.
 */
export class LoginPage extends BasePage {
  private readonly campoUsuario: Locator;
  private readonly campoClave: Locator;
  private readonly botonLogin: Locator;
  /** Mensaje de error que muestra el sitio cuando el login falla. */
  readonly mensajeError: Locator;

  constructor(page: Page) {
    super(page);
    this.campoUsuario = page.getByTestId('username');
    this.campoClave = page.getByTestId('password');
    this.botonLogin = page.getByTestId('login-button');
    this.mensajeError = page.getByTestId('error');
  }

  /** Abre la pantalla de login y espera a que el formulario esté listo. */
  async abrir(): Promise<void> {
    await this.abrirRuta(rutas.login);
    await this.esperarVisible(this.botonLogin);
  }

  /** Escribe el nombre de usuario. */
  async escribirUsuario(usuario: string): Promise<void> {
    await this.campoUsuario.fill(usuario);
  }

  /** Escribe la contraseña. */
  async escribirClave(clave: string): Promise<void> {
    await this.campoClave.fill(clave);
  }

  /** Envía el formulario de login. */
  async clickLogin(): Promise<void> {
    await this.botonLogin.click();
  }
}
