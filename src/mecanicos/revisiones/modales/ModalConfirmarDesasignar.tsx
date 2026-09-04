import { LogOut } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';

export interface ModalConfirmarDesasignarProps {
  solicitudId: number | null;
  comentario: string;
  accionLoading: boolean;
  onComentarioChange: (val: string) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalConfirmarDesasignar({
  solicitudId,
  comentario,
  accionLoading,
  onComentarioChange,
  onConfirmar,
  onClose,
}: ModalConfirmarDesasignarProps) {
  if (!solicitudId) return null;

  return (
    <ModalBase
      isOpen={Boolean(solicitudId)}
      onClose={onClose}
      title={`Desasignarme de la Orden #${solicitudId}`}
      icon={<LogOut size={20} className="text-slate-700" />}
      maxWidth="md"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={accionLoading}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={accionLoading}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
          >
            {accionLoading ? 'Desasignando...' : 'Confirmar Salida'}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          Dejarás de pertenecer al equipo asignado a esta orden de trabajo.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Motivo o Justificación (ej: Fin de turno, reasignación):
          </label>
          <input
            type="text"
            placeholder="Ingresa una razón..."
            value={comentario}
            onChange={(e) => onComentarioChange(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs font-semibold focus:border-slate-800 outline-none"
          />
        </div>
      </div>
    </ModalBase>
  );
}
