/**
 * Utilidades centralizadas de formateo (DRY / Single Responsibility)
 */

/**
 * Formatea un número o string a formato de pesos chilenos ($ XX.XXX).
 * Si no hay números válidos, retorna string vacío.
 */
export function formatearMonedaChilena(valor: number | string): string {
  if (valor === undefined || valor === null || valor === '') return '';
  const soloNumeros = String(valor).replace(/\D/g, '');
  if (!soloNumeros) return '';
  return Number(soloNumeros).toLocaleString('es-CL');
}

/**
 * Limpia cualquier caracter no numérico.
 */
export function limpiarSoloNumeros(valor: string): string {
  return valor.replace(/\D/g, '');
}

/**
 * Mapeo canónico de estados de solicitudes de mantención a etiquetas comprensibles.
 */
export const MAPA_ESTADOS_SOLICITUD: Record<string, string> = {
  REPORTADO: 'REPORTADO',
  PENDIENTE: 'PENDIENTE',
  PENDIENTE_REASIGNACION: 'REASIGNACIÓN',
  EN_REPARACION: 'EN REPARACIÓN',
  FINALIZADO: 'FINALIZADO',
};

/**
 * Retorna la etiqueta legible para un estado de solicitud.
 */
export function formatearEstadoSolicitud(estado?: string | null): string {
  if (!estado) return 'DESCONOCIDO';
  return MAPA_ESTADOS_SOLICITUD[estado] ?? estado;
}

/**
 * Obtiene las clases Tailwind de color según el estado para renderizado coherente de badges.
 */
export function obtenerEstilosBadgeEstado(estado?: string | null): {
  bg: string;
  text: string;
  border: string;
  badgeClass: string;
  label: string;
} {
  const label = formatearEstadoSolicitud(estado);

  switch (estado) {
    case 'FINALIZADO':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label,
      };
    case 'EN_REPARACION':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        label,
      };
    case 'PENDIENTE_REASIGNACION':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
        label,
      };
    case 'PENDIENTE':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        label,
      };
    case 'REPORTADO':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        label,
      };
  }
}

/**
 * Formatea una fecha ISO o string a formato chileno legible (DD/MM/YYYY HH:mm).
 */
export function formatearFechaHora(fechaStr?: string | null): string {
  if (!fechaStr) return '';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fechaStr;
  }
}
