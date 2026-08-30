import { apiClient } from '../../api/apiClient';

export interface CategoriaFalla {
  id: number;
  nombre: string;
  is_active: boolean;
}

export interface FallaItemDTO {
  id: number;
  categoria_id: number;
  nombre: string;
  is_active: boolean;
}

export interface DetalleSolicitudCreateDTO {
  falla_id?: number | null;
  descripcion_personalizada: string;
}

export interface SolicitudCreateDTO {
  n_bus: string;
  descripcion_general?: string | null;
  foto_url?: string | null;
  detalles: DetalleSolicitudCreateDTO[];
}

export interface DetalleSolicitudDTO {
  id: number;
  falla_id?: number | null;
  descripcion_personalizada: string;
  resuelto: boolean;
  fecha_resolucion?: string | null;
  mecanico_id?: number | null;
}

export interface ComentarioBitacoraDTO {
  id?: number;
  comentario: string;
  tipo?: string;
  usuario_id?: number;
  fecha_registro?: string;
}

export interface SolicitudMecanicoDTO {
  id: number;
  solicitud_id: number;
  mecanico_id: number;
  mecanico_nombre?: string | null;
  es_lider_responsable: boolean;
  is_activo: boolean;
  fecha_asignacion?: string;
  fecha_desasignacion?: string | null;
}

export interface SolicitudDTO {
  id: number;
  n_bus: string;
  descripcion_general?: string | null;
  foto_url?: string | null;
  estado: string; // 'REPORTADO' | 'PENDIENTE_REASIGNACION' | 'EN_REPARACION' | 'FINALIZADO'
  mecano_lider_id?: number | null;
  colaboradores_ids?: number[];
  detalles?: DetalleSolicitudDTO[];
  mecanicos?: SolicitudMecanicoDTO[];
  comentarios?: ComentarioBitacoraDTO[];
  fecha_creacion?: string;
}

/**
 * 2.1 Obtener Categorías Activas de Fallas
 * GET /api/v1/mantencion/categorias
 */
export async function obtenerCategorias(): Promise<CategoriaFalla[]> {
  const response = await apiClient.get<CategoriaFalla[]>('/api/v1/mantencion/categorias');
  return response.data;
}

/**
 * 2.2 Obtener Catálogo Maestro de Fallas
 * GET /api/v1/mantencion/fallas?categoria_id=...
 */
export async function obtenerFallas(categoriaId?: number): Promise<FallaItemDTO[]> {
  const response = await apiClient.get<FallaItemDTO[]>('/api/v1/mantencion/fallas', {
    params: categoriaId ? { categoria_id: categoriaId } : {}
  });
  return response.data;
}

/**
 * 2.3 Crear Solicitud de Mantención (Reportar Bus)
 * POST /api/v1/mantencion/solicitudes
 */
export async function crearSolicitud(payload: SolicitudCreateDTO): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>('/api/v1/mantencion/solicitudes', payload);
  return response.data;
}

/**
 * 2.4 Listar Solicitudes Pendientes (Pestaña 1 del Mecánico)
 * GET /api/v1/mantencion/pendientes
 */
export async function obtenerPendientes(): Promise<SolicitudDTO[]> {
  const response = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/pendientes');
  return response.data;
}

/**
 * 2.5 Listar Mis Trabajos (Pestaña 2 del Mecánico)
 * GET /api/v1/mantencion/mis-trabajos
 */
export async function obtenerMisTrabajos(): Promise<SolicitudDTO[]> {
  const response = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/mis-trabajos');
  return response.data;
}

/**
 * 2.6 Obtener Detalle Completo de una Solicitud por ID
 * GET /api/v1/mantencion/{id}
 */
export async function obtenerSolicitud(id: number): Promise<SolicitudDTO> {
  const response = await apiClient.get<SolicitudDTO>(`/api/v1/mantencion/${id}`);
  return response.data;
}

/**
 * 2.7 Tomar Trabajo como Líder e Invitar Colaboradores
 * POST /api/v1/mantencion/{id}/tomar
 */
export async function tomarTrabajo(
  id: number,
  colaboradores_ids: number[] = [],
  comentario_inicial?: string
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/tomar`, {
    colaboradores_ids,
    comentario_inicial
  });
  return response.data;
}

/**
 * 2.8 Desasignación Individual de Mecánico ("Salir del equipo")
 * POST /api/v1/mantencion/{id}/desasignarme?comentario=...
 */
export async function desasignarme(id: number, comentario?: string): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/desasignarme`, null, {
    params: comentario ? { comentario } : {}
  });
  return response.data;
}

/**
 * 2.9 Liberar / Entregar Turno del Equipo Completo
 * POST /api/v1/mantencion/{id}/liberar-turno
 */
export async function liberarTurno(id: number, comentario: string): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/liberar-turno`, {
    comentario
  });
  return response.data;
}

/**
 * 2.10 Marcar / Desmarcar Check de Falla Resuelta
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/check?resuelto=true
 */
export async function marcarCheckDetalle(
  id: number,
  detalleId: number,
  resuelto: boolean
): Promise<SolicitudDTO> {
  const response = await apiClient.patch<SolicitudDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/check`,
    null,
    { params: { resuelto } }
  );
  return response.data;
}

/**
 * 2.11 Agregar Comentario a la Bitácora
 * POST /api/v1/mantencion/{id}/comentarios
 */
export async function agregarComentario(
  id: number,
  comentario: string,
  tipo: string = 'REPUESTO'
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/comentarios`, {
    comentario,
    tipo
  });
  return response.data;
}

/**
 * 2.12 Finalizar Orden y Liberar Bus
 * POST /api/v1/mantencion/{id}/finalizar
 */
export async function finalizarOrden(id: number, comentario_cierre: string): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/finalizar`, {
    comentario_cierre
  });
  return response.data;
}

/**
 * 2.13 Agregar Colaborador en Caliente (Estando EN_REPARACION)
 * POST /api/v1/mantencion/{id}/agregar-colaborador
 */
export async function agregarColaborador(
  id: number,
  colaboradorId?: number,
  colaboradorNombre?: string
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/agregar-colaborador`, {
    colaborador_id: colaboradorId,
    colaborador_nombre: colaboradorNombre
  });
  return response.data;
}
