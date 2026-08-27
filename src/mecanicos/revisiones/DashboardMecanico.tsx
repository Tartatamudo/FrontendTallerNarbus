import { Wrench, CheckCircle, Clock } from 'lucide-react';

interface DashboardMecanicoProps {
  onVolver?: () => void;
}

export default function DashboardMecanico({ onVolver }: DashboardMecanicoProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <Wrench size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Módulo Mecánico: Panel de Revisiones</h1>
            <p className="text-sm text-slate-500">Órdenes de trabajo asignadas e inspecciones técnicas</p>
          </div>
        </div>
        {onVolver && (
          <button
            onClick={onVolver}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
          >
            Volver al Menú
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Clock size={28} className="text-amber-600" />
          <div>
            <span className="text-2xl font-bold text-amber-900">0</span>
            <p className="text-xs text-amber-700 font-medium">Pendientes de Inspección</p>
          </div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <Wrench size={28} className="text-blue-600" />
          <div>
            <span className="text-2xl font-bold text-blue-900">0</span>
            <p className="text-xs text-blue-700 font-medium">En Reparación</p>
          </div>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={28} className="text-emerald-600" />
          <div>
            <span className="text-2xl font-bold text-emerald-900">0</span>
            <p className="text-xs text-emerald-700 font-medium">Completados Hoy</p>
          </div>
        </div>
      </div>

      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
        <p className="text-slate-500 font-medium text-sm">
          No hay órdenes de taller pendientes asignadas a su cuenta mecánica en este momento.
        </p>
      </div>
    </div>
  );
}
