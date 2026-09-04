import { ClipboardList, RefreshCw, Send } from 'lucide-react';

export interface ModalConfirmarMantencionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  nBus: string;
  itemsCount: number;
  conductorNombre: string;
}

export default function ModalConfirmarMantencion({
  isOpen,
  onClose,
  onConfirm,
  submitting,
  nBus,
  itemsCount,
  conductorNombre,
}: ModalConfirmarMantencionProps) {
  if (!isOpen) return null;

  return (
    <div className="fmt-modal-overlay">
      <div className="fmt-modal-card animate-in fade-in zoom-in-95">
        <div className="fmt-modal-header">
          <div className="fmt-modal-icon-box">
            <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="fmt-modal-title">Confirmar Solicitud de Taller</h3>
            <p className="fmt-modal-subtitle">Verifique los datos antes de emitir la orden</p>
          </div>
        </div>

        <div className="fmt-modal-summary-box space-y-2">
          <div className="flex justify-between items-center border-b pb-1.5 text-xs font-bold">
            <span className="text-slate-500">Unidad:</span>
            <span className="text-slate-900 text-sm">Bus N° {nBus}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-1.5 text-xs font-bold">
            <span className="text-slate-500">Averías a Revisar:</span>
            <span className="text-indigo-600">{itemsCount} ítem(s)</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">Informante:</span>
            <span className="text-slate-800">{conductorNombre || 'CONDUCTOR-NARBUS'}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Modificar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            <span>{submitting ? 'Emitiendo Orden...' : 'Confirmar Envío'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
