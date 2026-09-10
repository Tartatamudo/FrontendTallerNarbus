/**
 * Utilidad para normalizar y resolver URLs de imágenes en FrontendTallerNarbus / ProtoNeumaticos.
 * Soporta de manera transparente:
 * 1. URLs absolutas de Google Cloud Storage (GCS): https://storage.googleapis.com/...
 * 2. URLs de desarrollo local servidas por el backend FastAPI: /uploads/...
 * 3. URLs en formato Data URI (Base64) generadas por la cámara o FileReader: data:image/...
 */

export const getBackendBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    try {
      const url = new URL(envUrl);
      return url.origin;
    } catch {
      return 'http://127.0.0.1:8000';
    }
  }
  return 'http://127.0.0.1:8000';
};

/**
 * Obtiene la URL completa y accesible para renderizado en etiquetas <img> o apertura en ventanas de visualización.
 *
 * @param url Cadena de texto proveniente de foto_url, evidencia_url o vista previa
 * @returns URL absoluta lista para usar, o null si no se proporcionó una URL
 */
export function getFullImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return null;
  }

  const trimmed = url.trim();

  // Si ya es una URL absoluta de Google Cloud Storage, externa o Data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Si es una ruta relativa local generada por el backend en entorno local
  const baseUrl = getBackendBaseUrl();
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalizedPath}`;
}
