import React, { useState, useEffect } from 'react';
import {
  Trash2,
  CheckCircle2,
  RefreshCw,
  Wrench,
  AlertCircle,
  Check,
  Send,
  ClipboardList,
  X,
  Edit3
} from 'lucide-react';
import './FormularioMantencionTaller.css';
import BusSelector, { type BusItem } from '../../components/BusSelector/BusSelector';
import PhotoSelector from '../../components/PhotoSelector/PhotoSelector';
import { guardarDato, obtenerDato } from '../../utils/storage';
import { crearSolicitud, type SolicitudCreateDTO } from './mantencionService';
import { getApiErrorMessage } from '../../utils/apiErrors';

interface FallaItem {
  id: number;
  nombre: string;
  categoriaId?: number | null;
  resuelto: string;
}

interface SubmittedSuccess {
  id: number | string;
  n_bus: string;
  conductor: string;
  itemsCount: number;
}

const TOUCH_CATEGORIES = [
  { id: 'frenos', categoriaId: 1, label: 'Frenos', icon: '🛑' },
  { id: 'luces', categoriaId: 2, label: 'Luces / Eléctrico', icon: '⚡' },
  { id: 'motor', categoriaId: 3, label: 'Motor', icon: '⚙️' },
  { id: 'carroceria', categoriaId: 4, label: 'Carrocería', icon: '🚌' },
  { id: 'climatizacion', categoriaId: 5, label: 'Climatización', icon: '❄️', fullWidth: true },
];

interface FormularioMantencionTallerProps {
  onVolver?: () => void;
}

export default function FormularioMantencionTaller({ onVolver }: FormularioMantencionTallerProps = {}) {
  // Bus Selection State
  const [busSearchInput, setBusSearchInput] = useState('');
  const [selectedBusObj, setSelectedBusObj] = useState<BusItem | null>(null);

  // Form Fields
  const [conductorNombre, setConductorNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Dynamic Items list (MANDATORY)
  const [newItemText, setNewItemText] = useState('');
  const [itemsList, setItemsList] = useState<FallaItem[]>([]);

  // Photo upload
  const [fotoBase64, setFotoBase64] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Submit & Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState<SubmittedSuccess | null>(null);

  // Cargar conductor o usuario guardado localmente en el celular
  useEffect(() => {
    const cargarDatosGuardados = async () => {
      const rutGuardado = await obtenerDato('usuario_rut');
      const nombreGuardado = await obtenerDato('usuario_nombre');
      const choferFinal = nombreGuardado || rutGuardado || '';
      if (choferFinal && !conductorNombre) {
        setConductorNombre(choferFinal);
      }
    };
    cargarDatosGuardados();
  }, []);

  const getEffectiveBusNumber = () => {
    if (selectedBusObj) {
      const match = String(selectedBusObj.n_bus).match(/\d+/);
      return match ? match[0] : String(selectedBusObj.n_bus).trim();
    }
    const match = busSearchInput.match(/\d+/);
    return match ? match[0] : busSearchInput.trim();
  };

  const handleToggleCategory = (cat: typeof TOUCH_CATEGORIES[0]) => {
    setErrorMsg('');
    if (itemsList.some((item) => item.nombre.toLowerCase() === cat.label.toLowerCase())) {
      setItemsList((prev) => prev.filter((item) => item.nombre.toLowerCase() !== cat.label.toLowerCase()));
    } else {
      setItemsList((prev) => [
        ...prev,
        { id: Date.now(), nombre: cat.label, categoriaId: cat.categoriaId, resuelto: 'NO' },
      ]);
    }
  };

  const handleAddCustomItem = () => {
    if (!newItemText || !newItemText.trim()) return;
    const cleanText = newItemText.trim();
    setErrorMsg('');
    if (itemsList.some((item) => item.nombre.toLowerCase() === cleanText.toLowerCase())) {
      setNewItemText('');
      return;
    }
    setItemsList((prev) => [
      ...prev,
      { id: Date.now(), nombre: cleanText, categoriaId: 6, resuelto: 'NO' }, // 6 = OTRO en backend
    ]);
    setNewItemText('');
  };

  const handleRemoveItem = (idToRemove: number) => {
    setItemsList((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const busNumber = getEffectiveBusNumber();
    if (!busNumber) {
      setErrorMsg('⚠️ OBLIGATORIO: Debes seleccionar o indicar el número de bus.');
      return;
    }

    if (itemsList.length === 0) {
      setErrorMsg('⚠️ OBLIGATORIO: Debes seleccionar o ingresar al menos 1 falla a revisar.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    const busNumber = getEffectiveBusNumber();
    const cleanBusNumber = busNumber.replace(/\D/g, '') || busNumber.trim();
    const conductorFinal = conductorNombre.trim() || 'CONDUCTOR-NARBUS';

    try {
      setSubmitting(true);
      const payload: SolicitudCreateDTO = {
        n_bus: cleanBusNumber,
        descripcion_general: descripcion.trim() || `Reporte de mantención para bus ${cleanBusNumber}`,
        foto_url: fotoBase64 || null,
        detalles: itemsList.map((it) => ({
          categoria_id: it.categoriaId ?? null,
          falla_id: null,
          descripcion_personalizada: it.nombre,
        })),
      };

      console.log('Enviando Solicitud Taller (POST /api/v1/mantencion/solicitudes):', payload);
      const resData = await crearSolicitud(payload);
      const solicitudId = resData?.id || 1;

      if (conductorFinal) {
        await guardarDato('usuario_rut', conductorFinal);
      }
      await guardarDato(
        'ultimo_reporte_mantencion',
        JSON.stringify({
          id: solicitudId,
          n_bus: cleanBusNumber,
          conductor: conductorFinal,
          fecha: new Date().toLocaleString(),
          itemsCount: itemsList.length,
        })
      );

      setShowConfirmModal(false);
      setSubmittedSuccess({
        id: solicitudId,
        n_bus: cleanBusNumber,
        conductor: conductorFinal,
        itemsCount: itemsList.length,
      });
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      setErrorMsg(getApiErrorMessage(err, 'Ocurrió un error al enviar la solicitud. Por favor reintenta.'));
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedBusObj(null);
    setBusSearchInput('');
    setConductorNombre('');
    setDescripcion('');
    setItemsList([]);
    setFotoBase64('');
    setFotoPreview(null);
    setSubmittedSuccess(null);
    setErrorMsg('');
    setShowConfirmModal(false);
  };

  // VISTA DE ÉXITO
  if (submittedSuccess) {
    return (
      <div className="fmt-success-wrapper font-sans text-slate-900">
        <div className="fmt-success-card relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle2 size={48} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            ¡Solicitud Registrada con Éxito!
          </h2>
          <p className="text-sm font-bold text-emerald-600 mb-5">
            La orden de trabajo fue transmitida al taller central.
          </p>

          <div className="fmt-modal-summary-box text-left mb-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">N° de Folio:</span>
              <span className="font-black text-blue-600 text-base">#{submittedSuccess.id}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Unidad / Bus:</span>
              <span className="font-black text-slate-900 text-base">Bus N° {submittedSuccess.n_bus}</span>
            </div>
            {submittedSuccess.conductor && (
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-600 uppercase text-xs">Informante:</span>
                <span className="font-bold text-slate-800">{submittedSuccess.conductor}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-slate-600 uppercase text-xs">Fallas Registradas:</span>
              <span className="font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                {submittedSuccess.itemsCount} ítem(s)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="fmt-btn-submit cursor-pointer"
          >
            <RefreshCw size={20} />
            <span>Ingresar Otra Solicitud</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fmt-wrapper font-sans text-slate-900">
      <div className="fmt-card">
        {/* Header Corporativo Oficial Narbus */}
        <div className="fmt-header">
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-black text-white bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <span>← Volver al Menú Principal</span>
            </button>
          )}
          <div className="fmt-header-inner">
            <div className="fmt-header-icon-box">
              <Wrench size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="fmt-badge-company">NARBUS BUSES</span>
                <span className="fmt-badge-subtitle">FLOTA & TALLER</span>
              </div>
              <h1 className="fmt-header-title">Solicitud de Mantención</h1>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePreSubmit} className="fmt-form-body">
          {errorMsg && (
            <div className="fmt-error-alert">
              <AlertCircle size={22} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PASO 1: ¿QUÉ BUS ES? */}
          <BusSelector
            stepNumber={1}
            label="Identificación del Bus"
            placeholder="Escribir N° de bus (ej: 420)..."
            value={busSearchInput}
            onChange={(val, busObj) => {
              setBusSearchInput(val);
              setSelectedBusObj(busObj || null);
            }}
            onClearError={() => setErrorMsg('')}
          />

          {/* PASO 2: TOCA LAS FALLAS */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="fmt-step-header">
              <div className="fmt-step-title-group">
                <span className="fmt-step-badge">2</span>
                <label className="fmt-step-label">
                  Trabajos / Repuestos a Revisar:
                </label>
              </div>
              <span className="fmt-required-badge">* Mínimo 1 falla</span>
            </div>

            {/* Grid de Botones Táctiles Directos */}
            <div className="fmt-category-grid">
              {TOUCH_CATEGORIES.map((cat) => {
                const isSelected = itemsList.some(
                  (item) => item.nombre.toLowerCase() === cat.label.toLowerCase()
                );
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`fmt-category-btn ${isSelected ? 'fmt-category-btn-selected' : ''} ${
                      cat.fullWidth ? 'fmt-category-btn-full' : ''
                    }`}
                  >
                    <span className="text-lg shrink-0">{cat.icon}</span>
                    <span className="flex-1 line-clamp-1 select-none font-bold">{cat.label}</span>
                    {isSelected && <Check size={16} className="text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Apartado de Otros / Input adicional libre */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Otro trabajo o falla no listada:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escriba otra observación, falla o repuesto..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shrink-0 cursor-pointer shadow-sm"
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Lista visual de ítems seleccionados */}
            {itemsList.length > 0 ? (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black text-slate-600 block uppercase tracking-wider">
                  Ítems Seleccionados ({itemsList.length}):
                </span>
                {itemsList.map((item) => (
                  <div key={item.id} className="fmt-selected-item">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">{item.nombre}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-red-600 hover:text-red-800 font-bold transition cursor-pointer"
                      title="Quitar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 text-center">
                👉 Seleccione al menos 1 falla de los botones superiores o ingrese una en "Otros".
              </div>
            )}
          </div>

          {/* PASO 3: INFORMACIÓN ADICIONAL */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="fmt-step-header">
              <div className="fmt-step-title-group">
                <span className="fmt-step-badge">3</span>
                <label className="fmt-step-label">
                  INFORMACIÓN ADICIONAL:
                </label>
              </div>
            </div>

            {/* Comentario / Detalle libre (Opcional) */}
            <textarea
              rows={2}
              placeholder="Comentario o detalle extra de la falla (opcional)..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="fmt-input text-xs resize-none"
            />

            {/* Fotografía de evidencia opcional */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                Adjuntar Fotografía de Evidencia (Opcional):
              </label>
              <PhotoSelector
                fotoPreview={fotoPreview}
                onChange={(base64) => {
                  setFotoBase64(base64 || '');
                  setFotoPreview(base64);
                }}
                buttonText="Tomar o Seleccionar Foto"
              />
            </div>
          </div>

          {/* BOTÓN GIGANTE ENVIAR A TALLER */}
          <button
            type="submit"
            className="fmt-btn-submit cursor-pointer"
          >
            <span>🚀 ENVIAR REPORTE A TALLER</span>
          </button>
        </form>
      </div>

      {/* MODAL DE CONFIRMACIÓN EJECUTIVO CON RESUMEN */}
      {showConfirmModal && (
        <div className="fmt-modal-overlay">
          <div className="fmt-modal-card animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Resumen de Solicitud</h3>
                  <p className="text-[11px] font-bold text-slate-500">Confirme los datos antes de transmitir al taller</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* RESUMEN DEL REPORTE */}
            <div className="fmt-modal-summary-box">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">Unidad / Bus:</span>
                <span className="fmt-modal-bus-pill">
                  Bus N° {getEffectiveBusNumber()}
                </span>
              </div>

              <div className="border-b border-slate-200 pb-2.5">
                <span className="font-black text-slate-500 uppercase text-[11px] block mb-1.5">
                  Ítems / Fallas a Revisar ({itemsList.length}):
                </span>
                <div className="space-y-1.5">
                  {itemsList.map((it, idx) => (
                    <div key={idx} className="fmt-modal-item-row">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span className="text-xs font-black text-slate-900">{it.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-black text-slate-500 uppercase text-[11px]">Informante:</span>
                <span className="font-black text-slate-900 text-sm">{conductorNombre.trim() || 'No especificado'}</span>
              </div>

              {descripcion.trim() && (
                <div className="border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-500 uppercase text-[11px] block">Observaciones:</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5 italic">"{descripcion.trim()}"</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-0.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">Foto Evidencia:</span>
                <span className={`font-black ${fotoPreview ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {fotoPreview ? 'Foto Adjunta ✓' : 'Sin foto'}
                </span>
              </div>
            </div>

            {/* BOTONES DE CONFIRMACIÓN */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 size={16} />
                <span>Modificar</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="fmt-btn-submit flex-1 py-3.5 text-xs rounded-xl mt-0 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Transmitiendo...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Confirmar y Enviar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
