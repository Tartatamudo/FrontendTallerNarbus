import { useEffect } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X, RefreshCw } from 'lucide-react';
import './ModalConfirmacion.css';

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
          iconBoxClass: 'mc-icon-danger',
          btnConfirmarClass: 'mc-btn-confirm-danger',
          icon: <AlertCircle size={28} />,
        };
      case 'warning':
        return {
          iconBoxClass: 'mc-icon-warning',
          btnConfirmarClass: 'mc-btn-confirm-warning',
          icon: <AlertTriangle size={28} />,
        };
      case 'primary':
      default:
        return {
          iconBoxClass: 'mc-icon-primary',
          btnConfirmarClass: 'mc-btn-confirm-primary',
          icon: <HelpCircle size={28} />,
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div
      className="mc-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirm-title"
    >
      <div className="mc-card">
        {/* Cabecera */}
        <div className="mc-header">
          <div className="flex items-center gap-3.5">
            <div className={`mc-icon-box ${currentStyles.iconBoxClass}`}>
              {currentStyles.icon}
            </div>
            <div>
              <h3 id="modal-confirm-title" className="mc-title">
                {titulo}
              </h3>
              <p className="mc-subtitle">
                Confirmación Operacional
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="mc-btn-close"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div className="mc-body">
          <p className="mc-message">
            {mensaje}
          </p>
        </div>

        {/* Botones de Acción (mínimo 44px de altura táctil) */}
        <div className="mc-footer">
          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="mc-btn-cancel"
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className={currentStyles.btnConfirmarClass}
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
