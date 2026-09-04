import { MessageSquare } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import type { SolicitudDTO } from '../../../conductores/mantencion/mantencionService';

export interface ModalNuevaObservacionProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  comentarioTipo: string;
  comentarioTexto: string;
  accionLoading: boolean;
  onTipoChange: (tipo: string) => void;
  onTextoChange: (texto: string) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalNuevaObservacion({
  isOpen,
  solicitud,
  comentarioTipo,
  comentarioTexto,
  accionLoading,
  onTipoChange,
  onTextoChange,
  onConfirmar,
  onClose,
}: ModalNuevaObservacionProps) {
  if (!solicitud) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Agregar Nota a Bitácora #${solicitud.id}`}
      icon={<MessageSquare size={20} className="text-indigo-600" />}
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
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
          >
            {accionLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tipo de Registro:
          </label>
          <select
            value={comentarioTipo}
            onChange={(e) => onTipoChange(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs font-semibold mb-3 focus:border-indigo-600 outline-none"
          >
            <option value="GENERAL">GENERAL</option>
            <option value="AVANCE">AVANCE DE TRABAJO</option>
            <option value="BLOQUEO">BLOQUEO OPERACIONAL</option>
            <option value="TURNO">NOVEDAD DE TURNO</option>
            <option value="CIERRE">INFORME DE CIERRE</option>
          </select>

          <label className="block text-xs font-bold text-slate-700 mb-1">Nota Técnica *:</label>
          <textarea
            rows={3}
            placeholder="Escriba aquí la observación o diagnóstico..."
            value={comentarioTexto}
            onChange={(e) => onTextoChange(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs font-semibold focus:border-indigo-600 outline-none"
          />
        </div>
      </div>
    </ModalBase>
  );
}
