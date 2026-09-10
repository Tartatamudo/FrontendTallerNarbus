import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  Camera,
  ImagePlus
} from 'lucide-react';
import './FormularioMantencionTaller.css';
import BusSelector, { type BusItem } from '../../components/BusSelector/BusSelector';
import { guardarDato, obtenerDato } from '../../utils/storage';
import { capturarFotoCamara, seleccionarFotoGaleria } from '../../utils/capacitorCamera';
import { crearSolicitud, obtenerCategorias, type SolicitudCreateDTO, type CategoriaFalla } from './mantencionService';
import { getApiErrorMessage } from '../../utils/apiErrors';

interface FallaItem {
  id: number;
  nombre: string;
  categoriaId?: number | null;
  fallaId?: number | null;
  fallaNombre?: string | null;
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

export default function FormularioMantencionTaller({ onVolver: _onVolver }: FormularioMantencionTallerProps = {}) {
  // Bus Selection State
  const [busSearchInput, setBusSearchInput] = useState('');
  const [selectedBusObj, setSelectedBusObj] = useState<BusItem | null>(null);
  const [isBusValido, setIsBusValido] = useState(false);

  // Form Fields
  const [conductorNombre, setConductorNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Dynamic Items list (MANDATORY)
  const [newItemText, setNewItemText] = useState('');
  const [itemsList, setItemsList] = useState<FallaItem[]>([]);
  const [categoriasDb, setCategoriasDb] = useState<CategoriaFalla[]>([]);

  // Photo upload — múltiples fotos de evidencia
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit & Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState<SubmittedSuccess | null>(null);

  // Cargar conductor o usuario guardado localmente en el celular y categorías desde caché
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

    // Cargar categorías optimizadas con falla_id en memoria (0ms si está en caché)
    obtenerCategorias()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategoriasDb(cats);
        }
      })
      .catch((err) => console.warn('No se pudieron precargar categorías de taller:', err));
  }, []);

  const resolverCategoria = (nombreOClave: string): CategoriaFalla | undefined => {
    const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const query = norm(nombreOClave);
    return categoriasDb.find((c) => {
      const dbNorm = norm(c.nombre);
      return dbNorm.includes(query) || query.includes(dbNorm);
    });
  };

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
      const catDb = resolverCategoria(cat.id) || resolverCategoria(cat.label);
      const catId = catDb ? catDb.id : cat.categoriaId;
      const fallaId = catDb?.falla_id ?? catId;
      const fallaNombre = catDb?.falla_nombre ?? `Avería de ${cat.label}`;

      setItemsList((prev) => [
        ...prev,
        {
          id: Date.now(),
          nombre: cat.label,
          categoriaId: catId,
          fallaId: fallaId,
          fallaNombre: fallaNombre,
          resuelto: 'NO',
        },
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
    const catOtro = resolverCategoria('otro');
    const catId = catOtro ? catOtro.id : 6;
    const fallaId = catOtro?.falla_id ?? catId;
    const fallaNombre = catOtro?.falla_nombre ?? 'Otra Avería';

    setItemsList((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: cleanText,
        categoriaId: catId,
        fallaId: fallaId,
        fallaNombre: fallaNombre,
        resuelto: 'NO',
      },
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
      setErrorMsg('⚠️ OBLIGATORIO: Debes ingresar o seleccionar el número de bus.');
      return;
    }

    if (!isBusValido || !selectedBusObj) {
      setErrorMsg(`⚠️ El Bus N° ${busNumber} no existe en la flota activa de Narbus. Debes seleccionar un bus registrado.`);
      return;
    }

    if (itemsList.length === 0) {
      setErrorMsg('⚠️ OBLIGATORIO: Debes seleccionar o ingresar al menos 1 falla a revisar.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    const busNumber = selectedBusObj ? String(selectedBusObj.n_bus) : getEffectiveBusNumber();
    const cleanBusNumber = busNumber.replace(/\D/g, '') || busNumber.trim();
    const conductorFinal = conductorNombre.trim() || 'CONDUCTOR-NARBUS';

    try {
      setSubmitting(true);
      const payload: SolicitudCreateDTO = {
        n_bus: cleanBusNumber,
        bus_id: selectedBusObj?.id ? Number(selectedBusObj.id) : undefined,
        descripcion_general: descripcion.trim() || `Reporte de mantención para bus ${cleanBusNumber}`,
        fotos: fotos.length > 0 ? fotos : undefined,
        detalles: itemsList.map((it) => ({
          categoria_id: it.categoriaId ?? null,
          falla_id: it.fallaId ?? null,
          falla_nombre: it.fallaNombre ?? null,
          descripcion_personalizada: it.nombre,
        })),
      };

      console.log(`Enviando Solicitud Taller (POST /api/v1/mantencion/solicitudes) con ${fotos.length} foto(s):`, payload);
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

  // ─── Manejo de fotos múltiples ─────────────────────────────────────────────

  const agregarFotoDesdeArchivo = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFotos((prev) => [...prev, file]);
      setFotoPreviews((prev) => [...prev, base64]);
    };
    reader.readAsDataURL(file);
  };

  const handleAgregarFoto = async () => {
    try {
      // 1. Intentar cámara nativa (Android con Capacitor)
      let dataUrl = await capturarFotoCamara();
      if (!dataUrl) {
        // 2. Intentar galería nativa
        dataUrl = await seleccionarFotoGaleria();
      }

      if (dataUrl) {
        // Convertir DataURL a File
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        const file = new File([u8arr], `evidencia_${Date.now()}.jpg`, { type: mime });
        setFotos((prev) => [...prev, file]);
        setFotoPreviews((prev) => [...prev, dataUrl!]);
      } else {
        // 3. Fallback: selector de archivos web (múltiple)
        fileInputRef.current?.click();
      }
    } catch {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach((file) => agregarFotoDesdeArchivo(file));
    // Limpiar el input para permitir volver a seleccionar los mismos archivos
    e.target.value = '';
  };

  const handleEliminarFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setFotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const handleResetForm = () => {
    setSelectedBusObj(null);
    setBusSearchInput('');
    setIsBusValido(false);
    setConductorNombre('');
    setDescripcion('');
    setItemsList([]);
    setFotos([]);
    setFotoPreviews([]);
    setSubmittedSuccess(null);
    setErrorMsg('');
    setShowConfirmModal(false);
  };

  // VISTA DE ÉXITO (COMPROBANTE DE RECEPCIÓN EN TALLER)
  if (submittedSuccess) {
    return (
      <div className="fmt-success-wrapper font-sans text-slate-900">
        <div className="fmt-success-card relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle2 size={48} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Comprobante de Recepción en Taller
          </h2>
          <p className="text-sm font-bold text-emerald-600 mb-5">
            Orden de Trabajo generada y notificada a la maestranza central.
          </p>

          <div className="fmt-modal-summary-box text-left mb-6 space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Orden de Trabajo (OT):</span>
              <span className="font-black text-indigo-700 text-base">OT #{submittedSuccess.id}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Unidad / Bus:</span>
              <span className="font-black text-slate-900 text-base">Bus N° {submittedSuccess.n_bus}</span>
            </div>
            {submittedSuccess.conductor && (
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-600 uppercase text-xs">Conductor Informante:</span>
                <span className="font-bold text-slate-800">{submittedSuccess.conductor}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Estado Inicial:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-sky-50 text-sky-800 border border-sky-300">
                REPORTADO
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-slate-600 uppercase text-xs">Averías Declaradas:</span>
              <span className="font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300 text-xs">
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
            <span>Ingresar Otra Recepción de Bus</span>
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
          <div className="fmt-header-inner">
            <div className="fmt-header-icon-box">
              <Wrench size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="fmt-badge-company">NARBUS BUSES</span>
                <span className="fmt-badge-subtitle">RECEPCIÓN DE FLOTA & TALLER</span>
              </div>
              <h1 className="fmt-header-title">Ingreso de Bus a Taller Central</h1>
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
            onChange={(val, busObj, isValid) => {
              setBusSearchInput(val);
              setSelectedBusObj(busObj || null);
              setIsBusValido(Boolean(isValid));
              if (errorMsg) setErrorMsg('');
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
                    className={`fmt-category-btn ${isSelected ? 'fmt-category-btn-selected' : ''} ${cat.fullWidth ? 'fmt-category-btn-full' : ''
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

            {/* Fotografías de evidencia múltiple */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                  Fotos de Evidencia (Opcional):
                </label>
                {fotos.length > 0 && (
                  <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {fotos.length} foto{fotos.length !== 1 ? 's' : ''} seleccionada{fotos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Botón principal de agregar foto */}
              <button
                type="button"
                onClick={handleAgregarFoto}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0 transition">
                  <ImagePlus size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-slate-700 block">
                    {fotos.length === 0 ? '📷 Agregar Foto de Evidencia' : '📷 Agregar Otra Foto'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Cámara nativa o galería del dispositivo
                  </span>
                </div>
              </button>

              {/* Input de archivo fallback oculto — acepta múltiples */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Grilla de previews con botón de eliminación */}
              {fotoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {fotoPreviews.map((preview, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-square">
                      <img
                        src={preview}
                        alt={`Evidencia ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay con nombre de archivo */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1">
                        <span className="text-[10px] font-bold text-white truncate block">
                          {fotos[i]?.name || `Foto ${i + 1}`}
                        </span>
                      </div>
                      {/* Botón eliminar */}
                      <button
                        type="button"
                        onClick={() => handleEliminarFoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
                        title="Eliminar foto"
                      >
                        <X size={13} />
                      </button>
                      {/* Número de foto */}
                      <div className="absolute top-1 left-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <span className="font-black text-slate-500 uppercase text-[11px]">Fotos Evidencia:</span>
                <span className={`font-black flex items-center gap-1 ${fotos.length > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {fotos.length > 0 ? (
                    <>
                      <Camera size={13} className="text-emerald-600" />
                      <span>{fotos.length} foto{fotos.length !== 1 ? 's' : ''} adjunta{fotos.length !== 1 ? 's' : ''} ✓</span>
                    </>
                  ) : 'Sin fotos'}
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
