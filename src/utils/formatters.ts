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
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-200',
        border: 'border-emerald-400/60',
        badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.35)] [data-theme=light]_&:bg-emerald-100 [data-theme=light]_&:text-emerald-800 [data-theme=light]_&:border-emerald-300 [data-theme=light]_&:shadow-none',
        dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] [data-theme=light]_&:bg-emerald-600 [data-theme=light]_&:shadow-none',
        label,
      };
    case 'EN_REPARACION':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-200',
        border: 'border-amber-400/60',
        badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.35)] [data-theme=light]_&:bg-amber-100 [data-theme=light]_&:text-amber-900 [data-theme=light]_&:border-amber-300 [data-theme=light]_&:shadow-none',
        dotClass: 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)] [data-theme=light]_&:bg-amber-500 [data-theme=light]_&:shadow-none',
        label,
      };
    case 'PENDIENTE_REASIGNACION':
      return {
        bg: 'bg-purple-500/20',
        text: 'text-purple-200',
        border: 'border-purple-400/60',
        badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-400/60 shadow-[0_0_10px_rgba(192,132,252,0.35)] [data-theme=light]_&:bg-purple-100 [data-theme=light]_&:text-purple-800 [data-theme=light]_&:border-purple-300 [data-theme=light]_&:shadow-none',
        dotClass: 'bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)] [data-theme=light]_&:bg-purple-500 [data-theme=light]_&:shadow-none',
        label,
      };
    case 'PENDIENTE':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-200',
        border: 'border-blue-400/60',
        badgeClass: 'bg-blue-500/20 text-blue-200 border-blue-400/60 shadow-[0_0_10px_rgba(96,165,250,0.35)] [data-theme=light]_&:bg-blue-100 [data-theme=light]_&:text-blue-800 [data-theme=light]_&:border-blue-300 [data-theme=light]_&:shadow-none',
        dotClass: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] [data-theme=light]_&:bg-blue-500 [data-theme=light]_&:shadow-none',
        label,
      };
    case 'REPORTADO':
      return {
        bg: 'bg-sky-500/20',
        text: 'text-sky-200',
        border: 'border-sky-400/60',
        badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.35)] [data-theme=light]_&:bg-sky-100 [data-theme=light]_&:text-sky-800 [data-theme=light]_&:border-sky-300 [data-theme=light]_&:shadow-none',
        dotClass: 'bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)] [data-theme=light]_&:bg-sky-500 [data-theme=light]_&:shadow-none',
        label,
      };
    default:
      return {
        bg: 'bg-slate-500/20',
        text: 'text-slate-200',
        border: 'border-slate-400/50',
        badgeClass: 'bg-slate-500/20 text-slate-200 border-slate-400/50 shadow-[0_0_8px_rgba(148,163,184,0.2)] [data-theme=light]_&:bg-slate-100 [data-theme=light]_&:text-slate-800 [data-theme=light]_&:border-slate-300 [data-theme=light]_&:shadow-none',
        dotClass: 'bg-slate-400 [data-theme=light]_&:bg-slate-500',
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
