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
  DetalleUpdateDTO,
  ComentarioAddedDTO,
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

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
let pautaItemsCache: { data: PautaTallerItemDTO[]; timestamp: number } | null = null;
let categoriasCache: { data: CategoriaFalla[]; timestamp: number } | null = null;
let pautaItemsPromise: Promise<PautaTallerItemDTO[]> | null = null;
let categoriasPromise: Promise<CategoriaFalla[]> | null = null;

export const invalidarCacheMantencionService = (): void => {
  pautaItemsCache = null;
  categoriasCache = null;
  pautaItemsPromise = null;
  categoriasPromise = null;
};

/**
 * Obtener Catálogo Maestro de Inspecciones Preventivas (11 Ítems) con caché en memoria y deduplicación en vuelo
 * GET /api/v1/mantencion/pauta/items
 */
export const obtenerPautaItems = async (forceRefresh: boolean = false): Promise<PautaTallerItemDTO[]> => {
  const now = Date.now();
  if (!forceRefresh && pautaItemsCache && now - pautaItemsCache.timestamp < CACHE_TTL_MS) {
    return pautaItemsCache.data;
  }
  if (!forceRefresh && pautaItemsPromise) {
    return pautaItemsPromise;
  }
  pautaItemsPromise = apiClient
    .get<PautaTallerItemDTO[]>('/api/v1/mantencion/pauta/items')
    .then(({ data }) => {
      pautaItemsCache = { data, timestamp: Date.now() };
      pautaItemsPromise = null;
      return data;
    })
    .catch((err) => {
      pautaItemsPromise = null;
      throw err;
    });
  return pautaItemsPromise;
};

/**
 * Obtener Categorías Activas de Fallas con falla_id y falla_nombre con caché en memoria y deduplicación en vuelo
 * GET /api/v1/mantencion/categorias
 */
export const obtenerCategorias = async (forceRefresh: boolean = false): Promise<CategoriaFalla[]> => {
  const now = Date.now();
  if (!forceRefresh && categoriasCache && now - categoriasCache.timestamp < CACHE_TTL_MS) {
    return categoriasCache.data;
  }
  if (!forceRefresh && categoriasPromise) {
    return categoriasPromise;
  }
  categoriasPromise = apiClient
    .get<CategoriaFalla[]>('/api/v1/mantencion/categorias')
    .then(({ data }) => {
      categoriasCache = { data, timestamp: Date.now() };
      categoriasPromise = null;
      return data;
    })
    .catch((err) => {
      categoriasPromise = null;
      throw err;
    });
  return categoriasPromise;
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
 *
 * Soporte Dual Atómico:
 * 1. Si payload.foto (File) está presente: Se envía como multipart/form-data en 1 solo request HTTP.
 *    El backend transfiere directamente a Google Cloud Storage y asocia la foto_url resultante.
 * 2. Si no hay archivo binario: Se envía como payload tradicional application/json.
 */
export const crearSolicitud = async (payload: SolicitudCreateDTO): Promise<SolicitudDTO> => {
  if (payload.foto) {
    const formData = new FormData();
    formData.append('n_bus', payload.n_bus);
    if (payload.bus_id) {
      formData.append('bus_id', String(payload.bus_id));
    }
    if (payload.descripcion_general) {
      formData.append('descripcion_general', payload.descripcion_general);
    }
    formData.append('foto', payload.foto);
    if (payload.detalles && payload.detalles.length > 0) {
      formData.append('detalles', JSON.stringify(payload.detalles));
    }

    const { data } = await apiClient.post<SolicitudDTO>(
      '/api/v1/mantencion/solicitudes',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  const { data } = await apiClient.post<SolicitudDTO>('/api/v1/mantencion/solicitudes', {
    n_bus: payload.n_bus,
    bus_id: payload.bus_id ?? null,
    descripcion_general: payload.descripcion_general ?? null,
    foto_url: payload.foto_url ?? null,
    detalles: payload.detalles,
  });
  return data;
};

/**
 * Listar Solicitudes Pendientes (Bandeja 1 del Mecánico con paginación)
 * GET /api/v1/mantencion/pendientes?limit=20&skip=0
 */
export const obtenerPendientes = async (limit: number = 20, skip: number = 0): Promise<SolicitudDTO[]> => {
  const { data } = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/pendientes', {
    params: { limit, skip },
  });
  return data;
};

/**
 * Listar Mis Trabajos (Bandeja 2 del Mecánico con paginación)
 * GET /api/v1/mantencion/mis-trabajos?limit=20&skip=0
 */
export const obtenerMisTrabajos = async (limit: number = 20, skip: number = 0): Promise<SolicitudDTO[]> => {
  const { data } = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/mis-trabajos', {
    params: { limit, skip },
  });
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
 * Marcar / Desmarcar Check de Falla Resuelta (Contrato Atómico Nivel 3)
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/check?resuelto=true
 */
export const marcarCheckDetalle = async (
  id: number,
  detalleId: number,
  resuelto: boolean
): Promise<DetalleUpdateDTO> => {
  const { data } = await apiClient.patch<DetalleUpdateDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/check`,
    null,
    { params: { resuelto } }
  );
  return data;
};

/**
 * Reportar Falta de Repuesto en Falla (Contrato Atómico Nivel 3)
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/repuesto
 */
export const reportarRepuestoFalla = async (
  id: number,
  detalleId: number,
  faltaRepuesto: boolean,
  comentario?: string
): Promise<DetalleUpdateDTO> => {
  const payload: ReportarRepuestoDTO = {
    falta_repuesto: faltaRepuesto,
    comentario,
  };
  const { data } = await apiClient.patch<DetalleUpdateDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/repuesto`,
    payload
  );
  return data;
};

/**
 * Agregar Comentario a la Bitácora (Contrato Atómico Nivel 3)
 * POST /api/v1/mantencion/{id}/comentarios
 */
export const agregarComentario = async (
  id: number,
  comentario: string,
  tipo: string = 'GENERAL'
): Promise<ComentarioAddedDTO> => {
  const { data } = await apiClient.post<ComentarioAddedDTO>(`/api/v1/mantencion/${id}/comentarios`, {
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

