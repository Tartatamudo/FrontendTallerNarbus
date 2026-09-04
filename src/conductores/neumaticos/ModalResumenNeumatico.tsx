import { X, ClipboardList, Edit3 } from 'lucide-react';

export interface ModalResumenNeumaticoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  maquina: string;
  chofer: string;
  ruedasSeleccionadas: string[];
  motivo: string;
  otroMotivo: string;
  precio: string;
  marcaFuego: string;
  hasFoto: boolean;
}

export default function ModalResumenNeumatico({
  isOpen,
  onClose,
  onConfirm,
  submitting,
  maquina,
  chofer,
  ruedasSeleccionadas,
  motivo,
  otroMotivo,
  precio,
  marcaFuego,
  hasFoto,
}: ModalResumenNeumaticoProps) {
  if (!isOpen) return null;

  const motivoTexto = motivo === 'Otro' ? otroMotivo : motivo;
  const ruedasFormateadas = [...ruedasSeleccionadas]
    .sort((a, b) => Number(a) - Number(b))
    .map((r) => `Rueda ${r}`)
    .join(', ');

  return (
    <div className="fn-modal-overlay">
      <div className="fn-modal-card animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ClipboardList size={22} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Resumen del Reporte</h3>
              <p className="text-[11px] font-bold text-slate-500">
                Confirme los datos antes de transmitir la información
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BOX RESUMEN */}
        <div className="fn-modal-summary-box">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="font-black text-slate-500 uppercase text-[11px]">Unidad / Máquina:</span>
            <span className="fn-modal-bus-pill">Bus N° {maquina}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="font-black text-slate-500 uppercase text-[11px]">Conductor:</span>
            <span className="font-black text-slate-900 text-sm">{chofer}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="font-black text-slate-500 uppercase text-[11px]">Ruedas Afectadas:</span>
            <span className="font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-300">
              {ruedasFormateadas}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <span className="font-black text-slate-500 uppercase text-[11px]">Motivo:</span>
            <span className="font-black text-slate-900">{motivoTexto}</span>
          </div>

          {precio && (
            <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
              <span className="font-black text-slate-500 uppercase text-[11px]">Valor Pagado:</span>
              <span className="font-black text-emerald-700 text-sm">${precio}</span>
            </div>
          )}

          {marcaFuego && (
            <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
              <span className="font-black text-slate-500 uppercase text-[11px]">Marca de Fuego:</span>
              <span className="font-black text-slate-900">#{marcaFuego}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-0.5">
            <span className="font-black text-slate-500 uppercase text-[11px]">Comprobante Boleta:</span>
            <span className={`font-black ${hasFoto ? 'text-emerald-700' : 'text-slate-400'}`}>
              {hasFoto ? 'Foto Adjunta ✓' : 'Sin foto'}
            </span>
          </div>
        </div>

        {/* BOTONES DE CONFIRMACIÓN */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Edit3 size={16} />
            <span>Modificar</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="fn-btn-submit flex-1 py-3.5 text-xs rounded-xl mt-0"
          >
            {submitting ? 'Transmitiendo...' : 'Confirmar y Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
