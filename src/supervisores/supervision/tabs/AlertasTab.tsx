import {
  CheckCircle2,
  Bus,
  PackageX,
  AlertTriangle,
  Users,
  UserPlus
} from 'lucide-react';
import type { AlertaSupervisionDTO } from '../supervisionService';
import { formatearFechaHora } from '../../../utils/formatters';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';

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
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Severidad:
          </span>
          {(['TODAS', 'CRITICA', 'ALTA', 'MEDIA'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => onFiltroSeveridadChange(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                filtroSeveridadAlerta === sev
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
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
        <SkeletonLoader variant="card" count={2} />
      ) : alertasFiltradas.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center gap-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="text-base font-black text-slate-800">Taller sin Alertas Activas</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md">
            No hay defectos críticos de pauta preventiva, repuestos faltantes ni buses desatendidos en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertasFiltradas.map((al, idx) => {
            const isCritica = al.severidad === 'CRITICA';
            const isAlta = al.severidad === 'ALTA';
            const cardColor = isCritica
              ? 'border-red-200 bg-red-50/40 hover:border-red-300'
              : isAlta
              ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
              : 'border-blue-200 bg-blue-50/40 hover:border-blue-300';

            const badgeColor = isCritica
              ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
              : isAlta
              ? 'bg-amber-600 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]'
              : 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]';

            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl border-2 transition duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-4 ${cardColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center border border-slate-200">
                        <Bus size={18} className="text-slate-800" />
                      </div>
                      <span className="font-black text-slate-900 text-base">
                        Bus N° {al.n_bus}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        (Orden #{al.solicitud_id})
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${badgeColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {al.severidad}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 mt-3 bg-white/70 p-3 rounded-2xl border border-slate-200/50">
                    {al.tipo === 'REPUESTO_FALTANTE' ? (
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <PackageX size={18} />
                      </div>
                    ) : al.tipo === 'DEFECTO_PAUTA' ? (
                      <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Users size={18} />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
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
                    className="min-h-[40px] px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-200"
                  >
                    <UserPlus size={15} />
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
