import { useEffect } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X, RefreshCw } from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'primary';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: ModalVariant;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'primary',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmacionProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto && !cargando) {
        onCancelar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, cargando, onCancelar]);

  if (!abierto) return null;

  const getVariantStyles = () => {
    switch (variante) {
      case 'danger':
        return {
          iconBox: 'bg-red-50 text-red-600 border border-red-200',
          btnConfirmar:
            'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm shadow-red-200',
          icon: <AlertCircle size={28} className="text-red-600" />,
        };
      case 'warning':
        return {
          iconBox: 'bg-amber-50 text-amber-600 border border-amber-200',
          btnConfirmar:
            'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm shadow-amber-200',
          icon: <AlertTriangle size={28} className="text-amber-600" />,
        };
      case 'primary':
      default:
        return {
          iconBox: 'bg-blue-50 text-blue-600 border border-blue-200',
          btnConfirmar:
            'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-200',
          icon: <HelpCircle size={28} className="text-blue-600" />,
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirm-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        {/* Cabecera */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${currentStyles.iconBox}`}
            >
              {currentStyles.icon}
            </div>
            <div>
              <h3
                id="modal-confirm-title"
                className="text-lg font-black text-slate-900 leading-snug"
              >
                {titulo}
              </h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Confirmación Operacional
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div className="px-6 py-2">
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {mensaje}
          </p>
        </div>

        {/* Botones de Acción (mínimo 44px de altura táctil) */}
        <div className="p-6 pt-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:bg-slate-100 active:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer ${currentStyles.btnConfirmar}`}
          >
            {cargando ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{textoConfirmar}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
