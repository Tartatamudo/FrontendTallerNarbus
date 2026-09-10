import { apiClient } from '../../api/apiClient';
import type {
  CategoriaFalla,
  FallaItemDTO,
  SolicitudCreateDTO,
  SolicitudDTO,
  PautaTallerItemDTO,
  PautaEstadoResumenDTO,
  PautaEvaluacionItemDTO,
  PautaBatchUpdateDTO,
  AutoasignarFallasDTO,
  AsignarFallasSupervisoraDTO,
  TerminarAvanceDTO,
  ReportarRepuestoDTO,
  FinalizarSolicitudDTO,
  AgregarFallaDTO,
  DetalleUpdateDTO,
  ComentarioAddedDTO,
} from '../../types/mantencion';

export * from '../../types/mantencion';

// ==================== ENDPOINTS ====================

// ==================== CACHÉ EN MEMORIA ====================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let pautaItemsCache: { data: PautaTallerItemDTO[]; timestamp: number } | null = null;
let categoriasCache: { data: CategoriaFalla[]; timestamp: number } | null = null;
let pautaItemsPromise: Promise<PautaTallerItemDTO[]> | null = null;
let categoriasPromise: Promise<CategoriaFalla[]> | null = null;

export function invalidarCacheMantencion(): void {
  pautaItemsCache = null;
  categoriasCache = null;
  pautaItemsPromise = null;
  categoriasPromise = null;
}

/**
 * 6.1 Obtener Catálogo Maestro de Inspecciones Preventivas (11 Ítems) (EXCLUSIVO Mecánicos en Taller)
 * GET /api/v1/mantencion/pauta/items con caché en memoria y deduplicación en vuelo
 */
export async function obtenerPautaItems(forceRefresh: boolean = false): Promise<PautaTallerItemDTO[]> {
  const now = Date.now();
  if (!forceRefresh && pautaItemsCache && now - pautaItemsCache.timestamp < CACHE_TTL_MS) {
    return pautaItemsCache.data;
  }
  if (!forceRefresh && pautaItemsPromise) {
    return pautaItemsPromise;
  }
  pautaItemsPromise = apiClient
    .get<PautaTallerItemDTO[]>('/api/v1/mantencion/pauta/items')
    .then((response) => {
      pautaItemsCache = { data: response.data, timestamp: Date.now() };
      pautaItemsPromise = null;
      return response.data;
    })
    .catch((err) => {
      pautaItemsPromise = null;
      throw err;
    });
  return pautaItemsPromise;
}

/**
 * 6.2 Obtener Categorías Activas de Fallas con falla_id y falla_nombre (Formulario de Mantención Chofer)
 * GET /api/v1/mantencion/categorias con caché en memoria y deduplicación en vuelo
 * Utilizado por FormularioMantencionTaller.tsx para vincular directamente categoria_id y falla_id.
 */
export async function obtenerCategorias(forceRefresh: boolean = false): Promise<CategoriaFalla[]> {
  const now = Date.now();
  if (!forceRefresh && categoriasCache && now - categoriasCache.timestamp < CACHE_TTL_MS) {
    return categoriasCache.data;
  }
  if (!forceRefresh && categoriasPromise) {
    return categoriasPromise;
  }
  categoriasPromise = apiClient
    .get<CategoriaFalla[]>('/api/v1/mantencion/categorias')
    .then((response) => {
      categoriasCache = { data: response.data, timestamp: Date.now() };
      categoriasPromise = null;
      return response.data;
    })
    .catch((err) => {
      categoriasPromise = null;
      throw err;
    });
  return categoriasPromise;
}

/**
 * 6.3 Obtener Catálogo Maestro de Fallas Simples (Formulario de Mantención Chofer)
 * GET /api/v1/mantencion/fallas?categoria_id=...
 * Utilizado por FormularioMantencionTaller.tsx para el listado ágil de averías que el chofer marca al ingresar el bus.
 */
export async function obtenerFallas(categoriaId?: number): Promise<FallaItemDTO[]> {
  const response = await apiClient.get<FallaItemDTO[]>('/api/v1/mantencion/fallas', {
    params: categoriaId ? { categoria_id: categoriaId } : {},
  });
  return response.data;
}

/**
 * 6.4 Crear Solicitud de Mantención (Reportar Bus)
 * POST /api/v1/mantencion/solicitudes
 *
 * Soporte Dual Atómico:
 * 1. Si payload.fotos[] (o legacy payload.foto) está presente: Se envía como multipart/form-data en 1 solo request HTTP.
 *    El backend transfiere directamente a Google Cloud Storage, crea los registros en taller_solicitud_evidencias
 *    y retorna el SolicitudDTO con foto_url (primera foto) + evidencias[] (todas las fotos).
 * 2. Si no hay archivos binarios: Se envía como payload tradicional application/json.
 */
export async function crearSolicitud(payload: SolicitudCreateDTO): Promise<SolicitudDTO> {
  // Normalizar: si se pasó el campo legacy `foto`, envolverlo en array
  const archivos: File[] = [];
  if (payload.fotos && payload.fotos.length > 0) {
    archivos.push(...payload.fotos);
  } else if (payload.foto) {
    archivos.push(payload.foto);
  }

  if (archivos.length > 0) {
    const formData = new FormData();
    formData.append('n_bus', payload.n_bus);
    if (payload.bus_id) {
      formData.append('bus_id', String(payload.bus_id));
    }
    if (payload.descripcion_general) {
      formData.append('descripcion_general', payload.descripcion_general);
    }
    // Adjuntar cada archivo bajo la clave 'fotos' (el backend acepta también 'foto' singular)
    archivos.forEach((file) => {
      formData.append('fotos', file);
    });
    if (payload.detalles && payload.detalles.length > 0) {
      formData.append('detalles', JSON.stringify(payload.detalles));
    }

    const response = await apiClient.post<SolicitudDTO>(
      '/api/v1/mantencion/solicitudes',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  const response = await apiClient.post<SolicitudDTO>('/api/v1/mantencion/solicitudes', {
    n_bus: payload.n_bus,
    bus_id: payload.bus_id ?? null,
    descripcion_general: payload.descripcion_general ?? null,
    foto_url: payload.foto_url ?? null,
    detalles: payload.detalles,
  });
  return response.data;
}

/**
 * 6.5 Listar Solicitudes Pendientes (Pestaña 1 del Mecánico con paginación)
 * GET /api/v1/mantencion/pendientes?limit=20&skip=0
 */
export async function obtenerPendientes(limit: number = 20, skip: number = 0): Promise<SolicitudDTO[]> {
  const response = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/pendientes', {
    params: { limit, skip },
  });
  return response.data;
}

/**
 * 6.6 Listar Mis Trabajos (Pestaña 2 del Mecánico con paginación)
 * GET /api/v1/mantencion/mis-trabajos?limit=20&skip=0
 */
export async function obtenerMisTrabajos(limit: number = 20, skip: number = 0): Promise<SolicitudDTO[]> {
  const response = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/mis-trabajos', {
    params: { limit, skip },
  });
  return response.data;
}

/**
 * 6.7 Obtener Detalle Completo de una Solicitud por ID
 * GET /api/v1/mantencion/{id}
 */
export async function obtenerSolicitud(id: number): Promise<SolicitudDTO> {
  const response = await apiClient.get<SolicitudDTO>(`/api/v1/mantencion/${id}`);
  return response.data;
}

/**
 * 6.8 Consultar Estado de Avance y Respuestas de la Pauta Preventiva
 * GET /api/v1/mantencion/{id}/pauta
 */
export async function obtenerPautaResumen(id: number): Promise<PautaEstadoResumenDTO> {
  const response = await apiClient.get<PautaEstadoResumenDTO>(`/api/v1/mantencion/${id}/pauta`);
  return response.data;
}

/**
 * 6.9 Guardar o Actualizar Evaluaciones de la Pauta Preventiva en Bloque
 * POST /api/v1/mantencion/{id}/pauta
 */
export async function guardarPautaBatch(
  id: number,
  respuestas: PautaEvaluacionItemDTO[]
): Promise<PautaEstadoResumenDTO> {
  const payload: PautaBatchUpdateDTO = { respuestas };
  const response = await apiClient.post<PautaEstadoResumenDTO>(`/api/v1/mantencion/${id}/pauta`, payload);
  return response.data;
}

/**
 * 6.10 Autoasignación Atómica de Fallas por el Mecánico
 * POST /api/v1/mantencion/{id}/autoasignar
 */
export async function autoasignarFallas(
  id: number,
  detallesIds: number[],
  colaboradoresIds?: number[],
  comentario?: string
): Promise<SolicitudDTO> {
  const payload: AutoasignarFallasDTO = {
    detalles_ids: detallesIds,
    colaboradores_ids: colaboradoresIds && colaboradoresIds.length > 0 ? colaboradoresIds : undefined,
    comentario: comentario?.trim() || undefined,
  };
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/autoasignar`, payload);
  return response.data;
}

/**
 * 6.11 Asignación Atómica Formal de Fallas por Supervisora
 * POST /api/v1/mantencion/{id}/asignar
 */
export async function asignarFallasSupervisora(
  id: number,
  mecanicoId: number,
  detallesIds: number[],
  comentario?: string
): Promise<SolicitudDTO> {
  const payload: AsignarFallasSupervisoraDTO = {
    mecanico_id: mecanicoId,
    detalles_ids: detallesIds,
    comentario,
  };
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/asignar`, payload);
  return response.data;
}

/**
 * 6.12b Agregar una nueva avería a una solicitud existente (Mecánico / Supervisor)
 * POST /api/v1/mantencion/{id}/detalles
 */
export async function agregarFallaSolicitud(
  solicitudId: number,
  payload: AgregarFallaDTO
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(
    `/api/v1/mantencion/${solicitudId}/detalles`,
    payload
  );
  return response.data;
}

/**
 * 6.12 Término de Avance / Cierre Grupal de Turno
 * POST /api/v1/mantencion/{id}/terminar-avance
 */
export async function terminarAvance(
  id: number,
  payloadOrDetalles?: TerminarAvanceDTO | number[],
  comentario?: string
): Promise<SolicitudDTO> {
  let payload: TerminarAvanceDTO;
  if (payloadOrDetalles && typeof payloadOrDetalles === 'object' && !Array.isArray(payloadOrDetalles)) {
    payload = payloadOrDetalles;
  } else {
    payload = {
      detalles_ids: Array.isArray(payloadOrDetalles) ? payloadOrDetalles : undefined,
      comentario: comentario?.trim() || null,
    };
  }
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/terminar-avance`, payload);
  return response.data;
}

/**
 * 6.13 Tomar Trabajo como Líder e Invitar Colaboradores (Flujo tradicional)
 * POST /api/v1/mantencion/{id}/tomar
 */
export async function tomarTrabajo(
  id: number,
  colaboradores_ids: number[] = [],
  comentario_inicial?: string
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/tomar`, {
    colaboradores_ids,
    comentario_inicial,
  });
  return response.data;
}

/**
 * 6.14 Desasignación Individual de Mecánico ("Salir del equipo")
 * POST /api/v1/mantencion/{id}/desasignarme?comentario=...
 */
export async function desasignarme(id: number, comentario?: string): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/desasignarme`, null, {
    params: comentario ? { comentario } : {},
  });
  return response.data;
}

/**
 * 6.15 Liberar / Entregar Turno del Equipo Completo
 * POST /api/v1/mantencion/{id}/liberar-turno
 */
export async function liberarTurno(id: number, comentario: string): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/liberar-turno`, {
    comentario,
  });
  return response.data;
}

/**
 * 6.16 Marcar / Desmarcar Check de Falla Resuelta (Contrato Atómico Nivel 3)
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/check?resuelto=true
 */
export async function marcarCheckDetalle(
  id: number,
  detalleId: number,
  resuelto: boolean
): Promise<DetalleUpdateDTO> {
  const response = await apiClient.patch<DetalleUpdateDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/check`,
    null,
    { params: { resuelto } }
  );
  return response.data;
}

/**
 * 6.17 Reportar Falta de Repuesto en Falla (Contrato Atómico Nivel 3)
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/repuesto
 */
export async function reportarRepuestoFalla(
  id: number,
  detalleId: number,
  faltaRepuesto: boolean,
  comentario?: string
): Promise<DetalleUpdateDTO> {
  const payload: ReportarRepuestoDTO = {
    falta_repuesto: faltaRepuesto,
    comentario,
  };
  const response = await apiClient.patch<DetalleUpdateDTO>(
    `/api/v1/mantencion/${id}/detalles/${detalleId}/repuesto`,
    payload
  );
  return response.data;
}

/**
 * 6.18 Agregar Colaborador en Caliente (Estando EN_REPARACION)
 * POST /api/v1/mantencion/{id}/agregar-colaborador
 */
export async function agregarColaborador(
  id: number,
  colaboradorId?: number,
  colaboradorNombre?: string
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/agregar-colaborador`, {
    colaborador_id: colaboradorId,
    colaborador_nombre: colaboradorNombre,
  });
  return response.data;
}

/**
 * 6.19 Agregar Comentario a la Bitácora (Contrato Atómico Nivel 3)
 * POST /api/v1/mantencion/{id}/comentarios
 */
export async function agregarComentario(
  id: number,
  comentario: string,
  tipo: string = 'GENERAL'
): Promise<ComentarioAddedDTO> {
  const response = await apiClient.post<ComentarioAddedDTO>(`/api/v1/mantencion/${id}/comentarios`, {
    comentario,
    tipo,
  });
  return response.data;
}

/**
 * 6.20 Finalizar Orden y Liberar Bus (Validando checklist y fallas pendientes)
 * POST /api/v1/mantencion/{id}/finalizar
 */
export async function finalizarSolicitudCompleta(
  id: number,
  payload: FinalizarSolicitudDTO
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/finalizar`, payload);
  return response.data;
}

/**
 * 6.20b Finalizar la orden y liberar el bus de taller (Nombre oficial en guía backend)
 * POST /api/v1/mantencion/{id}/finalizar
 */
export const finalizarSolicitud = finalizarSolicitudCompleta;

/**
 * Alias de compatibilidad hacia finalizarSolicitudCompleta
 */
export async function finalizarOrden(
  id: number,
  comentario_cierre: string,
  motivoIncompletoChecklist?: string | null,
  motivoCierreParcial?: string | null,
  liberarBusTaller = true
): Promise<SolicitudDTO> {
  return finalizarSolicitudCompleta(id, {
    comentario_cierre,
    motivo_incompleto_checklist: motivoIncompletoChecklist,
    motivo_cierre_parcial: motivoCierreParcial,
    liberar_bus_taller: liberarBusTaller,
  });
}

/**
 * 6.21 Liberar Solicitud (Alias semántico de finalización y liberación)
 * POST /api/v1/mantencion/{id}/liberar
 */
export async function liberarSolicitud(
  id: number,
  payload: FinalizarSolicitudDTO
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/liberar`, payload);
  return response.data;
}
