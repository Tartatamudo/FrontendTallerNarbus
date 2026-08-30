import { apiClient } from '../../api/apiClient';

export interface MetricasEstadoDTO {
  total_solicitudes: number;
  reportadas: number;
  en_reparacion: number;
  pendiente_reasignacion: number;
  finalizadas: number;
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
  usuario_creador_id: number;
  usuario_creador_nombre: string;
  mecanico_cierre_id?: number | null;
  mecanico_cierre_nombre?: string | null;
  estado: string;
  descripcion_general?: string | null;
  foto_url?: string | null;
  fecha_creacion: string;
  fecha_cierre?: string | null;
  detalles: DetalleFallaAuditoriaDTO[];
  mecanicos: MecanicoAuditoriaDTO[];
  comentarios: ComentarioAuditoriaDTO[];
}

export interface AuditoriaFiltros {
  n_bus?: string;
  estado?: string;
  mecanico_id?: number;
  mecanico_nombre?: string;
}

/**
 * GET /api/v1/supervision/resumen-taller
 * Retorna las métricas clave y KPIs del taller en tiempo real.
 */
export async function obtenerResumenTaller(): Promise<ResumenTallerDTO> {
  const response = await apiClient.get<ResumenTallerDTO>('/api/v1/supervision/resumen-taller');
  return response.data;
}

/**
 * GET /api/v1/supervision/auditoria/buses-taller
 * Retorna la trazabilidad inmutable de solicitudes en taller con filtros opcionales.
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

  const response = await apiClient.get<AuditoriaBusTallerDTO[]>('/api/v1/supervision/auditoria/buses-taller', { params });
  return response.data;
}
