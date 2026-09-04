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
} from '../../types/mantencion';

export * from '../../types/mantencion';

// ==================== ENDPOINTS ====================

/**
 * 6.1 Obtener Catálogo Maestro de 19 Inspecciones Preventivas (EXCLUSIVO Mecánicos en Taller)
 * GET /api/v1/mantencion/pauta/items
 * Utilizado únicamente por PautaPreventivaModal.tsx para el checklist técnico previo a liberación.
 */
export async function obtenerPautaItems(): Promise<PautaTallerItemDTO[]> {
  const response = await apiClient.get<PautaTallerItemDTO[]>('/api/v1/mantencion/pauta/items');
  return response.data;
}

/**
 * 6.2 Obtener Categorías Activas de Fallas (Formulario de Mantención Chofer)
 * GET /api/v1/mantencion/categorias
 * Utilizado por FormularioMantencionTaller.tsx para agrupar averías reportadas por el conductor.
 */
export async function obtenerCategorias(): Promise<CategoriaFalla[]> {
  const response = await apiClient.get<CategoriaFalla[]>('/api/v1/mantencion/categorias');
  return response.data;
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
 */
export async function crearSolicitud(payload: SolicitudCreateDTO): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>('/api/v1/mantencion/solicitudes', payload);
  return response.data;
}

/**
 * 6.5 Listar Solicitudes Pendientes (Pestaña 1 del Mecánico)
 * GET /api/v1/mantencion/pendientes
 */
export async function obtenerPendientes(): Promise<SolicitudDTO[]> {
  const response = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/pendientes');
  return response.data;
}

/**
 * 6.6 Listar Mis Trabajos (Pestaña 2 del Mecánico)
 * GET /api/v1/mantencion/mis-trabajos
 */
export async function obtenerMisTrabajos(): Promise<SolicitudDTO[]> {
  const response = await apiClient.get<SolicitudDTO[]>('/api/v1/mantencion/mis-trabajos');
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
 * 6.16 Marcar / Desmarcar Check de Falla Resuelta
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
 * 6.17 Reportar Falta de Repuesto en Falla (Bloqueo / Desbloqueo)
 * PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/repuesto
 */
export async function reportarRepuestoFalla(
  id: number,
  detalleId: number,
  faltaRepuesto: boolean,
  comentario?: string
): Promise<SolicitudDTO> {
  const payload: ReportarRepuestoDTO = {
    falta_repuesto: faltaRepuesto,
    comentario,
  };
  const response = await apiClient.patch<SolicitudDTO>(
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
 * 6.19 Agregar Comentario a la Bitácora
 * POST /api/v1/mantencion/{id}/comentarios
 */
export async function agregarComentario(
  id: number,
  comentario: string,
  tipo: string = 'GENERAL'
): Promise<SolicitudDTO> {
  const response = await apiClient.post<SolicitudDTO>(`/api/v1/mantencion/${id}/comentarios`, {
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
