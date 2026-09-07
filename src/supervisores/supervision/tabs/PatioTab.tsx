import { useState } from 'react';
import { Bus, Compass } from 'lucide-react';
import type { BusAutocompleteDTO } from '../../../buses/busesService';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';

export interface PatioTabProps {
  busesPatio: BusAutocompleteDTO[];
  loading: boolean;
  onCambiarEstadoClick: (bus: BusAutocompleteDTO) => void;
}

export default function PatioTab({
  busesPatio,
  loading,
  onCambiarEstadoClick,
}: PatioTabProps) {
  const [filtroBusPatio, setFiltroBusPatio] = useState('');

  const busesPatioFiltrados = busesPatio.filter((bus) => {
    if (!filtroBusPatio.trim()) return true;
    const q = filtroBusPatio.toLowerCase();
    return (
      bus.n_bus.toLowerCase().includes(q) ||
      (bus.patente && bus.patente.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header Titular de Patio */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Compass size={20} className="text-indigo-600" />
            <span>Control Físico de Patio y Flota Narbus</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Supervisión en tiempo real de buses posicionados en maestranza central o en servicio de ruta.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por N° Máquina o Patente..."
            value={filtroBusPatio}
            onChange={(e) => setFiltroBusPatio(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>En Taller: {busesPatio.filter((b) => b.en_taller).length}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>En Ruta: {busesPatio.filter((b) => !b.en_taller).length}</span>
          </span>
        </div>
      </div>

      {loading && busesPatio.length === 0 ? (
        <SkeletonLoader variant="kpi" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {busesPatioFiltrados.map((bus) => (
            <div
              key={bus.id}
              className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between gap-3 ${
                bus.en_taller ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Bus
                      size={18}
                      className={bus.en_taller ? 'text-amber-600' : 'text-slate-500'}
                    />
                    <span className="font-black text-base text-slate-900">
                      Bus {bus.n_bus}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      bus.en_taller
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {bus.en_taller ? 'En Taller' : 'En Ruta'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Patente: <strong>{bus.patente || 'S/P'}</strong>
                </p>
                {bus.tipo_bus && (
                  <p className="text-[11px] text-slate-400 font-medium">{bus.tipo_bus}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onCambiarEstadoClick(bus)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  bus.en_taller
                    ? 'bg-slate-800 hover:bg-slate-900 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                <Compass size={14} />
                <span>{bus.en_taller ? 'Dar Salida a Ruta' : 'Ingresar a Taller'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
