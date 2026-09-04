import { PackageX } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';

export interface ModalReportarRepuestoProps {
  data: {
    detalleId: number;
    descripcion: string;
    actualFalta: boolean;
  } | null;
  comentarioRepuesto: string;
  accionLoading: boolean;
  onComentarioChange: (val: string) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalReportarRepuesto({
  data,
  comentarioRepuesto,
  accionLoading,
  onComentarioChange,
  onConfirmar,
  onClose,
}: ModalReportarRepuestoProps) {
  if (!data) return null;

  return (
    <ModalBase
      isOpen={Boolean(data)}
      onClose={onClose}
      title={!data.actualFalta ? 'Reportar Falta de Repuesto' : 'Desbloquear Repuesto'}
      icon={<PackageX size={20} className="text-red-600" />}
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
            className={`flex-1 py-2.5 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition ${
              !data.actualFalta
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {accionLoading
              ? 'Guardando...'
              : !data.actualFalta
              ? 'Bloquear por Repuesto'
              : 'Desbloquear y Continuar'}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="p-3 bg-slate-50 border rounded-xl text-xs">
          <span className="font-black text-slate-500 uppercase text-[10px]">
            Avería afectada:
          </span>
          <p className="font-bold text-slate-800 mt-0.5">{data.descripcion}</p>
        </div>

        {!data.actualFalta ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Código o Nombre del Repuesto Necesario:
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Se necesita retén de caja de cambios código RT-889..."
              value={comentarioRepuesto}
              onChange={(e) => onComentarioChange(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs font-semibold focus:border-red-600 outline-none"
            />
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              Esto generará una alerta de severidad ALTA en el panel de Supervisión.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed">
            ¿Confirma que el repuesto ya fue recibido en taller y se puede reanudar la
            reparación?
          </p>
        )}
      </div>
    </ModalBase>
  );
}
