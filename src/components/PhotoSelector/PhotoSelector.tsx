import React, { useState, useRef } from 'react';
import { Camera, ZoomIn, Maximize2, X, Trash2 } from 'lucide-react';
import { capturarFotoCamara, seleccionarFotoGaleria } from '../../utils/capacitorCamera';
import './PhotoSelector.css';

export interface PhotoSelectorProps {
  fotoPreview: string | null;
  onChange: (base64: string | null, file: File | null) => void;
  buttonText?: string;
  className?: string;
}

// Convertir Base64 DataUrl a un objeto File para formularios Multipart/FormData
const dataURLtoFile = (dataurl: string, filename = 'evidencia.jpg'): File => {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    return new File([], filename, { type: 'image/jpeg' });
  }
};

export default function PhotoSelector({
  fotoPreview,
  onChange,
  buttonText,
  className = '',
}: PhotoSelectorProps) {
  const [showZoomModal, setShowZoomModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectPhoto = async () => {
    try {
      // 1. Probar captura con cámara nativa
      let fotoDataUrl = await capturarFotoCamara();

      // 2. Si se canceló o falló la cámara nativa, probar la galería del dispositivo
      if (!fotoDataUrl) {
        fotoDataUrl = await seleccionarFotoGaleria();
      }

      if (fotoDataUrl) {
        const fileObj = dataURLtoFile(fotoDataUrl);
        onChange(fotoDataUrl, fileObj);
      } else {
        // 3. Fallback a selector de archivos web si no se obtuvo resultado nativo
        fileInputRef.current?.click();
      }
    } catch (err) {
      console.warn("Falló integración nativa, utilizando selector de archivos web:", err);
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onChange(base64, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`photo-selector-container ${className}`}>
      {/* Botón único principal de cámara / galería */}
      <button
        type="button"
        onClick={handleSelectPhoto}
        className="photo-selector-btn"
      >
        <div className="photo-selector-icon-badge">
          <Camera size={26} className="photo-selector-icon" />
        </div>
        <div className="photo-selector-text-group">
          <span className="photo-selector-btn-title">
            {fotoPreview
              ? 'Cambiar Fotografía'
              : buttonText || 'Sacar Foto / Adjuntar'}
          </span>
          <span className="photo-selector-btn-subtitle">
            Cámara Nativa o Galería del Dispositivo
          </span>
        </div>
      </button>

      {/* Input de archivo fallback oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Vista previa de la foto seleccionada */}
      {fotoPreview && (
        <div className="photo-selector-preview-wrapper animate-in fade-in duration-200">
          <div className="photo-selector-preview-header">
            <span className="photo-selector-preview-title">
              <ZoomIn size={14} className="text-blue-600 shrink-0" />
              Vista Previa (Toca para agrandar):
            </span>
            <button
              type="button"
              onClick={handleClearPhoto}
              className="photo-selector-remove-btn"
              title="Quitar foto"
            >
              <Trash2 size={13} />
              <span>Quitar Foto</span>
            </button>
          </div>

          <div
            onClick={() => setShowZoomModal(true)}
            className="photo-selector-image-card group"
          >
            <img
              src={fotoPreview}
              alt="Evidencia Adjunta"
              className="photo-selector-image"
            />
            <div className="photo-selector-zoom-badge">
              <Maximize2 size={14} />
              <span>Ver Pantalla Completa</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Zoom Pantalla Completa */}
      {showZoomModal && fotoPreview && (
        <div
          className="photo-selector-modal-overlay animate-in fade-in duration-200"
          onClick={() => setShowZoomModal(false)}
        >
          <div
            className="photo-selector-modal-card animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-selector-modal-header">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-blue-400" />
                <span className="font-extrabold text-white text-sm">
                  Vista de Fotografía
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="photo-selector-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="photo-selector-modal-body">
              <img
                src={fotoPreview}
                alt="Vista Completa"
                className="photo-selector-modal-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
