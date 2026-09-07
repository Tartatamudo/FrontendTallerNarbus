import { Activity, TrendingUp, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import type { ResumenTallerDTO } from '../supervisionService';

export interface KpisTabProps {
  resumen: ResumenTallerDTO;
}

export default function KpisTab({ resumen }: KpisTabProps) {
  return (
    <div className="space-y-6">
      {/* Tarjetas Principales de KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Total Órdenes
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            {resumen.metricas_estado.total_solicitudes}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Registradas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/25 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Reportadas
          </span>
          <p className="text-2xl font-black text-blue-900 mt-1.5 tracking-tight">
            {resumen.metricas_estado.reportadas}
          </p>
          <span className="text-[10px] text-blue-600/80 font-semibold block mt-1">Por atender</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/25 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            En Reparación
          </span>
          <p className="text-2xl font-black text-amber-900 mt-1.5 tracking-tight">
            {resumen.metricas_estado.en_reparacion}
          </p>
          <span className="text-[10px] text-amber-600/80 font-semibold block mt-1">Con mecánico</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/25 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <Clock size={10} />
            Reasignación
          </span>
          <p className="text-2xl font-black text-purple-900 mt-1.5 tracking-tight">
            {resumen.metricas_estado.pendiente_reasignacion}
          </p>
          <span className="text-[10px] text-purple-600/80 font-semibold block mt-1">Pausa de turno</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/25 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={10} />
            Finalizadas
          </span>
          <p className="text-2xl font-black text-emerald-900 mt-1.5 tracking-tight">
            {resumen.metricas_estado.finalizadas}
          </p>
          <span className="text-[10px] text-emerald-600/80 font-semibold block mt-1">Cierre total</span>
        </div>

        {/* Métricas operacionales adicionales */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/35 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">
            En Patio Taller
          </span>
          <p className="text-2xl font-black text-indigo-950 mt-1.5 tracking-tight">
            {resumen.metricas_estado.buses_fisicamente_en_taller ??
              resumen.buses_activos_taller.length}
          </p>
          <span className="text-[10px] text-indigo-600/80 font-semibold block mt-1">Buses presentes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/35 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={10} />
            Falta Repuesto
          </span>
          <p className="text-2xl font-black text-red-700 mt-1.5 tracking-tight">
            {resumen.metricas_estado.fallas_bloqueadas_por_repuesto ?? 0}
          </p>
          <span className="text-[10px] text-red-600/80 font-semibold block mt-1">Averías en espera</span>
        </div>
      </div>

      {/* Eficiencia y Desglose por Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" />
              <span>Rendimiento Global de Averías</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              <TrendingUp size={13} />
              Resolución
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1">
            <span>Tasa de Completitud:</span>
            <span className="text-2xl font-black text-indigo-700">
              {resumen.porcentaje_resolucion_fallas}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(resumen.porcentaje_resolucion_fallas, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-semibold text-slate-600 pt-3 border-t border-slate-100">
            <span>Total Registradas: <strong className="text-slate-900">{resumen.total_fallas_registradas}</strong></span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck size={14} />
              Resueltas: <strong>{resumen.total_fallas_resueltas}</strong>
            </span>
          </div>
        </div>

        {/* Fallas por Categoría */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <span>Distribución de Averías por Sistema</span>
            <span className="text-[11px] font-bold text-slate-400 capitalize">
              {resumen.fallas_por_categoria.length} categorías activas
            </span>
          </h3>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {resumen.fallas_por_categoria.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-xs border border-slate-100"
              >
                <span className="font-bold text-slate-800">{cat.categoria_nombre}</span>
                <span className="px-2.5 py-1 rounded-md font-black bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {cat.total_fallas} fallas
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
