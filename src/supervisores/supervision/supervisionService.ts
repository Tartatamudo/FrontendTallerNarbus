import { apiClient } from '../../api/apiClient';

export interface AlertaSupervisionDTO {
  tipo: 'REPUESTO_FALTANTE' | 'DEFECTO_PAUTA' | 'BUS_SIN_MECANICOS' | string;
  severidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA' | string;
  solicitud_id: number;
  n_bus: string;
  mensaje: string;
  detalle_id?: number | null;
  fecha_deteccion?: string;
}

export interface MetricasEstadoDTO {
  total_solicitudes: number;
  reportadas: number;
  pendientes?: number;
  en_reparacion: number;
  pendiente_reasignacion: number;
  finalizadas: number;
  buses_fisicamente_en_taller?: number;
  fallas_bloqueadas_por_repuesto?: number;
}

export interface FallaPorCategoriaDTO {
  categoria_id: number | null;
  categoria_nombre: string;
  total_fallas: number;
}

export interface ResumenTallerDTO {
  fecha_generacion: string;
  metricas_estado: MetricasEstadoDTO;
  porcentaje_resolucion_fallas: number;
  total_fallas_registradas: number;
  total_fallas_resueltas: number;
  fallas_por_categoria: FallaPorCategoriaDTO[];
  buses_activos_taller: string[];
  alertas?: AlertaSupervisionDTO[];
}

export interface CategoriaFallaAuditoriaDTO {
  id: number;
  nombre: string;
  is_active: boolean;
}

export interface FallaAuditoriaDTO {
  id: number;
  categoria_id: number;
  nombre: string;
  is_active: boolean;
  categoria?: CategoriaFallaAuditoriaDTO | null;
}

export interface DetalleFallaAuditoriaDTO {
  id: number;
  solicitud_id: number;
  falla_id?: number | null;
  falla?: FallaAuditoriaDTO | null;
  descripcion_personalizada?: string | null;
  resuelto: boolean;
  mecanico_resolvio_id?: number | null;
  mecanico_resolvio_nombre?: string | null;
  falta_repuesto?: boolean;
  comentario_repuesto?: string | null;
  fecha_creacion: string;
  fecha_resolucion?: string | null;
}

export interface MecanicoAuditoriaDTO {
  id: number;
  solicitud_id: number;
  mecanico_id: number;
  mecanico_nombre: string;
  es_lider_responsable: boolean;
  is_activo: boolean;
  fecha_asignacion: string;
  fecha_desasignacion?: string | null;
}

export interface ComentarioAuditoriaDTO {
  id: number;
  solicitud_id: number;
  usuario_id: number;
  usuario_nombre: string;
  tipo: string;
  comentario: string;
  fecha_registro: string;
}

export interface AuditoriaBusTallerDTO {
  id: number;
  n_bus: string;
  bus_id?: number | null;
  usuario_creador_id: number;
  usuario_creador_nombre: string;
  mecanico_cierre_id?: number | null;
  mecanico_cierre_nombre?: string | null;
  estado: string;
  descripcion_general?: string | null;
  foto_url?: string | null;
  /** Array completo de todas las fotografías de evidencia adjuntas (3NF). */
  evidencias?: import('../../types/mantencion').SolicitudEvidenciaDTO[];
  fecha_creacion: string;
  fecha_cierre?: string | null;
  motivo_incompleto_checklist?: string | null;
  motivo_cierre_parcial?: string | null;
  detalles: DetalleFallaAuditoriaDTO[];
  mecanicos: MecanicoAuditoriaDTO[];
  comentarios: ComentarioAuditoriaDTO[];
}

export interface AuditoriaFiltros {
  n_bus?: string;
  estado?: string;
  mecanico_id?: number;
  mecanico_nombre?: string;
  skip?: number;
  limit?: number;
}

export interface AsignarFallasPayloadDTO {
  mecanico_id: number;
  detalles_ids: number[];
  comentario?: string;
}

/**
 * 7.1 Centro de Alertas en vivo para la supervisora
 * GET /api/v1/supervision/alertas
 */
export async function obtenerAlertasSupervision(): Promise<AlertaSupervisionDTO[]> {
  const response = await apiClient.get<AlertaSupervisionDTO[]>('/api/v1/supervision/alertas');
  return response.data;
}

/**
 * 7.2 Tablero de auditoría y trazabilidad exhaustiva en vivo con paginación y filtros
 * GET /api/v1/supervision/auditoria/buses-taller?skip=0&limit=20
 */
export async function obtenerAuditoriaBusesTaller(filtros?: AuditoriaFiltros): Promise<AuditoriaBusTallerDTO[]> {
  const params: Record<string, any> = {};
  if (filtros?.n_bus?.trim()) {
    params.n_bus = filtros.n_bus.trim();
  }
  if (filtros?.estado) {
    params.estado = filtros.estado;
  }
  if (filtros?.mecanico_nombre?.trim()) {
    params.mecanico_nombre = filtros.mecanico_nombre.trim();
  }
  if (filtros?.mecanico_id) {
    params.mecanico_id = filtros.mecanico_id;
  }
  if (filtros?.skip !== undefined) {
    params.skip = filtros.skip;
  }
  if (filtros?.limit !== undefined) {
    params.limit = filtros.limit;
  }

  const response = await apiClient.get<AuditoriaBusTallerDTO[]>('/api/v1/supervision/auditoria/buses-taller', { params });
  return response.data;
}

/**
 * 7.3 Dashboard ejecutivo con métricas de taller y KPIs
 * GET /api/v1/supervision/resumen-taller
 */
export async function obtenerResumenTaller(): Promise<ResumenTallerDTO> {
  const response = await apiClient.get<ResumenTallerDTO>('/api/v1/supervision/resumen-taller');
  return response.data;
}

/**
 * 7.4 Asignación directa de fallas por la supervisora
 * POST /api/v1/supervision/solicitudes/{id}/asignar
 */
export async function asignarDesdeSupervision(
  solicitudId: number,
  payload: AsignarFallasPayloadDTO
): Promise<any> {
  const response = await apiClient.post(`/api/v1/supervision/solicitudes/${solicitudId}/asignar`, payload);
  return response.data;
}
