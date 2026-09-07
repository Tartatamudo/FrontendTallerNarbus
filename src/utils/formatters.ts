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
  dotClass: string;
  label: string;
} {
  const label = formatearEstadoSolicitud(estado);

  switch (estado) {
    case 'FINALIZADO':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dotClass: 'bg-emerald-500',
        label,
      };
    case 'EN_REPARACION':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotClass: 'bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.6)]',
        label,
      };
    case 'PENDIENTE_REASIGNACION':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-300',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
        dotClass: 'bg-purple-500 animate-pulse',
        label,
      };
    case 'PENDIENTE':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
        dotClass: 'bg-blue-500',
        label,
      };
    case 'REPORTADO':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-300',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-300',
        dotClass: 'bg-sky-500 animate-pulse shadow-[0_0_6px_rgba(14,165,233,0.5)]',
        label,
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        border: 'border-slate-300',
        badgeClass: 'bg-slate-50 text-slate-800 border-slate-300',
        dotClass: 'bg-slate-400',
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
