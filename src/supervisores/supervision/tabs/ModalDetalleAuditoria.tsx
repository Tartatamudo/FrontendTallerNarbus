import { useEffect } from 'react';
import {
  Bus,
  X,
  FileText,
  PackageX,
  Users,
  User,
  Clock,
  UserPlus,
  MessageSquare,
  AlertTriangle,
  Camera
} from 'lucide-react';
import type { AuditoriaBusTallerDTO } from '../supervisionService';
import { formatearFechaHora } from '../../../utils/formatters';
import EstadoBadge from '../../../components/EstadoBadge/EstadoBadge';
import './ModalDetalleAuditoria.css';

export interface ModalDetalleAuditoriaProps {
  auditoria: AuditoriaBusTallerDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onAsignarClick?: (aud: AuditoriaBusTallerDTO) => void;
}

export default function ModalDetalleAuditoria({
  auditoria,
  isOpen,
  onClose,
  onAsignarClick,
}: ModalDetalleAuditoriaProps) {
  // Cerrar con Escape y bloquear scroll de fondo
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

  if (!isOpen || !auditoria) return null;

  const aud = auditoria;
  const estadoNorm = (aud.estado || '').toUpperCase();
  const esFinalizada =
    estadoNorm === 'FINALIZADO' ||
    estadoNorm === 'FINALIZADA' ||
    estadoNorm === 'LIBERADO' ||
    estadoNorm === 'LIBERADA' ||
    estadoNorm === 'CANCELADO' ||
    estadoNorm === 'CANCELADA';
  const puedeAsignar = !esFinalizada;

  // Desduplicar mecánicos activos y relevos
  const todosMecanicos = aud.mecanicos || [];
  const activosMap = new Map<number, typeof todosMecanicos[0]>();
  todosMecanicos.filter((m) => m.is_activo).forEach((m) => {
    if (!activosMap.has(m.mecanico_id)) {
      activosMap.set(m.mecanico_id, m);
    }
  });
  const mecanicosActivos = Array.from(activosMap.values());

  const relevosMap = new Map<number, typeof todosMecanicos[0]>();
  todosMecanicos.filter((m) => !m.is_activo && !activosMap.has(m.mecanico_id)).forEach((m) => {
    if (!relevosMap.has(m.mecanico_id)) {
      relevosMap.set(m.mecanico_id, m);
    }
  });
  const relevosAnteriores = Array.from(relevosMap.values());

  return (
    <div
      className="mda-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mda-modal-title"
      onClick={onClose}
    >
      <div className="mda-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera Corporativa */}
        <div className="mda-header">
          <div className="mda-header-left">
            <div className="mda-icon-box">
              <Bus size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="mda-ot-badge">
                  OT #{aud.id}
                </span>
                <EstadoBadge estado={aud.estado} size="xs" />
                <span className="text-xs text-slate-400 font-semibold">
                  {formatearFechaHora(aud.fecha_creacion)}
                </span>
              </div>
              <h2 id="mda-modal-title" className="mda-title">
                Ficha Técnica: Bus N° {aud.n_bus}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mda-btn-close"
            title="Cerrar Ficha (Esc)"
            aria-label="Cerrar modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Cuerpo Scrollable con Jerarquía Operacional */}
        <div className="mda-body">
          {/* 1. Metadatos y Tiempos */}
          <div className="mda-section">
            <h3 className="mda-section-title">
              <Clock size={14} />
              <span>Registro y Ciclo de Vida de la Orden</span>
            </h3>
            <div className="mda-meta-grid">
              <div className="mda-meta-item">
                <span>Ingresado por</span>
                <p>{aud.usuario_creador_nombre || 'No registrado'}</p>
              </div>
              <div className="mda-meta-item">
                <span>Cerrado / Validado por</span>
                <p>{aud.mecanico_cierre_nombre || 'En proceso'}</p>
              </div>
              <div className="mda-meta-item">
                <span>Fecha de Cierre</span>
                <p>{aud.fecha_cierre ? formatearFechaHora(aud.fecha_cierre) : 'Pendiente de cierre'}</p>
              </div>
              <div className="mda-meta-item">
                <span>Estado de Pauta</span>
                <p>{aud.estado}</p>
              </div>
            </div>

            {aud.descripcion_general && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Descripción Inicial del Problema
                </span>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                  "{aud.descripcion_general}"
                </p>
              </div>
            )}
          </div>

          {/* 2. Evidencia Fotográfica si existe */}
          {aud.foto_url && (
            <div className="mda-section">
              <h3 className="mda-section-title">
                <Camera size={14} />
                <span>Evidencia Fotográfica de la Falla</span>
              </h3>
              <div className="mda-photo-box" onClick={() => window.open(aud.foto_url!, '_blank')}>
                <img src={aud.foto_url} alt="Evidencia de la falla" className="mda-photo-img" />
              </div>
            </div>
          )}

          {/* 3. Averías y Fallas Declaradas */}
          <div className="mda-section">
            <h3 className="mda-section-title">
              <FileText size={14} />
              <span>Averías y Fallas Declaradas ({aud.detalles?.length || 0})</span>
            </h3>
            {aud.detalles && aud.detalles.length > 0 ? (
              <div className="space-y-1.5">
                {aud.detalles.map((det) => (
                  <div key={det.id} className="mda-falla-row">
                    <div className="mda-falla-desc">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          det.resuelto ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
                        }`}
                      />
                      <span>
                        {det.descripcion_personalizada ||
                          det.falla?.nombre ||
                          'Avería sin descripción'}
                      </span>
                    </div>

                    <div className="mda-falla-badges">
                      {det.falta_repuesto && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-200 border border-red-400/60 shadow-[0_0_8px_rgba(239,68,68,0.4)] flex items-center gap-1">
                          <PackageX size={11} />
                          <span>Falta Repuesto</span>
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          det.resuelto
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.35)]'
                            : 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                        }`}
                      >
                        {det.resuelto ? 'Resuelto' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No se declararon ítems específicos.</p>
            )}
          </div>

          {/* 4. Cuadrilla de Mecánicos (Turno Activo vs Relevos) */}
          <div className="mda-section">
            <h3 className="mda-section-title">
              <Users size={14} />
              <span>Mecánicos en Turno Activo ({mecanicosActivos.length})</span>
            </h3>
            {mecanicosActivos.length > 0 ? (
              <div className="mda-mecanicos-container">
                {mecanicosActivos.map((m) => (
                  <span key={m.id} className="mda-mecanico-pill-active">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0" />
                    <User size={13} />
                    <span>{m.mecanico_nombre}</span>
                    {m.es_lider_responsable && (
                      <span className="text-[9px] bg-amber-400/30 text-amber-200 border border-amber-400/50 px-1.5 py-0.2 rounded font-black">
                        LÍDER
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No hay mecánicos activos en este momento.</p>
            )}

            {/* Relevos de Turnos Anteriores */}
            {relevosAnteriores.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Clock size={12} />
                  <span>Relevos de Turnos Anteriores ({relevosAnteriores.length}):</span>
                </span>
                <div className="mda-mecanicos-container">
                  {relevosAnteriores.map((m) => (
                    <span key={m.id} className="mda-mecanico-pill-relevo">
                      <User size={12} />
                      <span>{m.mecanico_nombre}</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Entregó)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Bitácora de Comentarios si existen */}
          {aud.comentarios && aud.comentarios.length > 0 && (
            <div className="mda-section">
              <h3 className="mda-section-title">
                <MessageSquare size={14} />
                <span>Bitácora de Observaciones ({aud.comentarios.length})</span>
              </h3>
              <div className="space-y-2">
                {aud.comentarios.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-black text-slate-200">{c.usuario_nombre}</span>
                      <span className="text-[10px] text-slate-400">{formatearFechaHora(c.fecha_registro)}</span>
                    </div>
                    <p className="text-slate-300 font-medium">{c.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Justificaciones Operacionales si existen */}
          {(aud.motivo_incompleto_checklist || aud.motivo_cierre_parcial) && (
            <div className="mda-warning-box">
              <div className="flex items-center gap-2 mb-1 font-black text-amber-300 uppercase tracking-wider text-[10px]">
                <AlertTriangle size={14} />
                <span>Justificación Operacional Registrada</span>
              </div>
              {aud.motivo_incompleto_checklist && (
                <p>
                  <strong>Justificación Pauta Incompleta:</strong> {aud.motivo_incompleto_checklist}
                </p>
              )}
              {aud.motivo_cierre_parcial && (
                <p>
                  <strong>Justificación Cierre Parcial:</strong> {aud.motivo_cierre_parcial}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="mda-footer">
          {puedeAsignar && onAsignarClick && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAsignarClick(aud);
              }}
              className="mda-btn-asignar"
            >
              <UserPlus size={16} />
              <span>Asignar Cuadrilla</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mda-btn-cerrar"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
