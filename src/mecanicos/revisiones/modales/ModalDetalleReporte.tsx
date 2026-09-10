import { useEffect } from 'react';
import {
  X,
  Bus,
  Clock,
  ClipboardCheck,
  FileText,
  PackageX,
  PackageCheck,
  CheckSquare,
  Square,
  Play,
  UserCheck,
  Camera,
  Users,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  FileCheck,
  Plus,
  MessageSquare
} from 'lucide-react';
import type { SolicitudDTO, PautaEstadoResumenDTO } from '../../../services/mantencionService';
import { formatearFechaHora } from '../../../utils/formatters';
import { getFullImageUrl } from '../../../utils/imageUrl';
import EstadoBadge from '../../../components/EstadoBadge/EstadoBadge';
import './ModalDetalleReporte.css';

export interface ModalDetalleReporteProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  pautaResumen?: PautaEstadoResumenDTO | null;
  modo?: 'pendientes' | 'misTrabajos';
  puedeRellenarPauta?: boolean;
  selectedDetallesIds?: number[];
  onToggleSelectDetalle?: (detalleId: number) => void;
  onSelectAllDetalles?: () => void;
  onTomarTodasAverias?: () => void;
  onAutoasignarSeleccion?: () => void;
  onAbrirPauta: (solicitudId: number, nBus: string) => void;
  onClose: () => void;
  accionLoading?: boolean;

  // Acciones exclusivas para modo 'misTrabajos'
  onToggleCheckFalla?: (solicitudId: number, detalleId: number, resueltoActual: boolean) => void;
  onReportarRepuestoClick?: (detalle: { id: number; descripcion: string; faltaRepuesto: boolean }) => void;
  onAgregarFallaClick?: () => void;
  onAgregarComentarioClick?: () => void;
  onTerminarAvanceClick?: () => void;
  onFinalizarOrdenClick?: () => void;
}

export default function ModalDetalleReporte({
  isOpen,
  solicitud,
  pautaResumen,
  modo = 'pendientes',
  puedeRellenarPauta = true,
  selectedDetallesIds = [],
  onToggleSelectDetalle,
  onSelectAllDetalles,
  onTomarTodasAverias,
  onAutoasignarSeleccion,
  onAbrirPauta,
  onClose,
  accionLoading = false,
  onToggleCheckFalla,
  onReportarRepuestoClick,
  onAgregarFallaClick,
  onAgregarComentarioClick,
  onTerminarAvanceClick,
  onFinalizarOrdenClick,
}: ModalDetalleReporteProps) {
  // Cerrar con tecla Escape y bloquear scroll del fondo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !solicitud) return null;

  const sol = solicitud;
  const esReasignacion = sol.estado === 'PENDIENTE_REASIGNACION';
  const esFinalizada = sol.estado === 'FINALIZADO';
  const detallesPendientes = sol.detalles?.filter((d) => !d.resuelto) || [];
  const fallasSinResolverCount = detallesPendientes.length;
  const todasSeleccionadas =
    detallesPendientes.length > 0 &&
    detallesPendientes.every((d) => selectedDetallesIds.includes(d.id));

  return (
    <div
      className="mdr-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mdr-modal-title"
      onClick={onClose}
    >
      <div className="mdr-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera Corporativa */}
        <div className="mdr-header">
          <div className="mdr-header-left">
            <div className="mdr-icon-box">
              <Bus size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="mdr-ot-badge">
                  OT #{sol.id}
                </span>
                <EstadoBadge estado={sol.estado} size="xs" />
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Clock size={12} />
                  {formatearFechaHora(sol.fecha_creacion)}
                </span>
              </div>
              <h2 id="mdr-modal-title" className="mdr-title">
                {modo === 'misTrabajos' ? 'Orden de Trabajo' : 'Reporte Técnico'}: Bus N° {sol.n_bus}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mdr-btn-close"
            title="Cerrar (Esc)"
            aria-label="Cerrar modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="mdr-body">
          {/* Banner si la OT está FINALIZADA */}
          {esFinalizada && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-300 flex items-start gap-2.5 [data-theme=light]_&:bg-emerald-50 [data-theme=light]_&:border-emerald-200 [data-theme=light]_&:text-emerald-800">
              <FileCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-emerald-200 [data-theme=light]_&:text-emerald-900">
                  Orden de Trabajo Finalizada (Solo Lectura)
                </p>
                <p className="mt-0.5 text-slate-300 [data-theme=light]_&:text-emerald-700">
                  Esta orden fue cerrada y archivada en el sistema. Los registros técnicos y bitácoras son inmutables.
                </p>
              </div>
            </div>
          )}

          {/* Banner si viene de Pausa / Reasignación */}
          {esReasignacion && !esFinalizada && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-xs font-bold text-amber-300 flex items-start gap-2.5 [data-theme=light]_&:bg-amber-50 [data-theme=light]_&:border-amber-200 [data-theme=light]_&:text-amber-800">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-200 [data-theme=light]_&:text-amber-900">
                  Orden en Pausa por Reasignación / Entrega de Turno
                </p>
                <p className="mt-0.5 text-slate-300 [data-theme=light]_&:text-amber-700">
                  El avance previo fue registrado y cronometrado. Puedes reanudar los trabajos pendientes o resolver las averías asignadas.
                </p>
              </div>
            </div>
          )}

          {/* 1. Datos del Reporte y Chofer */}
          <div className="mdr-section">
            <h3 className="mdr-section-title">
              <FileText size={14} />
              <span>Detalles del Reporte de Ingreso</span>
            </h3>
            <div className="mdr-meta-grid">
              <div className="mdr-meta-item">
                <span>Orden de Trabajo</span>
                <p className="text-indigo-400 [data-theme=light]_&:text-indigo-600 font-black">
                  #{sol.id}
                </p>
              </div>
              <div className="mdr-meta-item">
                <span>N° Máquina</span>
                <p>Bus {sol.n_bus}</p>
              </div>
              <div className="mdr-meta-item">
                <span>Fecha de Emisión</span>
                <p>{formatearFechaHora(sol.fecha_creacion)}</p>
              </div>
              <div className="mdr-meta-item">
                <span>Averías Declaradas</span>
                <p>{sol.detalles?.length || 0} falla(s)</p>
              </div>
            </div>

            {sol.descripcion_general && (
              <div className="mt-3 pt-3 border-t border-white/5 [data-theme=light]_&:border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Descripción Reportada por el Conductor
                </span>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5 [data-theme=light]_&:bg-slate-100 [data-theme=light]_&:text-slate-700 [data-theme=light]_&:border-slate-200">
                  "{sol.descripcion_general}"
                </p>
              </div>
            )}
          </div>

          {/* 2. Evidencia Fotográfica — galería multi-foto */}
          {(sol.foto_url || (sol.evidencias && sol.evidencias.length > 0)) && (
            <div className="mdr-section">
              <h3 className="mdr-section-title">
                <Camera size={14} />
                <span>
                  Evidencia Fotográfica Adjunta
                  {sol.evidencias && sol.evidencias.length > 1 && (
                    <span className="ml-2 text-[11px] font-black bg-blue-500/20 text-blue-300 [data-theme=light]_&:bg-blue-100 [data-theme=light]_&:text-blue-800 px-2 py-0.5 rounded-full border border-blue-400/40">
                      {sol.evidencias.length} fotos
                    </span>
                  )}
                </span>
              </h3>

              {/* Galería múltiple: scroll horizontal de miniaturas */}
              {sol.evidencias && sol.evidencias.length > 1 ? (
                <div className="space-y-2">
                  <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
                    {sol.evidencias.map((ev, idx) => {
                      const url = getFullImageUrl(ev.url);
                      return (
                        <div
                          key={ev.id}
                          className="relative shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-white/10 [data-theme=light]_&:border-slate-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition snap-start"
                          onClick={() => url && window.open(url, '_blank')}
                          title={ev.original_filename || `Foto ${idx + 1} — clic para ver en tamaño completo`}
                        >
                          <img
                            src={url || ''}
                            alt={ev.original_filename || `Evidencia ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Número de foto */}
                          <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow">
                            {idx + 1}
                          </div>
                          {/* Nombre del archivo */}
                          {ev.original_filename && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                              <span className="text-[9px] font-bold text-white truncate block">
                                {ev.original_filename}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 [data-theme=light]_&:text-slate-400">
                    Toca cualquier foto para verla en tamaño completo
                  </p>
                </div>
              ) : (
                /* Foto única (foto_url o evidencias[0]) */
                <div
                  className="mdr-photo-box"
                  onClick={() => {
                    const url = sol.evidencias?.[0]?.url
                      ? getFullImageUrl(sol.evidencias[0].url)
                      : getFullImageUrl(sol.foto_url);
                    if (url) window.open(url, '_blank');
                  }}
                  title="Haga clic para ver en tamaño completo"
                >
                  <img
                    src={
                      sol.evidencias?.[0]?.url
                        ? getFullImageUrl(sol.evidencias[0].url) || ''
                        : getFullImageUrl(sol.foto_url) || ''
                    }
                    alt="Evidencia de la avería"
                    className="mdr-photo-img"
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. Checklist de Seguridad / Pauta Preventiva */}
          <div className="mdr-section flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="mdr-section-title mb-0">
                  <ClipboardCheck size={14} />
                  <span>Checklist de Seguridad (Pauta Preventiva)</span>
                </h3>
                {!puedeRellenarPauta && (
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full [data-theme=dark]_&:bg-amber-950/60 [data-theme=dark]_&:text-amber-300 [data-theme=dark]_&:border-amber-800">
                    Solo Lectura (No Asignado)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium [data-theme=light]_&:text-slate-600">
                {puedeRellenarPauta
                  ? 'Inspección obligatoria de los 11 puntos críticos antes de liberar el bus del taller.'
                  : 'Para registrar o evaluar la pauta preventiva debe autoasignarse esta OT o al menos una de sus averías.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAbrirPauta(sol.id, sol.n_bus)}
              className={`px-4 py-2.5 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto min-h-[44px] ${
                puedeRellenarPauta
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-700 hover:bg-slate-800 [data-theme=light]_&:bg-slate-600 [data-theme=light]_&:hover:bg-slate-700'
              }`}
            >
              <ClipboardCheck size={16} />
              <span>
                {puedeRellenarPauta ? 'Ver Pauta (11 Ítems)' : 'Consultar Pauta (Solo Lectura)'}{' '}
                {pautaResumen
                  ? `(${pautaResumen.respondidos}/${pautaResumen.total_items || 11})`
                  : ''}
              </span>
            </button>
          </div>

          {/* 4. Lista de Averías y Tareas Técnicas */}
          <div className="mdr-section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="mdr-section-title mb-0">
                <FileText size={14} />
                <span>Averías y Tareas Técnicas ({sol.detalles?.length || 0})</span>
              </h3>

              {modo === 'pendientes' && fallasSinResolverCount > 1 && onSelectAllDetalles && (
                <button
                  type="button"
                  onClick={onSelectAllDetalles}
                  className="text-xs font-black text-indigo-400 hover:text-indigo-300 [data-theme=light]_&:text-indigo-600 [data-theme=light]_&:hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
                >
                  {todasSeleccionadas ? (
                    <>
                      <CheckSquare size={14} />
                      <span>Deseleccionar todas</span>
                    </>
                  ) : (
                    <>
                      <Square size={14} />
                      <span>Marcar todas ({fallasSinResolverCount})</span>
                    </>
                  )}
                </button>
              )}

              {modo === 'misTrabajos' && !esFinalizada && onAgregarFallaClick && (
                <button
                  type="button"
                  onClick={onAgregarFallaClick}
                  disabled={accionLoading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                  title="Agregar avería detectada durante la reparación en taller"
                >
                  <Plus size={15} />
                  <span>+ Agregar Avería</span>
                </button>
              )}
            </div>

            {sol.detalles && sol.detalles.length > 0 ? (
              <div className="space-y-2.5">
                {sol.detalles.map((det) => {
                  if (modo === 'misTrabajos') {
                    // Renderizado interactivo operacional para Mis Trabajos
                    return (
                      <div
                        key={det.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 ${
                          det.resuelto
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 [data-theme=light]_&:bg-emerald-50/70 [data-theme=light]_&:border-emerald-200 [data-theme=light]_&:text-emerald-900'
                            : det.falta_repuesto
                            ? 'bg-red-500/10 border-red-500/30 text-red-300 [data-theme=light]_&:bg-red-50/70 [data-theme=light]_&:border-red-300 [data-theme=light]_&:text-red-900'
                            : 'bg-white/5 border-white/10 text-slate-200 [data-theme=light]_&:bg-white [data-theme=light]_&:border-slate-200 [data-theme=light]_&:text-slate-800'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={det.resuelto}
                            onChange={() => {
                              if (!det.resuelto && onToggleCheckFalla) {
                                onToggleCheckFalla(sol.id, det.id, det.resuelto);
                              }
                            }}
                            disabled={
                              accionLoading ||
                              Boolean(det.falta_repuesto) ||
                              det.resuelto ||
                              esFinalizada
                            }
                            className={`w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 sm:mt-0 shrink-0 transition ${
                              det.resuelto
                                ? 'opacity-80 cursor-not-allowed bg-emerald-100 accent-emerald-600 pointer-events-none'
                                : det.falta_repuesto || esFinalizada
                                ? 'opacity-30 cursor-not-allowed bg-slate-200 border-slate-300'
                                : 'cursor-pointer'
                            }`}
                            title={
                              esFinalizada
                                ? 'Orden finalizada (solo lectura)'
                                : det.resuelto
                                ? 'Avería resuelta (bloqueada)'
                                : det.falta_repuesto
                                ? 'Bloqueada por falta de repuestos'
                                : 'Marcar como resuelta'
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-extrabold select-none break-words [overflow-wrap:anywhere] ${
                                det.resuelto ? 'line-through opacity-70' : ''
                              }`}
                            >
                              {det.descripcion_personalizada ||
                                det.falla?.nombre ||
                                'Avería sin descripción'}
                            </p>
                            {det.falta_repuesto && !det.resuelto && (
                              <p className="text-[11px] font-bold text-red-400 [data-theme=light]_&:text-red-600 mt-0.5 flex items-center gap-1 min-w-0">
                                <AlertTriangle size={12} className="shrink-0" />
                                <span className="break-words [overflow-wrap:anywhere]">
                                  Bloqueado: {det.comentario_repuesto || 'Falta repuesto en bodega'} (Check deshabilitado)
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {det.resuelto && (
                            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 [data-theme=light]_&:bg-emerald-100 [data-theme=light]_&:text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 select-none">
                              <CheckCircle2 size={13} className="text-emerald-400 [data-theme=light]_&:text-emerald-600" />
                              <span>Resuelto ✓</span>
                            </span>
                          )}

                          {!det.resuelto && !esFinalizada && onReportarRepuestoClick && (
                            <button
                              type="button"
                              onClick={() =>
                                onReportarRepuestoClick({
                                  id: det.id,
                                  descripcion: det.descripcion_personalizada || det.falla?.nombre || 'Avería',
                                  faltaRepuesto: det.falta_repuesto ?? false,
                                })
                              }
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 cursor-pointer transition ${
                                det.falta_repuesto
                                  ? 'bg-red-500/20 text-red-200 border-red-500/40 hover:bg-red-500/30 [data-theme=light]_&:bg-red-100 [data-theme=light]_&:text-red-800 [data-theme=light]_&:border-red-300'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 [data-theme=light]_&:bg-slate-100 [data-theme=light]_&:text-slate-700 [data-theme=light]_&:border-slate-300'
                              }`}
                              title="Reportar falta de repuesto o marcar que llegó"
                            >
                              {det.falta_repuesto ? (
                                <>
                                  <PackageCheck size={13} />
                                  <span>Llegó Repuesto</span>
                                </>
                              ) : (
                                <>
                                  <PackageX size={13} />
                                  <span>Falta Repuesto</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Renderizado para modo 'pendientes' (selección atómica)
                  const isSelected = selectedDetallesIds.includes(det.id);
                  return (
                    <div
                      key={det.id}
                      onClick={() => !det.resuelto && onToggleSelectDetalle && onToggleSelectDetalle(det.id)}
                      className={`mdr-falla-row ${isSelected ? 'is-selected' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {!det.resuelto ? (
                          <span
                            className={`p-1 rounded-lg transition shrink-0 ${
                              isSelected
                                ? 'text-indigo-400 [data-theme=light]_&:text-indigo-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0 ml-1.5" />
                        )}

                        <span className="text-xs font-bold text-slate-200 [data-theme=light]_&:text-slate-800 break-words">
                          {det.descripcion_personalizada ||
                            det.falla?.nombre ||
                            'Avería sin descripción'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {det.falta_repuesto && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-200 border border-red-400/60 shadow-[0_0_8px_rgba(239,68,68,0.4)] flex items-center gap-1">
                            <PackageX size={11} />
                            <span>Falta Repuesto</span>
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            det.resuelto
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60'
                              : 'bg-amber-500/20 text-amber-200 border border-amber-400/60'
                          }`}
                        >
                          {det.resuelto ? 'Resuelto' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-semibold italic">
                No hay averías registradas en este reporte.
              </p>
            )}
          </div>

          {/* 5. Cuadrilla Previa si la orden tiene mecánicos */}
          {sol.mecanicos && sol.mecanicos.length > 0 && (
            <div className="mdr-section">
              <h3 className="mdr-section-title">
                <Users size={14} />
                <span>Cuadrilla Técnica Asignada</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {sol.mecanicos.map((m) => (
                  <span
                    key={m.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      m.is_activo
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 [data-theme=light]_&:bg-slate-100 [data-theme=light]_&:text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.is_activo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span>{m.mecanico_nombre || `Mecánico #${m.mecanico_id}`}</span>
                    {m.duracion_minutos != null && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10 [data-theme=light]_&:bg-slate-200 [data-theme=light]_&:text-slate-800">
                        {m.duracion_minutos} min
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. Bitácora de Observaciones & Taller (para modo misTrabajos) */}
          {modo === 'misTrabajos' && (
            <div className="mdr-section">
              <div className="flex items-center justify-between mb-2">
                <h3 className="mdr-section-title mb-0">
                  <MessageSquare size={14} />
                  <span>Bitácora de Observaciones & Taller ({sol.comentarios?.length || 0})</span>
                </h3>
                {!esFinalizada && onAgregarComentarioClick && (
                  <button
                    type="button"
                    onClick={onAgregarComentarioClick}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 [data-theme=light]_&:bg-slate-200 [data-theme=light]_&:hover:bg-slate-300 [data-theme=light]_&:text-slate-800 text-xs font-black rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>+ Nueva Observación</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sol.comentarios && sol.comentarios.length > 0 ? (
                  sol.comentarios.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-black/20 border border-white/5 [data-theme=light]_&:bg-slate-50 [data-theme=light]_&:border-slate-200 rounded-xl text-xs space-y-1 min-w-0"
                    >
                      <div className="flex justify-between font-bold text-slate-400 [data-theme=light]_&:text-slate-500 text-[10px] gap-2 min-w-0">
                        <span className="uppercase text-indigo-400 [data-theme=light]_&:text-indigo-600 shrink-0">
                          [{c.tipo || 'GENERAL'}]
                        </span>
                        <span className="truncate">{c.fecha_registro || ''}</span>
                      </div>
                      <p className="font-semibold text-slate-200 [data-theme=light]_&:text-slate-800 break-words [overflow-wrap:anywhere]">
                        {c.comentario}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay notas registradas en la bitácora.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con Acciones Operacionales Táctiles */}
        {modo === 'misTrabajos' ? (
          <div className="mdr-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={accionLoading}
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer [data-theme=light]_&:bg-slate-100 [data-theme=light]_&:hover:bg-slate-200 [data-theme=light]_&:text-slate-700"
            >
              Cerrar
            </button>

            {!esFinalizada && (
              <div className="flex items-center gap-2 flex-wrap">
                {onTerminarAvanceClick && (
                  <button
                    type="button"
                    onClick={onTerminarAvanceClick}
                    disabled={accionLoading}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm transition flex items-center gap-1.5 cursor-pointer [data-theme=light]_&:bg-amber-50 [data-theme=light]_&:hover:bg-amber-100 [data-theme=light]_&:text-amber-900 [data-theme=light]_&:border-amber-300"
                    title="Pausar o entregar turno para toda la cuadrilla (la orden pasa a PENDIENTE)"
                  >
                    <PauseCircle size={16} className="text-amber-400 [data-theme=light]_&:text-amber-600 shrink-0" />
                    <span>⏸️ Terminar Avance</span>
                  </button>
                )}

                {onFinalizarOrdenClick && (
                  <button
                    type="button"
                    onClick={onFinalizarOrdenClick}
                    disabled={accionLoading}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                    title="Cierre definitivo de la orden y liberación física del bus del taller"
                  >
                    <FileCheck size={16} />
                    <span>✅ Finalizar y Liberar Bus</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mdr-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={accionLoading}
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer [data-theme=light]_&:bg-slate-100 [data-theme=light]_&:hover:bg-slate-200 [data-theme=light]_&:text-slate-700"
            >
              Cerrar
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Autoasignar fallas seleccionadas */}
              {onAutoasignarSeleccion && (
                <button
                  type="button"
                  onClick={onAutoasignarSeleccion}
                  disabled={accionLoading || selectedDetallesIds.length === 0}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserCheck size={16} />
                  <span>
                    {esReasignacion ? 'Continuar Turno' : 'Autoasignar'} ({selectedDetallesIds.length}) Avería(s)
                  </span>
                </button>
              )}

              {/* Atender todas las averías / Reanudar trabajo */}
              {onTomarTodasAverias && (
                <button
                  type="button"
                  onClick={onTomarTodasAverias}
                  disabled={accionLoading || fallasSinResolverCount === 0}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    esReasignacion
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 shadow-md'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 shadow-md'
                  }`}
                >
                  <Play size={16} />
                  <span>
                    {esReasignacion ? 'Reanudar Trabajo' : 'Atender Todas las Averías'}{' '}
                    ({fallasSinResolverCount})
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
