import { FileCheck, AlertTriangle } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import type { SolicitudDTO, PautaEstadoResumenDTO } from '../../../conductores/mantencion/mantencionService';

export interface ModalFinalizarOrdenProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  pautaResumen: PautaEstadoResumenDTO | null;
  motivoIncompletoChecklist: string;
  motivoCierreParcial: string;
  comentarioCierre: string;
  liberarBusTaller: boolean;
  accionLoading: boolean;
  onMotivoIncompletoChange: (val: string) => void;
  onMotivoCierreParcialChange: (val: string) => void;
  onComentarioCierreChange: (val: string) => void;
  onLiberarBusTallerChange: (val: boolean) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalFinalizarOrden({
  isOpen,
  solicitud,
  pautaResumen,
  motivoIncompletoChecklist,
  motivoCierreParcial,
  comentarioCierre,
  liberarBusTaller,
  accionLoading,
  onMotivoIncompletoChange,
  onMotivoCierreParcialChange,
  onComentarioCierreChange,
  onLiberarBusTallerChange,
  onConfirmar,
  onClose,
}: ModalFinalizarOrdenProps) {
  if (!solicitud) return null;

  const tieneAveriasPendientes = solicitud.detalles?.some((d) => !d.resuelto);
  const pautaIncompleta = (pautaResumen?.respondidos ?? 0) < 19;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Finalizar Orden #${solicitud.id} (Bus ${solicitud.n_bus})`}
      icon={<FileCheck size={20} className="text-emerald-600" />}
      maxWidth="lg"
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
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition"
          >
            {accionLoading ? 'Finalizando...' : 'Confirmar Finalización'}
          </button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Alerta de pauta preventiva incompleta */}
        {pautaIncompleta && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-amber-900">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>
                Pauta Preventiva Incompleta ({pautaResumen?.respondidos ?? 0}/19 respondidos)
              </span>
            </div>
            <p className="text-amber-800 text-[11px] font-medium">
              El backend exige justificación para liberar el bus con checklist incompleto:
            </p>
            <textarea
              rows={2}
              placeholder="Motivo de checklist incompleto (ej: No se evaluó A/C por condiciones climáticas)... *"
              value={motivoIncompletoChecklist}
              onChange={(e) => onMotivoIncompletoChange(e.target.value)}
              className="w-full p-2 border border-amber-300 rounded-xl text-xs font-semibold bg-white focus:border-amber-600 outline-none"
            />
          </div>
        )}

        {/* Alerta de averías pendientes */}
        {tieneAveriasPendientes && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-red-900">
              <AlertTriangle size={15} className="text-red-600" />
              <span>Quedan Averías sin Resolver (Cierre Parcial)</span>
            </div>
            <p className="text-red-800 text-[11px] font-medium">
              Debe justificar el cierre parcial de la orden de trabajo:
            </p>
            <textarea
              rows={2}
              placeholder="Motivo de cierre parcial (ej: Queda pendiente trabajo de pintura menor)... *"
              value={motivoCierreParcial}
              onChange={(e) => onMotivoCierreParcialChange(e.target.value)}
              className="w-full p-2 border border-red-300 rounded-xl text-xs font-semibold bg-white focus:border-red-600 outline-none"
            />
          </div>
        )}

        {/* Comentario general de cierre */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Informe Técnico Final de Cierre:
          </label>
          <textarea
            rows={3}
            placeholder="Describa el trabajo concluido y las pruebas realizadas..."
            value={comentarioCierre}
            onChange={(e) => onComentarioCierreChange(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs font-semibold focus:border-emerald-600 outline-none"
          />
        </div>

        {/* Flag Liberar Bus Taller */}
        <label className="flex items-center gap-2.5 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition">
          <input
            type="checkbox"
            checked={liberarBusTaller}
            onChange={(e) => onLiberarBusTallerChange(e.target.checked)}
            className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-xs font-black text-slate-800">
            Liberar bus físicamente del taller (conmutar en_taller = false)
          </span>
        </label>
      </div>
    </ModalBase>
  );
}
