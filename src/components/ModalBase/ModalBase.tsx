import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './ModalBase.css';

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function ModalBase({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  icon,
  footer,
}: ModalBaseProps) {
  // Cerrar con Escape y bloquear scroll del body
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`modal-base-card rounded-3xl w-full ${MAX_WIDTH_MAP[maxWidth]} p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 modal-base-header">
          <div className="flex items-center gap-2.5 font-black text-base sm:text-lg modal-base-title">
            {icon && <span className="shrink-0">{icon}</span>}
            <div className="leading-tight">{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl modal-base-close-btn"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="modal-base-body text-sm">{children}</div>

        {/* Pie opcional */}
        {footer && <div className="pt-3 modal-base-footer">{footer}</div>}
      </div>
    </div>
  );
}
