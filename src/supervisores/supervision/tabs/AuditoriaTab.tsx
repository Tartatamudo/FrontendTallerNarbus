import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserPlus,
  FileText,
  PackageX,
  Users,
  User,
  Clock
} from 'lucide-react';
import type { AuditoriaBusTallerDTO, AuditoriaFiltros } from '../supervisionService';
import { formatearFechaHora } from '../../../utils/formatters';
import EstadoBadge from '../../../components/EstadoBadge/EstadoBadge';

export interface AuditoriaTabProps {
  auditorias: AuditoriaBusTallerDTO[];
  loading: boolean;
  onFiltrar: (filtros: AuditoriaFiltros) => void;
  onAsignarClick: (aud: AuditoriaBusTallerDTO) => void;
}

export default function AuditoriaTab({
  auditorias,
  loading,
  onFiltrar,
  onAsignarClick,
}: AuditoriaTabProps) {
  const [filtroBus, setFiltroBus] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMecanicoNombre, setFiltroMecanicoNombre] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFiltrarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltrar({
      n_bus: filtroBus.trim() || undefined,
      estado: filtroEstado || undefined,
      mecanico_nombre: filtroMecanicoNombre.trim() || undefined,
    });
  };

  const handleLimpiarFiltros = () => {
    setFiltroBus('');
    setFiltroEstado('');
    setFiltroMecanicoNombre('');
    onFiltrar({});
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <form
        onSubmit={handleFiltrarSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3"
      >
        <div className="flex-1 min-w-[140px]">
          <input
            type="text"
            placeholder="Filtrar N° Bus..."
            value={filtroBus}
            onChange={(e) => setFiltroBus(e.target.value)}
            className="w-full p-2 border rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full p-2 border rounded-xl text-xs font-semibold"
          >
            <option value="">Todos los Estados</option>
            <option value="REPORTADO">REPORTADO</option>
            <option value="EN_REPARACION">EN REPARACIÓN</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="PENDIENTE_REASIGNACION">PENDIENTE REASIGNACIÓN</option>
            <option value="FINALIZADO">FINALIZADO</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <input
            type="text"
            placeholder="Nombre mecánico..."
            value={filtroMecanicoNombre}
            onChange={(e) => setFiltroMecanicoNombre(e.target.value)}
            className="w-full p-2 border rounded-xl text-xs font-semibold"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5"
        >
          <Search size={14} />
          <span>Filtrar</span>
        </button>

        <button
          type="button"
          onClick={handleLimpiarFiltros}
          className="px-3 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
        >
          Limpiar
        </button>
      </form>

      {/* Lista de Fichas de Auditoría */}
      {loading && auditorias.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2 bg-white rounded-3xl border">
          <RefreshCw size={28} className="animate-spin text-indigo-600" />
          <span>Cargando bitácora de auditoría...</span>
        </div>
      ) : auditorias.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs font-bold text-slate-500">
          No se encontraron registros de auditoría con los filtros aplicados.
        </div>
      ) : (
        <div className="space-y-3">
          {auditorias.map((aud) => {
            const isExpanded = expandedCards[aud.id];
            const puedeAsignar =
              aud.estado !== 'FINALIZADA' &&
              aud.estado !== 'LIBERADO' &&
              aud.estado !== 'CANCELADA';

            return (
              <div
                key={aud.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Folio #{aud.id}
                      </span>
                      <EstadoBadge estado={aud.estado} size="xs" />
                      <span className="text-xs text-slate-400">
                        {formatearFechaHora(aud.fecha_creacion)}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Bus N° {aud.n_bus}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {aud.descripcion_general || 'Sin descripción general'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {puedeAsignar && (
                      <button
                        type="button"
                        onClick={() => onAsignarClick(aud)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <UserPlus size={14} />
                        <span>Asignar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(aud.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Ocultar' : 'Detalles'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Vista Expandida Inmutable */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-4 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Creado por
                        </span>
                        <p className="font-bold text-slate-800">
                          {aud.usuario_creador_nombre || 'Desconocido'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Cerrado por
                        </span>
                        <p className="font-bold text-slate-800">
                          {aud.mecanico_cierre_nombre || 'Aún no cerrado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Fecha Cierre
                        </span>
                        <p className="font-bold text-slate-800">
                          {aud.fecha_cierre ? formatearFechaHora(aud.fecha_cierre) : 'En proceso'}
                        </p>
                      </div>
                    </div>

                    {/* Averías y Checklist */}
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                        <FileText size={14} className="text-indigo-600" />
                        <span>Averías y Fallas Declaradas ({aud.detalles.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {aud.detalles.map((det) => (
                          <div
                            key={det.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                              det.resuelto
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  det.resuelto ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <span className="font-bold text-slate-800">
                                {det.descripcion_personalizada ||
                                  det.falla?.nombre ||
                                  'Avería sin nombre'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {det.falta_repuesto && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                  <PackageX size={10} />
                                  <span>Falta Repuesto</span>
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  det.resuelto
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {det.resuelto ? 'Resuelto' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mecánicos: Activos en Turno vs Historial de Relevos */}
                    {(() => {
                      const todos = aud.mecanicos || [];
                      // Activos actualmente (desduplicados por mecanico_id)
                      const activosMap = new Map<number, typeof todos[0]>();
                      todos.filter((m) => m.is_activo).forEach((m) => {
                        if (!activosMap.has(m.mecanico_id)) {
                          activosMap.set(m.mecanico_id, m);
                        }
                      });
                      const mecanicosActivos = Array.from(activosMap.values());

                      // Relevos anteriores: que NO estén activos actualmente, desduplicados por mecanico_id
                      const relevosMap = new Map<number, typeof todos[0]>();
                      todos.filter((m) => !m.is_activo && !activosMap.has(m.mecanico_id)).forEach((m) => {
                        if (!relevosMap.has(m.mecanico_id)) {
                          relevosMap.set(m.mecanico_id, m);
                        }
                      });
                      const relevosAnteriores = Array.from(relevosMap.values());

                      return (
                        <div className="space-y-2.5">
                          <div>
                            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <Users size={14} className="text-indigo-600" />
                              <span>Mecánicos en Turno Activo ({mecanicosActivos.length})</span>
                            </h4>

                            {mecanicosActivos.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {mecanicosActivos.map((m) => (
                                  <span
                                    key={m.id}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Activo en turno" />
                                    <User size={13} className="text-indigo-600" />
                                    <span>{m.mecanico_nombre}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No hay mecánicos activos en este momento.</p>
                            )}
                          </div>

                          {/* Relevos de Turnos Anteriores */}
                          {relevosAnteriores.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/80">
                              <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Clock size={12} className="text-slate-400" />
                                <span>Relevos de Turnos Anteriores ({relevosAnteriores.length}):</span>
                              </h5>
                              <div className="flex flex-wrap gap-1.5">
                                {relevosAnteriores.map((m) => (
                                  <span
                                    key={m.id}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-slate-100/90 text-slate-600 border-slate-200 flex items-center gap-1.5"
                                  >
                                    <User size={11} className="text-slate-400" />
                                    <span>{m.mecanico_nombre}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">(Entregó)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Justificaciones de cierre si existen */}
                    {(aud.motivo_incompleto_checklist || aud.motivo_cierre_parcial) && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                        {aud.motivo_incompleto_checklist && (
                          <p>
                            <strong>Justificación Pauta Incompleta:</strong>{' '}
                            {aud.motivo_incompleto_checklist}
                          </p>
                        )}
                        {aud.motivo_cierre_parcial && (
                          <p>
                            <strong>Justificación Cierre Parcial:</strong>{' '}
                            {aud.motivo_cierre_parcial}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
