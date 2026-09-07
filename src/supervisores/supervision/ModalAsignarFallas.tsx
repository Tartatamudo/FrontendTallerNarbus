import { useState } from 'react';
import { UserCheck, X, RefreshCw, AlertCircle } from 'lucide-react';
import MecanicoSelector from '../../components/MecanicoSelector/MecanicoSelector';
import { type MecanicoItem } from '../../usuarios/auth/authService';
import { asignarDesdeSupervision } from './supervisionService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import './ModalAsignarFallas.css';

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
      <div className="maf-card">
        <div className="maf-header">
          <div className="flex items-center gap-2">
            <UserCheck size={22} className="maf-icon" />
            <h3 className="maf-title">
              Asignar Averías • Bus {nBus} (#{solicitudId})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="maf-close-btn"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl flex items-center gap-2 [data-theme=light]_&:bg-red-50 [data-theme=light]_&:border-red-200 [data-theme=light]_&:text-red-700">
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
          <label className="maf-label">
            Averías a Encargar ({detallesIds.length} seleccionadas):
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {detalles.map((d) => {
              const isChecked = detallesIds.includes(d.id);
              const isResuelta = Boolean(d.resuelto);
              const statusClass = isResuelta
                ? 'maf-averia-resuelta'
                : isChecked
                ? 'maf-averia-checked'
                : '';

              return (
                <label
                  key={d.id}
                  className={`maf-averia-item ${statusClass}`}
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
                    <span className={isResuelta ? 'line-through opacity-70' : ''}>
                      {d.descripcion_personalizada}
                    </span>
                    {isResuelta && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0 [data-theme=light]_&:text-emerald-700 [data-theme=light]_&:bg-emerald-100 [data-theme=light]_&:border-transparent">
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
          <label className="maf-label">
            Instrucción u Observación de Supervisión:
          </label>
          <textarea
            rows={2}
            placeholder="Ej: Despacho prioritario turno mañana..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="maf-textarea"
          />
        </div>

        <div className="maf-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="maf-btn-cancelar"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
            <span>{loading ? 'Asignando...' : 'Confirmar Asignación'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
