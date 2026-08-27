import React, { useState, useEffect } from "react";
import {
  Disc,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Edit3,
  ClipboardList,
  Flame,
  Send
} from "lucide-react";
import "./FormularioNeumaticos.css";
import BusSelector from "../../components/BusSelector/BusSelector";
import PhotoSelector from "../../components/PhotoSelector/PhotoSelector";
import { guardarDato, obtenerDato } from "../../utils/storage";
import { apiClient } from "../../api/apiClient";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://192.168.1.135:8000/api/v1/formularioNeumatico";

interface FormularioNeumaticosProps {
  onVolver?: () => void;
}

interface SubmittedSuccess {
  id?: number | string;
  chofer: string;
  maquina: string;
  tipoBus: string;
  ruedas: string[];
  motivo: string;
  precio: string;
  marcaFuego: string;
}

const MOTIVOS_TACTILES = [
  { id: "Pinchazo", label: "Pinchazo", icon: "🔧" },
  { id: "Desinflado", label: "Se desinfló", icon: "💨" },
  { id: "Reventón", label: "Reventó", icon: "💥" },
  { id: "Otro", label: "Otro motivo", icon: "✏️" },
];

export default function FormularioNeumaticos({
  onVolver,
}: FormularioNeumaticosProps = {}) {
  // Datos principales (chofer proviene automáticamente de la sesión/Login)
  const [chofer, setChofer] = useState("");
  const [maquina, setMaquina] = useState("");

  // Ruedas
  const [ruedasSeleccionadas, setRuedasSeleccionadas] = useState<string[]>([]);

  // Motivo
  const [motivo, setMotivo] = useState("");
  const [otroMotivo, setOtroMotivo] = useState("");

  // Precio & Marca de fuego
  const [precio, setPrecio] = useState("");
  const [marcaFuego, setMarcaFuego] = useState("");

  // Foto evidencia
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Modales y estados de envío
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<SubmittedSuccess | null>(
    null
  );

  // Cargar chofer guardado en la sesión del login
  useEffect(() => {
    const cargarDatosGuardados = async () => {
      const rutGuardado = await obtenerDato("usuario_rut");
      const nombreGuardado = await obtenerDato("usuario_nombre");
      const choferFinal = nombreGuardado || rutGuardado || "CHOFER-NARBUS";
      setChofer(choferFinal);
    };
    cargarDatosGuardados();
  }, []);

  // Toggle Rueda
  const seleccionarRueda = (numero: number) => {
    setErrorMsg("");
    const idRueda = `${numero}`;
    if (ruedasSeleccionadas.includes(idRueda)) {
      setRuedasSeleccionadas(
        ruedasSeleccionadas.filter((r) => r !== idRueda)
      );
    } else {
      setRuedasSeleccionadas([...ruedasSeleccionadas, idRueda]);
    }
  };

  // Formato de precio chileno ($ XX.XXX)
  const manejarPrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const soloNumeros = valor.replace(/\D/g, "");
    if (soloNumeros === "") {
      setPrecio("");
      return;
    }
    const numeroFormateado = Number(soloNumeros).toLocaleString("es-CL");
    setPrecio(numeroFormateado);
  };

  // Formato Marca de Fuego (Solo números)
  const manejarMarcaFuego = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarcaFuego(e.target.value.replace(/\D/g, ""));
  };

  // Validaciones antes de mostrar Modal de Confirmación
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!maquina.trim()) {
      setErrorMsg("⚠️ OBLIGATORIO: Debes ingresar el número de máquina.");
      return;
    }

    if (ruedasSeleccionadas.length === 0) {
      setErrorMsg("⚠️ OBLIGATORIO: Selecciona al menos 1 rueda afectada en el diagrama del bus.");
      return;
    }

    if (!motivo) {
      setErrorMsg("⚠️ OBLIGATORIO: Selecciona la razón u origen de la falla.");
      return;
    }

    if (motivo === "Otro" && !otroMotivo.trim()) {
      setErrorMsg("⚠️ OBLIGATORIO: Describe brevemente lo ocurrido en 'Otro motivo'.");
      return;
    }

    if (!foto) {
      setErrorMsg("⚠️ OBLIGATORIO: Debes tomar o seleccionar una foto del comprobante / boleta.");
      return;
    }

    setShowConfirmModal(true);
  };

  // Envío final al backend
  const handleFinalSubmit = async () => {
    const tipoBus = ruedasSeleccionadas.some((r) => r === "7" || r === "8")
      ? "8 ruedas"
      : "6 ruedas";

    const motivoFinal = motivo === "Otro" ? otroMotivo.trim() : motivo;
    const choferFinal = chofer.trim() || "CHOFER-NARBUS";

    const formData = new FormData();
    const storedUserStr = await obtenerDato("user_data");
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        if (u && u.id) {
          formData.append("usuario_id", String(u.id));
        }
      } catch (e) {
        // ignore
      }
    }
    formData.append("chofer", choferFinal);
    formData.append("maquina", maquina.trim());
    formData.append("tipo_bus", tipoBus);
    formData.append("ruedas", JSON.stringify(ruedasSeleccionadas));
    formData.append("motivo", motivoFinal);
    formData.append("precio", precio.trim());
    formData.append("marca_fuego", marcaFuego.trim());
    if (foto) {
      formData.append("evidencia", foto);
    }

    setSubmitting(true);

    try {
      if (chofer.trim()) {
        await guardarDato("usuario_rut", chofer.trim());
      }

      console.log("Enviando reporte de neumático al backend via apiClient (/api/v1/formularioNeumatico)...");
      let resData;
      try {
        const response = await apiClient.post("/api/v1/formularioNeumatico", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        resData = response.data;
      } catch (errPost) {
        // Fallback en caso de endpoint legado /formularioNeumatico
        const response = await apiClient.post("/formularioNeumatico", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        resData = response.data;
      }

      console.log("Respuesta servidor:", resData);

      setShowConfirmModal(false);
      setSubmittedSuccess({
        id: resData.reporte_id || resData.id || resData.folio || Math.floor(Math.random() * 90000 + 10000),
        chofer: chofer.trim(),
        maquina: maquina.trim(),
        tipoBus,
        ruedas: ruedasSeleccionadas,
        motivo: motivoFinal,
        precio: precio.trim(),
        marcaFuego: marcaFuego.trim(),
      });
    } catch (err: unknown) {
      console.error("Error al enviar reporte:", err);
      const detail = err instanceof Error ? err.message : String(err);
      setErrorMsg(`No se pudo enviar la solicitud al servidor. (${detail})`);
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset del formulario para ingresar otro reporte
  const handleResetForm = () => {
    setChofer("");
    setMaquina("");
    setRuedasSeleccionadas([]);
    setMotivo("");
    setOtroMotivo("");
    setPrecio("");
    setMarcaFuego("");
    setFoto(null);
    setFotoPreview(null);
    setSubmittedSuccess(null);
    setErrorMsg("");
    setShowConfirmModal(false);
  };

  // Componente Rueda
  const Rueda = ({ numero, className }: { numero: number; className: string }) => {
    const idRueda = `${numero}`;
    const seleccionada = ruedasSeleccionadas.includes(idRueda);
    return (
      <button
        type="button"
        className={`fn-wheel ${className} ${seleccionada ? "fn-wheel-selected" : ""}`}
        onClick={() => seleccionarRueda(numero)}
        title={`Rueda N° ${numero}`}
      >
        {numero}
      </button>
    );
  };

  // VISTA DE ÉXITO TRAS TRANSMITIR AL TALLER
  if (submittedSuccess) {
    return (
      <div className="fn-success-wrapper font-sans text-slate-900">
        <div className="fn-success-card relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle2 size={48} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            ¡Reporte Transmitido con Éxito!
          </h2>
          <p className="text-sm font-bold text-emerald-600 mb-5">
            El registro de neumático fue enviado a la central.
          </p>

          <div className="fn-modal-summary-box text-left mb-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">N° de Registro:</span>
              <span className="font-black text-blue-600 text-base">#{submittedSuccess.id}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Máquina / Bus:</span>
              <span className="font-black text-slate-900 text-base">Bus N° {submittedSuccess.maquina}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Chofer / Informante:</span>
              <span className="font-bold text-slate-800">{submittedSuccess.chofer}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Ruedas Afectadas:</span>
              <span className="font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg border border-blue-300">
                {submittedSuccess.ruedas.map(r => `Rueda ${r}`).join(", ")}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-600 uppercase text-xs">Motivo:</span>
              <span className="font-bold text-slate-900">{submittedSuccess.motivo}</span>
            </div>
            {submittedSuccess.precio && (
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-600 uppercase text-xs">Valor Reparación:</span>
                <span className="font-black text-emerald-700">${submittedSuccess.precio}</span>
              </div>
            )}
            {submittedSuccess.marcaFuego && (
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-600 uppercase text-xs">Marca de Fuego:</span>
                <span className="font-black text-slate-800">#{submittedSuccess.marcaFuego}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="fn-btn-submit"
          >
            <RefreshCw size={20} />
            <span>Ingresar Otro Reporte</span>
          </button>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL DEL FORMULARIO
  return (
    <div className="fn-wrapper font-sans text-slate-900">
      <div className="fn-card">
        {/* Header Corporativo Oficial Narbus */}
        <div className="fn-header">
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-black text-white bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <span>← Volver al Menú Principal</span>
            </button>
          )}
          <div className="fn-header-inner">
            <div className="fn-header-icon-box">
              <Disc size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="fn-badge-company">NARBUS BUSES</span>
                <span className="fn-badge-subtitle">DEPARTAMENTO NEUMÁTICOS</span>
              </div>
              <h1 className="fn-header-title">Reporte de Neumático</h1>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePreSubmit} className="fn-form-body">
          {errorMsg && (
            <div className="fn-error-alert">
              <AlertCircle size={22} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PASO 1: IDENTIFICACIÓN DE LA MÁQUINA */}
          <div className="space-y-3">
            <BusSelector
              stepNumber={1}
              label="Identificación de la Máquina"
              placeholder="Escriba el N° de máquina (ej: 398)..."
              value={maquina}
              onChange={(val) => {
                setMaquina(val);
                setErrorMsg("");
              }}
              onClearError={() => setErrorMsg("")}
            />
          </div>

          {/* PASO 2: RUEDA A CAMBIAR */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="fn-step-header">
              <div className="fn-step-title-group">
                <span className="fn-step-badge">2</span>
                <label className="fn-step-label">Rueda Afectada:</label>
              </div>
              <span className="fn-required-badge">* Selecciona en el bus</span>
            </div>

            <div className="fn-bus-section">
              <div className="fn-bus-diagram">
                <div className="fn-bus-body">
                  <span className="fn-side-label fn-side-copiloto">
                    LADO COPILOTO
                  </span>
                  <span className="fn-side-label fn-side-chofer">
                    LADO CHOFER
                  </span>
                  <span className="fn-front-label">DELANTERA</span>
                  <span className="fn-rear-label">TRASERA</span>

                  <Rueda numero={2} className="fn-wheel-2" />
                  <Rueda numero={1} className="fn-wheel-1" />
                  <Rueda numero={6} className="fn-wheel-6" />
                  <Rueda numero={5} className="fn-wheel-5" />
                  <Rueda numero={4} className="fn-wheel-4" />
                  <Rueda numero={3} className="fn-wheel-3" />
                  <Rueda numero={8} className="fn-wheel-8" />
                  <Rueda numero={7} className="fn-wheel-7" />
                </div>
              </div>

              {/* Resumen de ruedas elegidas */}
              {ruedasSeleccionadas.length > 0 ? (
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-600">
                    Ruedas Seleccionadas:
                  </span>
                  {ruedasSeleccionadas.sort((a, b) => Number(a) - Number(b)).map((num) => (
                    <span
                      key={num}
                      className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1"
                    >
                      <span>Rueda N° {num}</span>
                      <button
                        type="button"
                        onClick={() => seleccionarRueda(Number(num))}
                        className="hover:text-red-200 transition"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-center text-xs font-bold text-slate-500 italic">
                  👉 Toca las ruedas afectadas en el diagrama superior.
                </div>
              )}
            </div>
          </div>

          {/* PASO 3: MOTIVO DEL REPORTE */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="fn-step-header">
              <div className="fn-step-title-group">
                <span className="fn-step-badge">3</span>
                <label className="fn-step-label">Motivo de la Falla:</label>
              </div>
              <span className="fn-required-badge">* Requerido</span>
            </div>

            <div className="fn-reason-grid">
              {MOTIVOS_TACTILES.map((item) => {
                const isSelected = motivo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMotivo(item.id);
                      if (item.id !== "Otro") setOtroMotivo("");
                      setErrorMsg("");
                    }}
                    className={`fn-reason-btn ${
                      isSelected ? "fn-reason-btn-selected" : ""
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {motivo === "Otro" && (
              <div className="pt-1 animate-in fade-in duration-200">
                <label className="text-[11px] font-black text-slate-700 block uppercase mb-1">
                  Describe detalladamente lo ocurrido: *
                </label>
                <textarea
                  rows={2}
                  placeholder="Describa el estado o problema del neumático..."
                  value={otroMotivo}
                  onChange={(e) => setOtroMotivo(e.target.value)}
                  className="fn-input text-xs resize-none"
                />
              </div>
            )}
          </div>

          {/* PASO 4: FOTO DEL COMPROBANTE / BOLETA */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="fn-step-header">
              <div className="fn-step-title-group">
                <span className="fn-step-badge">4</span>
                <label className="fn-step-label">Boleta / Comprobante:</label>
              </div>
              <span className="fn-required-badge">* Requerido</span>
            </div>

            <PhotoSelector
              fotoPreview={fotoPreview}
              onChange={(base64, fileObj) => {
                setFoto(fileObj);
                setFotoPreview(base64);
                setErrorMsg("");
              }}
              buttonText="Sacar Foto / Adjuntar Boleta"
            />
          </div>

          {/* PASO 5 Y 6: VALOR Y MARCA DE FUEGO */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="fn-step-header mb-1">
                  <div className="fn-step-title-group">
                    <span className="fn-step-badge">5</span>
                    <label className="fn-step-label">Valor Pagado:</label>
                  </div>
                  <span className="fn-optional-badge">Opcional</span>
                </div>
                <div className="fn-price-container">
                  <span className="fn-price-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 25.000"
                    value={precio}
                    onChange={manejarPrecio}
                    className="fn-price-input"
                  />
                </div>
              </div>

              <div>
                <div className="fn-step-header mb-1">
                  <div className="fn-step-title-group">
                    <span className="fn-step-badge">6</span>
                    <label className="fn-step-label">Marca de Fuego:</label>
                  </div>
                  <span className="fn-optional-badge">Opcional</span>
                </div>
                <div className="fn-input-icon-wrapper">
                  <Flame
                    size={18}
                    className="fn-input-icon text-orange-500"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 123456"
                    value={marcaFuego}
                    onChange={manejarMarcaFuego}
                    className="fn-input fn-input-with-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN ENVIAR */}
          <button type="submit" className="fn-btn-submit">
            <Send size={20} />
            <span>ENVIAR REPORTE DE NEUMÁTICO</span>
          </button>
        </form>
      </div>

      {/* MODAL DE CONFIRMACIÓN CON RESUMEN */}
      {showConfirmModal && (
        <div className="fn-modal-overlay">
          <div className="fn-modal-card animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Resumen del Reporte
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500">
                    Confirme los datos antes de transmitir la información
                  </p>
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

            {/* BOX RESUMEN */}
            <div className="fn-modal-summary-box">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">
                  Unidad / Máquina:
                </span>
                <span className="fn-modal-bus-pill">Bus N° {maquina}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">
                  Conductor:
                </span>
                <span className="font-black text-slate-900 text-sm">
                  {chofer}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">
                  Ruedas Afectadas:
                </span>
                <span className="font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-300">
                  {ruedasSeleccionadas
                    .sort((a, b) => Number(a) - Number(b))
                    .map((r) => `Rueda ${r}`)
                    .join(", ")}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">
                  Motivo:
                </span>
                <span className="font-black text-slate-900">
                  {motivo === "Otro" ? otroMotivo : motivo}
                </span>
              </div>

              {precio && (
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="font-black text-slate-500 uppercase text-[11px]">
                    Valor Pagado:
                  </span>
                  <span className="font-black text-emerald-700 text-sm">
                    ${precio}
                  </span>
                </div>
              )}

              {marcaFuego && (
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="font-black text-slate-500 uppercase text-[11px]">
                    Marca de Fuego:
                  </span>
                  <span className="font-black text-slate-900">
                    #{marcaFuego}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-0.5">
                <span className="font-black text-slate-500 uppercase text-[11px]">
                  Comprobante Boleta:
                </span>
                <span
                  className={`font-black ${
                    fotoPreview ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {fotoPreview ? "Foto Adjunta ✓" : "Sin foto"}
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
                className="fn-btn-submit flex-1 py-3.5 text-xs rounded-xl mt-0"
              >
                {submitting ? "Transmitiendo..." : "Confirmar y Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
