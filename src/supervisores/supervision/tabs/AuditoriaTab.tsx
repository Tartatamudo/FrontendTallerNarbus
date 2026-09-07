import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  FileText
} from 'lucide-react';
import type { AuditoriaBusTallerDTO, AuditoriaFiltros } from '../supervisionService';
import { formatearFechaHora } from '../../../utils/formatters';
import EstadoBadge from '../../../components/EstadoBadge/EstadoBadge';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import ModalDetalleAuditoria from './ModalDetalleAuditoria';
import './AuditoriaTab.css';

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
  const [auditoriaParaModal, setAuditoriaParaModal] = useState<AuditoriaBusTallerDTO | null>(null);

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
    <div className="aud-container">
      {/* Filtros */}
      <form onSubmit={handleFiltrarSubmit} className="aud-filter-form">
        <div className="aud-filter-field">
          <input
            type="text"
            placeholder="Filtrar N° Bus..."
            value={filtroBus}
            onChange={(e) => setFiltroBus(e.target.value)}
            className="aud-input"
          />
        </div>

        <div className="aud-filter-field">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="aud-select"
          >
            <option value="">Todos los Estados</option>
            <option value="REPORTADO">REPORTADO</option>
            <option value="EN_REPARACION">EN REPARACIÓN</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="PENDIENTE_REASIGNACION">PENDIENTE REASIGNACIÓN</option>
            <option value="FINALIZADO">FINALIZADO</option>
          </select>
        </div>

        <div className="aud-filter-field">
          <input
            type="text"
            placeholder="Nombre mecánico..."
            value={filtroMecanicoNombre}
            onChange={(e) => setFiltroMecanicoNombre(e.target.value)}
            className="aud-input"
          />
        </div>

        <button type="submit" className="aud-btn-filter">
          <Search size={14} />
          <span>Filtrar</span>
        </button>

        <button
          type="button"
          onClick={handleLimpiarFiltros}
          className="aud-btn-clear"
        >
          Limpiar
        </button>
      </form>

      {/* Lista de Fichas de Auditoría */}
      {loading && auditorias.length === 0 ? (
        <SkeletonLoader variant="card" count={3} />
      ) : auditorias.length === 0 ? (
        <div className="aud-empty">
          No se encontraron registros de auditoría con los filtros aplicados.
        </div>
      ) : (
        <div className="space-y-3">
          {auditorias.map((aud) => {
            const estadoNorm = (aud.estado || '').toUpperCase();
            const esFinalizada =
              estadoNorm === 'FINALIZADO' ||
              estadoNorm === 'FINALIZADA' ||
              estadoNorm === 'LIBERADO' ||
              estadoNorm === 'LIBERADA' ||
              estadoNorm === 'CANCELADO' ||
              estadoNorm === 'CANCELADA';
            const puedeAsignar = !esFinalizada;

            return (
              <div key={aud.id} className="aud-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="aud-ot-badge">
                        OT #{aud.id}
                      </span>
                      <EstadoBadge estado={aud.estado} size="xs" />
                      <span className="aud-date">
                        {formatearFechaHora(aud.fecha_creacion)}
                      </span>
                    </div>
                    <h3 className="aud-bus-title">
                      Bus N° {aud.n_bus}
                    </h3>
                    <p className="aud-bus-desc line-clamp-1">
                      {aud.descripcion_general || 'Sin descripción general'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {puedeAsignar && (
                      <button
                        type="button"
                        onClick={() => onAsignarClick(aud)}
                        className="aud-btn-asignar"
                        title="Asignar o reasignar cuadrilla"
                      >
                        <UserPlus size={14} />
                        <span>Asignar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setAuditoriaParaModal(aud)}
                      className="aud-btn-ver"
                      title="Abrir Ficha Completa de Auditoría"
                    >
                      <FileText size={14} />
                      <span>Ver Ficha</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Flotante de Ficha de Auditoría */}
      <ModalDetalleAuditoria
        auditoria={auditoriaParaModal}
        isOpen={auditoriaParaModal !== null}
        onClose={() => setAuditoriaParaModal(null)}
        onAsignarClick={onAsignarClick}
      />
    </div>
  );
}
