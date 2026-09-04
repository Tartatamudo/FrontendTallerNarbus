import { Share2 } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import type { SolicitudDTO } from '../../../conductores/mantencion/mantencionService';

export interface ModalLiberarTurnoProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  comentarioLiberar: string;
  accionLoading: boolean;
  onComentarioChange: (val: string) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalLiberarTurno({
  isOpen,
  solicitud,
  comentarioLiberar,
  accionLoading,
  onComentarioChange,
  onConfirmar,
  onClose,
}: ModalLiberarTurnoProps) {
  if (!solicitud) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Entregar Turno del Equipo (Bus ${solicitud.n_bus})`}
      icon={<Share2 size={20} className="text-blue-600" />}
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
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
          >
            {accionLoading ? 'Entregando...' : 'Entregar Turno'}
          </button>
        </div>
      }
    >
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Informe de Entrega para el Turno Entrante:
        </label>
        <textarea
          rows={3}
          placeholder="Ej: Cambio de turno noche. Se probaron inyectores y falta calibrar..."
          value={comentarioLiberar}
          onChange={(e) => onComentarioChange(e.target.value)}
          className="w-full p-2.5 border rounded-xl text-xs font-semibold focus:border-blue-600 outline-none"
        />
      </div>
    </ModalBase>
  );
}
