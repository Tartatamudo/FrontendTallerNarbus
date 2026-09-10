/**
 * Tipos e Interfaces TypeScript para el Módulo de Mantención de Taller.
 * FrontendTallerNarbus / ProtoNeumaticos
 */

// ==================== CATÁLOGOS Y ESTRUCTURAS BÁSICAS ====================

export interface CategoriaFalla {
  id: number;
  nombre: string;
  is_active: boolean;
  falla_id?: number | null;
  falla_nombre?: string | null;
}

export interface FallaItemDTO {
  id: number;
  categoria_id: number;
  nombre: string;
  is_active: boolean;
  categoria?: CategoriaFalla | null;
}

export interface DetalleSolicitudCreateDTO {
  categoria_id?: number | null;
  falla_id?: number | null;
  falla_nombre?: string | null;
  descripcion_personalizada: string;
}

export interface SolicitudCreateDTO {
  n_bus: string;
  bus_id?: number | null;
  descripcion_general?: string | null;
  foto_url?: string | null;
  /** @deprecated Usar fotos[] para soporte multi-evidencia */
  foto?: File | null;
  /** Array de archivos de evidencia. Se envían todos en 1 solo request multipart/form-data bajo la clave 'fotos'. */
  fotos?: File[];
  detalles: DetalleSolicitudCreateDTO[];
}

export interface DetalleSolicitudDTO {
  id: number;
  solicitud_id?: number;
  categoria_id?: number | null;
  categoria_nombre?: string | null;
  falla_id?: number | null;
  falla?: FallaItemDTO | null;
  descripcion_personalizada: string;
  resuelto: boolean;
  fecha_resolucion?: string | null;
  mecanico_id?: number | null;
  mecanico_resolvio_id?: number | null;
  mecanico_resolvio_nombre?: string | null;
  falta_repuesto?: boolean;
  comentario_repuesto?: string | null;
  fecha_bloqueo_repuesto?: string | null;
  mecanicos_asignados?: {
    mecanico_id: number;
    mecanico_nombre: string;
  }[];
}

export interface ComentarioBitacoraDTO {
  id?: number;
  solicitud_id?: number;
  comentario: string;
  tipo?: string; // 'GENERAL' | 'AVANCE' | 'BLOQUEO' | 'TURNO' | 'CIERRE' | 'TECNICO' | 'REPUESTO'
  usuario_id?: number;
  usuario_nombre?: string;
  fecha_registro?: string;
}

// ==================== ASIGNACIONES Y CUADRILLA CRONOMETRADA ====================

/**
 * 4. Registro de tiempos cronometrados por mecánico (incluido en SolicitudDTO)
 */
export interface SolicitudMecanicoDTO {
  id: number;
  solicitud_id: number;
  mecanico_id: number;
  mecanico_nombre?: string | null;
  es_lider_responsable?: boolean;
  is_activo: boolean;
  fecha_asignacion: string; // ISO DateTime (Tiempo de inicio)
  fecha_desasignacion?: string | null; // ISO DateTime (Tiempo de fin)
  duracion_minutos?: number | null; // Minutos exactos trabajados cronometrados
}

/**
 * Registro de una fotografía de evidencia adjunta a una solicitud.
 * Retornado por el backend tras subida a Google Cloud Storage.
 */
export interface SolicitudEvidenciaDTO {
  id: number;
  solicitud_id: number;
  detalle_id?: number | null;
  usuario_id?: number | null;
  url: string; // URL pública de Google Cloud Storage
  original_filename?: string | null;
  size_bytes?: number | null;
  content_type?: string | null;
  fecha_creacion?: string | null;
}

export interface SolicitudDTO {
  id: number;
  n_bus: string;
  bus_id?: number | null;
  bus_patente?: string | null;
  usuario_creador_id?: number;
  usuario_creador_nombre?: string | null;
  mecanico_cierre_id?: number | null;
  mecanico_cierre_nombre?: string | null;
  descripcion_general?: string | null;
  /** URL de la fotografía principal (primera evidencia). Mantenida para retrocompatibilidad. */
  foto_url?: string | null;
  /** Array completo de todas las fotografías de evidencia adjuntas (3NF). */
  evidencias?: SolicitudEvidenciaDTO[];
  estado: string; // 'REPORTADO' | 'PENDIENTE' | 'PENDIENTE_REASIGNACION' | 'EN_REPARACION' | 'FINALIZADO'
  pauta_completada?: boolean;
  total_fallas?: number;
  fallas_resueltas?: number;
  fallas_con_falta_repuesto?: number;
  mecano_lider_id?: number | null;
  colaboradores_ids?: number[];
  detalles?: DetalleSolicitudDTO[];
  mecanicos?: SolicitudMecanicoDTO[];
  comentarios?: ComentarioBitacoraDTO[];
  fecha_creacion?: string;
  fecha_cierre?: string | null;
  motivo_incompleto_checklist?: string | null;
  motivo_cierre_parcial?: string | null;
}

// ==================== TIPOS PAUTA PREVENTIVA (11 ÍTEMS DINÁMICOS) ====================

export interface PautaTallerItemDTO {
  id: number;
  categoria: string;
  item: string;
  orden: number;
  is_active: boolean;
}

export type EstadoPauta = 'OK' | 'DEFECTO' | 'NO_APLICA';

export interface PautaRespuestaDTO {
  id?: number;
  solicitud_id?: number;
  item_id: number;
  item_categoria?: string;
  item_nombre?: string;
  estado: EstadoPauta;
  observacion?: string | null;
  mecanico_id?: number | null;
  mecanico_nombre?: string | null;
  fecha_registro?: string;
}

export interface PautaEstadoResumenDTO {
  total_items: number;
  respondidos: number;
  pendientes: number;
  completado: boolean;
  items_con_defecto: number;
  respuestas: PautaRespuestaDTO[];
}

export interface PautaEvaluacionItemDTO {
  item_id: number;
  estado: EstadoPauta;
  observacion?: string | null;
}

export interface PautaBatchUpdateDTO {
  respuestas: PautaEvaluacionItemDTO[];
}

// ==================== DTOs OPERACIONES TÉCNICAS TALLER ====================

/**
 * 1. DTO para agregar una falla en caliente (NUEVO)
 * Endpoint: POST /api/v1/mantencion/{id}/detalles
 */
export interface AgregarFallaDTO {
  categoria_id?: number | null; // 1: FRENOS, 2: ELECTRICO, 3: MOTOR, 4: CARROCERIA, 5: CLIMATIZACION, 6: OTRO
  falla_id?: number | null; // ID de falla preconfigurada del catálogo técnico maestro
  descripcion_personalizada?: string | null; // Texto libre con la observación del mecánico
  autoasignar?: boolean; // Default: true (se autoasigna al mecánico y pasa la orden a EN_REPARACION)
}

/**
 * 2. DTO para terminar avance grupal (ACTUALIZADO)
 * Endpoint: POST /api/v1/mantencion/{id}/terminar-avance
 */
export interface TerminarAvanceDTO {
  comentario?: string | null; // Novedades o estado en que deja la máquina la cuadrilla
  detalles_ids?: number[] | null; // Opcional: IDs de averías concretas a cerrar. Si se omite, cierra todas las activas
}

/**
 * 3. DTO para finalizar y liberar bus (EXISTENTE)
 * Endpoint: POST /api/v1/mantencion/{id}/finalizar
 */
export interface FinalizarSolicitudDTO {
  comentario_cierre?: string | null;
  motivo_incompleto_checklist?: string | null; // OBLIGATORIO si la pauta tiene ítems pendientes sin responder (incompleta)
  motivo_cierre_parcial?: string | null; // OBLIGATORIO si hay fallas pendientes o con falta de repuesto
  liberar_bus_taller?: boolean; // Default: true (conmuta en_taller = false)
}

export interface AutoasignarFallasDTO {
  detalles_ids: number[];
  colaboradores_ids?: number[];
  comentario?: string;
}

export interface AsignarFallasSupervisoraDTO {
  mecanico_id: number;
  detalles_ids: number[];
  comentario?: string;
}

export interface ReportarRepuestoDTO {
  falta_repuesto: boolean;
  comentario?: string;
}

/**
 * Respuesta devuelta por contratos atómicos (Nivel 3):
 * - PATCH /mantencion/{id}/detalles/{detalle_id}/check
 * - PATCH /mantencion/{id}/detalles/{detalle_id}/repuesto
 */
export interface DetalleUpdateDTO {
  detalle_id: number;
  solicitud_id: number;
  resuelto: boolean;
  falta_repuesto: boolean;
  mecanico_resolvio_id: number | null;
  mecanico_resolvio_nombre: string | null;
  comentario_repuesto: string | null;
  fecha_resolucion: string | null; // Formato ISO 8601 UTC
}

/**
 * Respuesta devuelta por contratos atómicos (Nivel 3):
 * - POST /mantencion/{id}/comentarios
 */
export interface ComentarioAddedDTO {
  comentario_id: number;
  solicitud_id: number;
  usuario_id: number;
  usuario_nombre: string | null;
  tipo: string; // "GENERAL" | "AVANCE" | "ENTREGA_TURNO" | etc.
  comentario: string;
  fecha_registro: string; // Formato ISO 8601 UTC
}

/**
 * Determina si un mecánico específico tiene asignada una orden de trabajo completa
 * o al menos una de sus averías / tareas técnicas.
 */
export function tieneAsignacionMecanico(
  solicitud: SolicitudDTO | null | undefined,
  currentUserId: number | null | undefined
): boolean {
  if (!solicitud || !currentUserId) return false;

  // 1. Mecánico líder de la orden
  if (solicitud.mecano_lider_id === currentUserId) return true;

  // 2. Colaborador registrado en la orden
  if (solicitud.colaboradores_ids && solicitud.colaboradores_ids.includes(currentUserId)) {
    return true;
  }

  // 3. Mecánico con asignación activa en la cuadrilla cronometrada
  if (
    solicitud.mecanicos &&
    solicitud.mecanicos.some(
      (m) => m.mecanico_id === currentUserId && m.is_activo !== false
    )
  ) {
    return true;
  }

  // 4. Mecánico asignado a al menos una avería técnica (detalle) de la OT
  if (solicitud.detalles && solicitud.detalles.length > 0) {
    const tieneDetalle = solicitud.detalles.some((det) => {
      if (det.mecanico_id === currentUserId) return true;
      if (det.mecanico_resolvio_id === currentUserId) return true;
      if (det.mecanicos_asignados && det.mecanicos_asignados.length > 0) {
        return det.mecanicos_asignados.some(
          (ma) =>
            ma.mecanico_id === currentUserId ||
            (ma as unknown as { id?: number }).id === currentUserId
        );
      }
      return false;
    });
    if (tieneDetalle) return true;
  }

  return false;
}


