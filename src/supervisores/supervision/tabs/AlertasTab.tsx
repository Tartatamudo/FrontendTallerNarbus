import {
  RefreshCw,
  CheckCircle2,
  Bus,
  PackageX,
  AlertTriangle,
  Users,
  UserPlus
} from 'lucide-react';
import type { AlertaSupervisionDTO } from '../supervisionService';
import { formatearFechaHora } from '../../../utils/formatters';

export interface AlertasTabProps {
  alertas: AlertaSupervisionDTO[];
  loading: boolean;
  filtroSeveridadAlerta: string;
  onFiltroSeveridadChange: (sev: string) => void;
  onAsignarMecanicoClick: (al: AlertaSupervisionDTO) => void;
}

export default function AlertasTab({
  alertas,
  loading,
  filtroSeveridadAlerta,
  onFiltroSeveridadChange,
  onAsignarMecanicoClick,
}: AlertasTabProps) {
  const alertasFiltradas = alertas.filter((al) => {
    if (filtroSeveridadAlerta === 'TODAS') return true;
    return al.severidad.toUpperCase() === filtroSeveridadAlerta;
  });

  return (
    <div className="space-y-4">
      {/* Filtros por severidad */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Severidad:
          </span>
          {(['TODAS', 'CRITICA', 'ALTA', 'MEDIA'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => onFiltroSeveridadChange(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition ${
                filtroSeveridadAlerta === sev
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500">
          Mostrando {alertasFiltradas.length} de {alertas.length} alertas detectadas
        </span>
      </div>

      {loading && alertas.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2 bg-white rounded-3xl border">
          <RefreshCw size={28} className="animate-spin text-red-600" />
          <span>Escaneando alertas operacionales del taller...</span>
        </div>
      ) : alertasFiltradas.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="text-base font-black text-slate-800">Taller sin Alertas Activas</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md">
            No hay defectos críticos de pauta preventiva, repuestos faltantes ni buses desatendidos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertasFiltradas.map((al, idx) => {
            const isCritica = al.severidad === 'CRITICA';
            const isAlta = al.severidad === 'ALTA';
            const cardColor = isCritica
              ? 'border-red-300 bg-red-50/40'
              : isAlta
              ? 'border-amber-300 bg-amber-50/40'
              : 'border-blue-300 bg-blue-50/40';

            const badgeColor = isCritica
              ? 'bg-red-600 text-white'
              : isAlta
              ? 'bg-amber-600 text-white'
              : 'bg-blue-600 text-white';

            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl border-2 transition shadow-sm flex flex-col justify-between gap-4 ${cardColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bus size={18} className="text-slate-800" />
                      <span className="font-black text-slate-900 text-base">
                        Bus N° {al.n_bus}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        (Orden #{al.solicitud_id})
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}
                    >
                      {al.severidad}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 mt-2">
                    {al.tipo === 'REPUESTO_FALTANTE' ? (
                      <PackageX size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    ) : al.tipo === 'DEFECTO_PAUTA' ? (
                      <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <Users size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        {al.tipo.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 leading-relaxed">
                        {al.mensaje}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {al.fecha_deteccion ? formatearFechaHora(al.fecha_deteccion) : 'Detectado en vivo'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onAsignarMecanicoClick(al)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <UserPlus size={14} />
                    <span>Asignar Mecánico</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
