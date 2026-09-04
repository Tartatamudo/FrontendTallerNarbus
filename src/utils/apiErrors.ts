/**
 * Utilidad unificada para extraer mensajes comprensibles de error desde el Backend FastAPI / NarbusException.
 *
 * Estructura estándar del backend:
 * {
 *   "error": {
 *     "code": "BUSINESS_RULE_VIOLATION",
 *     "message": "Descripción comprensible del error de negocio",
 *     "detail": null
 *   }
 * }
 */
export function getApiErrorMessage(error: unknown, fallbackMessage = 'Ocurrió un error inesperado.'): string {
  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const anyErr = error as any;

  // 1. Verificar formato oficial NarbusException: { error: { message: "..." } }
  if (anyErr.response?.data?.error?.message) {
    return String(anyErr.response.data.error.message);
  }

  // 2. Verificar formato estándar FastAPI: { detail: "..." } o { detail: [...] }
  const detail = anyErr.response?.data?.detail;
  if (detail) {
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      // Errores de validación Pydantic
      const first = detail[0];
      if (typeof first === 'object' && first?.msg) {
        const field = Array.isArray(first?.loc) ? first.loc[first.loc.length - 1] : '';
        return field ? `Campo '${field}': ${first.msg}` : String(first.msg);
      }
      return JSON.stringify(detail);
    }
  }

  // 3. Mensaje en response.data.message
  if (anyErr.response?.data?.message && typeof anyErr.response.data.message === 'string') {
    return anyErr.response.data.message;
  }

  // 4. Mensaje genérico de Axios o Error JavaScript
  if (anyErr.message && typeof anyErr.message === 'string') {
    if (anyErr.message.includes('Network Error')) {
      return 'No hay conexión con el servidor del taller. Verifique su conexión de red o si el backend está activo.';
    }
    if (anyErr.message.includes('timeout')) {
      return 'El servidor tardó demasiado en responder (tiempo de espera agotado).';
    }
    return anyErr.message;
  }

  return fallbackMessage;
}
