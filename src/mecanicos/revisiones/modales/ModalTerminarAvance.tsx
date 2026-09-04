import { PauseCircle, Clock } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import type { SolicitudDTO } from '../../../types/mantencion';

export interface ModalTerminarAvanceProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  comentarioAvance: string;
  accionLoading: boolean;
  onComentarioChange: (val: string) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalTerminarAvance({
  isOpen,
  solicitud,
  comentarioAvance,
  accionLoading,
  onComentarioChange,
  onConfirmar,
  onClose,
}: ModalTerminarAvanceProps) {
  if (!solicitud) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Terminar Avance / Pausar Turno (Bus ${solicitud.n_bus})`}
      icon={<PauseCircle size={22} className="text-amber-600" />}
      maxWidth="md"
      footer={
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={accionLoading}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200 transition min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={accionLoading}
            className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px]"
          >
            <Clock size={16} />
            <span>{accionLoading ? 'Registrando...' : 'Confirmar Término de Avance'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
          <p className="font-bold">
            Esta acción pausa o entrega el turno para toda la cuadrilla activa en la máquina.
          </p>
          <p className="mt-1 text-amber-800 text-[11px]">
            La solicitud pasará a estado <strong>PENDIENTE</strong>, el bus permanecerá en taller y el backend registrará el tiempo cronometrado exacto trabajado por cada mecánico.
          </p>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
            Novedades o estado en que deja la máquina la cuadrilla (Opcional):
          </label>
          <textarea
            rows={3}
            placeholder="Ej: Se cambiaron pastillas delanteras; queda pendiente purga de frenos para el siguiente turno..."
            value={comentarioAvance}
            onChange={(e) => onComentarioChange(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition bg-white"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Permite al siguiente equipo saber exactamente qué labores quedaron pendientes.
          </p>
        </div>
      </div>
    </ModalBase>
  );
}
