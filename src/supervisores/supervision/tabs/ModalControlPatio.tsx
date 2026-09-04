import { Compass, RefreshCw, CheckCircle2 } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import type { BusAutocompleteDTO } from '../../../buses/busesService';

export interface ModalControlPatioProps {
  bus: BusAutocompleteDTO | null;
  motivoPatio: string;
  guardandoPatio: boolean;
  onMotivoChange: (val: string) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalControlPatio({
  bus,
  motivoPatio,
  guardandoPatio,
  onMotivoChange,
  onConfirmar,
  onClose,
}: ModalControlPatioProps) {
  if (!bus) return null;

  return (
    <ModalBase
      isOpen={Boolean(bus)}
      onClose={onClose}
      title={bus.en_taller ? 'Dar Egreso de Patio' : 'Registrar Ingreso a Patio'}
      icon={<Compass size={20} className="text-indigo-600" />}
      maxWidth="md"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={guardandoPatio}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={guardandoPatio}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition"
          >
            {guardandoPatio ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>{guardandoPatio ? 'Guardando...' : 'Confirmar'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-1">
          <p className="font-bold text-slate-800">
            Bus N° {bus.n_bus} • Patente: {bus.patente || 'S/P'}
          </p>
          <p className="text-slate-600 text-[11px]">
            Estado actual:{' '}
            <strong>{bus.en_taller ? 'En Patio Taller' : 'En Ruta Comercial'}</strong>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Motivo u Observación del Movimiento:
          </label>
          <textarea
            rows={3}
            placeholder="Ej: Ingreso por mantención programada de frenos..."
            value={motivoPatio}
            onChange={(e) => onMotivoChange(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs font-semibold focus:border-indigo-600 outline-none"
          />
        </div>
      </div>
    </ModalBase>
  );
}
