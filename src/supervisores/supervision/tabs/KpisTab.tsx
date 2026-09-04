import { Activity } from 'lucide-react';
import type { ResumenTallerDTO } from '../supervisionService';

export interface KpisTabProps {
  resumen: ResumenTallerDTO;
}

export default function KpisTab({ resumen }: KpisTabProps) {
  return (
    <div className="space-y-6">
      {/* Tarjetas Principales de KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Total Órdenes
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {resumen.metricas_estado.total_solicitudes}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
            Reportadas
          </span>
          <p className="text-2xl font-black text-blue-800 mt-1">
            {resumen.metricas_estado.reportadas}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
            En Reparación
          </span>
          <p className="text-2xl font-black text-amber-800 mt-1">
            {resumen.metricas_estado.en_reparacion}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">
            Reasignación
          </span>
          <p className="text-2xl font-black text-purple-800 mt-1">
            {resumen.metricas_estado.pendiente_reasignacion}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
            Finalizadas
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {resumen.metricas_estado.finalizadas}
          </p>
        </div>

        {/* Métricas operacionales adicionales */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-sm">
          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
            En Patio Taller
          </span>
          <p className="text-2xl font-black text-indigo-900 mt-1">
            {resumen.metricas_estado.buses_fisicamente_en_taller ??
              resumen.buses_activos_taller.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">
            Falta Repuesto
          </span>
          <p className="text-2xl font-black text-red-700 mt-1">
            {resumen.metricas_estado.fallas_bloqueadas_por_repuesto ?? 0}
          </p>
        </div>
      </div>

      {/* Eficiencia y Desglose por Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Activity size={18} className="text-indigo-600" />
            <span>Rendimiento Global de Averías</span>
          </h3>

          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Porcentaje de Resolución:</span>
            <span className="text-lg font-black text-indigo-600">
              {resumen.porcentaje_resolucion_fallas}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${resumen.porcentaje_resolucion_fallas}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-semibold text-slate-500 pt-2 border-t">
            <span>Total Registradas: {resumen.total_fallas_registradas}</span>
            <span className="text-emerald-600 font-bold">
              Resueltas: {resumen.total_fallas_resueltas}
            </span>
          </div>
        </div>

        {/* Fallas por Categoría */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider">
            Distribución de Averías por Sistema
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {resumen.fallas_por_categoria.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
              >
                <span className="font-bold text-slate-700">{cat.categoria_nombre}</span>
                <span className="px-2 py-0.5 rounded-md font-black bg-indigo-100 text-indigo-800">
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
