/**
 * Servicio Centralizado de Mantención de Taller (FrontendTallerNarbus / ProtoNeumaticos).
 * Consume endpoints REST del backend FastAPI a través de apiClient.
 */

import { apiClient } from '../api/apiClient';
import type {
  SolicitudDTO,
  AgregarFallaDTO,
  TerminarAvanceDTO,
  FinalizarSolicitudDTO,
  SolicitudCreateDTO,
  PautaTallerItemDTO,
  CategoriaFalla,
  FallaItemDTO,
  PautaEstadoResumenDTO,
  PautaEvaluacionItemDTO,
  ReportarRepuestoDTO,
} from '../types/mantencion';

export * from '../types/mantencion';

// ==================== ENDPOINTS PRINCIPALES (GUÍA TÉCNICA) ====================

/**
 * 1. Agregar una nueva avería a una solicitud existente (Mecánico / Supervisor)
 * Endpoint: POST /api/v1/mantencion/{id}/detalles
 */
export const agregarFallaSolicitud = async (
  solicitudId: number,
  payload: AgregarFallaDTO
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(
    `/api/v1/mantencion/${solicitudId}/detalles`,
    payload
  );
  return data;
};

/**
 * 2. Terminar avance de jornada / turno para toda la cuadrilla
 * Endpoint: POST /api/v1/mantencion/{id}/terminar-avance
 */
export const terminarAvance = async (
  solicitudId: number,
  payload: TerminarAvanceDTO
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(
    `/api/v1/mantencion/${solicitudId}/terminar-avance`,
    payload
  );
  return data;
};

/**
 * 3. Finalizar la orden y liberar el bus de taller
 * Endpoint: POST /api/v1/mantencion/{id}/finalizar
 */
export const finalizarSolicitud = async (
  solicitudId: number,
  payload: FinalizarSolicitudDTO
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(
    `/api/v1/mantencion/${solicitudId}/finalizar`,
    payload
  );
  return data;
};

// ==================== ENDPOINTS COMPLEMENTARIOS DE MANTENCIÓN ====================

/**
 * Obtener Catálogo Maestro de 19 Inspecciones Preventivas
 * GET /api/v1/mantencion/pauta/items
 */
export const obtenerPautaItems = async (): Promise<PautaTallerItemDTO[]> => {
  const { data } = await apiClient.get<PautaTallerItemDTO[]>('/api/v1/mantencion/pauta/items');
  return data;
};

/**
 * Obtener Categorías Activas de Fallas
 * GET /api/v1/mantencion/categorias
 */
export const obtenerCategorias = async (): Promise<CategoriaFalla[]> => {
  const { data } = await apiClient.get<CategoriaFalla[]>('/api/v1/mantencion/categorias');
  return data;
};

/**
 * Obtener Catálogo Maestro de Fallas Simples
 * GET /api/v1/mantencion/fallas
 */
export const obtenerFallas = async (categoriaId?: number): Promise<FallaItemDTO[]> => {
  const { data } = await apiClient.get<FallaItemDTO[]>('/api/v1/mantencion/fallas', {
    params: categoriaId ? { categoria_id: categoriaId } : {},
  });
  return data;
};

/**
 * Crear Solicitud de Mantención (Reporte de Conductor)
 * POST /api/v1/mantencion/solicitudes
 */
export const crearSolicitud = async (payload: SolicitudCreateDTO): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>('/api/v1/mantencion/solicitudes', payload);
  return data;
};

/**
 * Listar Solicitudes Pendientes (Bandeja 1 del Mecánico)
 * GET /api/v1/mantencion/pendientes
 */
export const obtenerPendientes = async (): Promise<SolicitudDTO[]> => {
  const { data } = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/pendientes');
  return data;
};

/**
 * Listar Mis Trabajos (Bandeja 2 del Mecánico)
 * GET /api/v1/mantencion/mis-trabajos
 */
export const obtenerMisTrabajos = async (): Promise<SolicitudDTO[]> => {
  const { data } = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/mis-trabajos');
  return data;
};

/**
 * Obtener Detalle Completo de una Solicitud por ID
 * GET /api/v1/mantencion/{id}
 */
export const obtenerSolicitud = async (id: number): Promise<SolicitudDTO> => {
  const { data } = await apiClient.get<SolicitudDTO>(`/api/v1/mantencion/${id}`);
  return data;
};

/**
 * Consultar Estado de Avance de Pauta Preventiva
 * GET /api/v1/mantencion/{id}/pauta
 */
export const obtenerPautaResumen = async (id: number): Promise<PautaEstadoResumenDTO> => {
  const { data } = await apiClient.get<PautaEstadoResumenDTO>(`/api/v1/mantencion/${id}/pauta`);
  return data;
};

/**
 * Guardar Evaluaciones de la Pauta Preventiva en Bloque
 * POST /api/v1/mantencion/{id}/pauta
 */
export const guardarPautaBatch = async (
  id: number,
  respuestas: PautaEvaluacionItemDTO[]
): Promise<PautaEstadoResumenDTO> => {
  const { data } = await apiClient.post<PautaEstadoResumenDTO>(
    `/api/v1/mantencion/${id}/pauta`,
    { respuestas }
  );
  return data;
};

/**
 * Autoasignación Atómica de Fallas por el Mecánico
 * POST /api/v1/mantencion/{id}/autoasignar
 */
export const autoasignarFallas = async (
  id: number,
  detallesIds: number[],
  colaboradoresIds?: number[],
  comentario?: string
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/autoasignar`, {
    detalles_ids: detallesIds,
    colaboradores_ids: colaboradoresIds && colaboradoresIds.length > 0 ? colaboradoresIds : undefined,
    comentario: comentario?.trim() || undefined,
  });
  return data;
};

/**
 * Asignación Atómica Formal de Fallas por Supervisora
 * POST /api/v1/mantencion/{id}/asignar
 */
export const asignarFallasSupervisora = async (
  id: number,
  mecanicoId: number,
  detallesIds: number[],
  comentario?: string
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/asignar`, {
    mecanico_id: mecanicoId,
    detalles_ids: detallesIds,
    comentario,
  });
  return data;
};

/**
 * Marcar / Desmarcar Check de Falla Resuelta
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/check?resuelto=true
 */
export const marcarCheckDetalle = async (
  id: number,
  detalleId: number,
  resuelto: boolean
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.patch<SolicitudDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/check`,
    null,
    { params: { resuelto } }
  );
  return data;
};

/**
 * Reportar Falta de Repuesto en Falla
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/repuesto
 */
export const reportarRepuestoFalla = async (
  id: number,
  detalleId: number,
  faltaRepuesto: boolean,
  comentario?: string
): Promise<SolicitudDTO> => {
  const payload: ReportarRepuestoDTO = {
    falta_repuesto: faltaRepuesto,
    comentario,
  };
  const { data } = await apiClient.patch<SolicitudDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/repuesto`,
    payload
  );
  return data;
};

/**
 * Agregar Comentario a la Bitácora
 * POST /api/v1/mantencion/{id}/comentarios
 */
export const agregarComentario = async (
  id: number,
  comentario: string,
  tipo: string = 'GENERAL'
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/comentarios`, {
    comentario,
    tipo,
  });
  return data;
};

/**
 * Tomar Trabajo como Líder e Invitar Colaboradores (Flujo tradicional)
 * POST /api/v1/mantencion/{id}/tomar
 */
export const tomarTrabajo = async (
  id: number,
  colaboradores_ids: number[] = [],
  comentario_inicial?: string
): Promise<SolicitudDTO> => {
  const { data } = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/tomar`, {
    colaboradores_ids,
    comentario_inicial,
  });
  return data;
};

/**
 * Finalizar Solicitud Completa (Alias oficial de cierre)
 */
export const finalizarSolicitudCompleta = finalizarSolicitud;

