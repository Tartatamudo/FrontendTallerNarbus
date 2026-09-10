/**
 * Utilidades para decodificación y verificación de tokens JWT en el cliente
 */

export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  rol?: string;
  username?: string;
  [key: string]: unknown;
}

/**
 * Decodifica de forma segura la carga útil (payload) de un JWT en base64url sin librerías externas.
 * Es compatible tanto con navegadores de escritorio como con WebViews de Capacitor en Android.
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Reemplazar caracteres base64url por base64 estándar
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Rellenar padding con '=' si la longitud no es múltiplo de 4
    while (base64.length % 4) {
      base64 += '=';
    }

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decodedText = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decodedText) as JwtPayload;
  } catch (err) {
    console.warn('Error al decodificar token JWT en cliente:', err);
    return null;
  }
}

/**
 * Retorna true si el token JWT ya venció según su propiedad `exp` o si es inválido.
 * @param token Cadena del token JWT Bearer
 * @param bufferSeconds Margen de seguridad en segundos (por defecto 30 segundos) para prevenir expiración en vuelo
 */
export function isTokenExpired(token: string | null | undefined, bufferSeconds = 30): boolean {
  if (!token || typeof token !== 'string') {
    return true;
  }
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') {
    // Si no tiene campo exp o no es un JWT válido, se considera expirado/inválido
    return true;
  }
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds >= (payload.exp - bufferSeconds);
}

/**
 * Obtiene los segundos restantes antes de que el token expire. Retorna 0 si ya expiró.
 */
export function getTokenRemainingTime(token: string | null | undefined): number {
  if (!token) return 0;
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return 0;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - nowInSeconds;
  return remaining > 0 ? remaining : 0;
}
