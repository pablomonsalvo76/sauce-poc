import type { LoginPage } from '../pages/login.page';
import type { Usuario } from '../test-data';

/**
 * Flujo de login completo: abre la pantalla, ingresa las credenciales y envía el formulario.
 */
export async function iniciarSesion(loginPage: LoginPage, usuario: Usuario): Promise<void> {
  await loginPage.abrir();
  await loginPage.escribirUsuario(usuario.username);
  await loginPage.escribirClave(usuario.password);
  await loginPage.clickLogin();
}
