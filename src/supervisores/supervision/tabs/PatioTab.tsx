import { useState } from 'react';
import { Bus, RefreshCw, Compass } from 'lucide-react';
import type { BusAutocompleteDTO } from '../../../buses/busesService';

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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por N° Máquina o Patente..."
            value={filtroBusPatio}
            onChange={(e) => setFiltroBusPatio(e.target.value)}
            className="w-full p-2 border rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>En Taller: {busesPatio.filter((b) => b.en_taller).length}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span>En Ruta: {busesPatio.filter((b) => !b.en_taller).length}</span>
          </span>
        </div>
      </div>

      {loading && busesPatio.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2 bg-white rounded-3xl border">
          <RefreshCw size={28} className="animate-spin text-indigo-600" />
          <span>Cargando catálogo de flota en patio...</span>
        </div>
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
