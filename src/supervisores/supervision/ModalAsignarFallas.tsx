import { useState } from 'react';
import { UserCheck, X, RefreshCw, AlertCircle } from 'lucide-react';
import MecanicoSelector from '../../components/MecanicoSelector/MecanicoSelector';
import { type MecanicoItem } from '../../usuarios/auth/authService';
import { asignarDesdeSupervision } from './supervisionService';
import { getApiErrorMessage } from '../../utils/apiErrors';

interface DetalleItem {
  id: number;
  descripcion_personalizada: string;
  resuelto?: boolean;
}

interface ModalAsignarFallasProps {
  solicitudId: number;
  nBus: string;
  detalles: DetalleItem[];
  detallePreseleccionadoId?: number | null;
  onClose: () => void;
  onAsignacionExitosa: () => void;
}

export default function ModalAsignarFallas({
  solicitudId,
  nBus,
  detalles,
  detallePreseleccionadoId,
  onClose,
  onAsignacionExitosa,
}: ModalAsignarFallasProps) {
  const [selectedMecanicos, setSelectedMecanicos] = useState<MecanicoItem[]>([]);
  const [detallesIds, setDetallesIds] = useState<number[]>(
    detallePreseleccionadoId
      ? [detallePreseleccionadoId]
      : detalles.filter((d) => !d.resuelto).map((d) => d.id)
  );
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleDetalle = (id: number) => {
    const d = detalles.find((item) => item.id === id);
    if (d?.resuelto) return; // Inmutable si ya está resuelta
    setDetallesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmar = async () => {
    if (selectedMecanicos.length === 0) {
      setErrorMsg('Debe seleccionar a un mecánico para la asignación.');
      return;
    }
    if (detallesIds.length === 0) {
      setErrorMsg('Debe seleccionar al menos 1 avería para asignar.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const mecanico = selectedMecanicos[0];
      await asignarDesdeSupervision(solicitudId, {
        mecanico_id: mecanico.id,
        detalles_ids: detallesIds,
        comentario: comentario.trim() || undefined,
      });

      onAsignacionExitosa();
      onClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'No se pudo realizar la asignación de averías.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <UserCheck size={22} />
            <h3 className="font-black text-base text-slate-900">
              Asignar Averías • Bus {nBus} (#{solicitudId})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selector de Mecánico */}
        <div>
          <MecanicoSelector
            selectedMecanicos={selectedMecanicos}
            onChange={(selected) => setSelectedMecanicos(selected.slice(-1))} // Selección de 1 mecánico principal
            label="Mecánico Asignado *"
            placeholder="Buscar mecánico por nombre..."
          />
        </div>

        {/* Lista de Averías */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Averías a Encargar ({detallesIds.length} seleccionadas):
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {detalles.map((d) => {
              const isChecked = detallesIds.includes(d.id);
              const isResuelta = Boolean(d.resuelto);
              return (
                <label
                  key={d.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition select-none ${
                    isResuelta
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : isChecked
                      ? 'bg-indigo-50/70 border-indigo-300 font-bold text-indigo-950 cursor-pointer'
                      : 'bg-white border-slate-200 text-slate-600 cursor-pointer'
                  }`}
                  title={isResuelta ? 'Avería ya resuelta (bloqueada)' : undefined}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isResuelta}
                    onChange={() => {
                      if (!isResuelta) toggleDetalle(d.id);
                    }}
                    className={`w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 ${
                      isResuelta ? 'cursor-not-allowed accent-emerald-600' : 'cursor-pointer'
                    }`}
                  />
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span className={isResuelta ? 'line-through text-slate-400' : ''}>
                      {d.descripcion_personalizada}
                    </span>
                    {isResuelta && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        Resuelta ✓
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Comentario / Instrucción */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Instrucción u Observación de Supervisión:
          </label>
          <textarea
            rows={2}
            placeholder="Ej: Despacho prioritario turno mañana..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
            <span>{loading ? 'Asignando...' : 'Confirmar Asignación'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
