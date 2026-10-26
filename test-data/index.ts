import dotenv from 'dotenv';
import checkoutJson from './checkout.json';
import messagesJson from './messages.json';
import usersJson from './users.json';

dotenv.config({ quiet: true });

/** Credenciales de un usuario de SauceDemo. */
export interface Usuario {
  username: string;
  password: string;
}

/** Datos del comprador para el formulario de checkout. */
export interface DatosCliente {
  nombre: string;
  apellido: string;
  codigoPostal: string;
}

/** Datos de la compra de punta a punta (TC04). */
export interface DatosCheckout {
  customer: DatosCliente;
  product: string;
}

/** Textos exactos que muestra el sitio. */
export interface Mensajes {
  inventoryTitle: string;
  loginErrors: {
    lockedOut: string;
    invalidCredentials: string;
  };
  orderConfirmation: string;
}

/** Caso negativo de login generado a partir de los datos. */
export interface CasoLoginNegativo {
  id: string;
  descripcion: string;
  usuario: Usuario;
  mensajeEsperado: string;
}

/**
 * Lee una variable de entorno obligatoria.
 * @throws Error con el nombre de la variable si no está definida.
 */
function leerVariableEntorno(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copiá .env.example a .env y completá su valor.`,
    );
  }
  return valor;
}

/** Variables de entorno del proyecto: único lugar donde se leen. */
export const env = {
  baseUrl: leerVariableEntorno('BASE_URL'),
  sauceClave: leerVariableEntorno('SAUCE_PASSWORD'),
} as const;

/** Usuarios de prueba; la clave de los usuarios válidos sale de SAUCE_PASSWORD. */
export const usuarios: Record<keyof typeof usersJson, Usuario> = {
  standard: { ...usersJson.standard, password: env.sauceClave },
  lockedOut: { ...usersJson.lockedOut, password: env.sauceClave },
  invalid: usersJson.invalid,
  performanceGlitch: { ...usersJson.performanceGlitch, password: env.sauceClave },
};

export const checkout: DatosCheckout = checkoutJson;

export const mensajes: Mensajes = messagesJson;

/** Casos negativos de login (TC02, TC03) para iterar en los tests. */
export const casosLoginNegativos: readonly CasoLoginNegativo[] = [
  {
    id: 'TC02',
    descripcion: 'Login con usuario bloqueado',
    usuario: usuarios.lockedOut,
    mensajeEsperado: mensajes.loginErrors.lockedOut,
  },
  {
    id: 'TC03',
    descripcion: 'Login con credenciales inválidas',
    usuario: usuarios.invalid,
    mensajeEsperado: mensajes.loginErrors.invalidCredentials,
  },
];
