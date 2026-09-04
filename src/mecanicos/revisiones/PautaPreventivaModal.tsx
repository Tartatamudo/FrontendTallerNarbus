import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Save,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  obtenerPautaItems,
  obtenerPautaResumen,
  guardarPautaBatch,
  type PautaTallerItemDTO,
  type PautaEvaluacionItemDTO,
  type EstadoPauta
} from '../../conductores/mantencion/mantencionService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import './PautaPreventivaModal.css';

interface PautaPreventivaModalProps {
  solicitudId: number;
  nBus: string;
  onClose: () => void;
  onGuardadoExitoso?: () => void;
}

export default function PautaPreventivaModal({
  solicitudId,
  nBus,
  onClose,
  onGuardadoExitoso,
}: PautaPreventivaModalProps) {
  const [items, setItems] = useState<PautaTallerItemDTO[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Record<number, { estado: EstadoPauta; observacion: string }>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cargar catálogo maestro y respuestas existentes
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [catalogo, resumenExistente] = await Promise.all([
          obtenerPautaItems(),
          obtenerPautaResumen(solicitudId).catch(() => null),
        ]);

        setItems(catalogo);

        // Inicializar mapa de respuestas previas si existen
        const prevMap: Record<number, { estado: EstadoPauta; observacion: string }> = {};
        if (resumenExistente && resumenExistente.respuestas) {
          for (const resp of resumenExistente.respuestas) {
            prevMap[resp.item_id] = {
              estado: resp.estado,
              observacion: resp.observacion || '',
            };
          }
        }
        setEvaluaciones(prevMap);
      } catch (err) {
        setErrorMsg(getApiErrorMessage(err, 'Error cargando la pauta preventiva.'));
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [solicitudId]);

  const handleSetEstado = (itemId: number, nuevoEstado: EstadoPauta) => {
    setEvaluaciones((prev) => ({
      ...prev,
      [itemId]: {
        estado: nuevoEstado,
        observacion: prev[itemId]?.observacion || '',
      },
    }));
  };

  const handleSetObservacion = (itemId: number, observacion: string) => {
    setEvaluaciones((prev) => ({
      ...prev,
      [itemId]: {
        estado: prev[itemId]?.estado || 'DEFECTO',
        observacion,
      },
    }));
  };

  // Marcar todos los ítems pendientes como OK con 1 clic
  const handleMarcarTodosOK = () => {
    const updated = { ...evaluaciones };
    for (const it of items) {
      if (!updated[it.id]) {
        updated[it.id] = { estado: 'OK', observacion: '' };
      }
    }
    setEvaluaciones(updated);
  };

  // Guardar en el backend
  const handleGuardar = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validar que los items con DEFECTO tengan alguna observación descriptiva
    for (const it of items) {
      const evalItem = evaluaciones[it.id];
      if (evalItem?.estado === 'DEFECTO' && !evalItem.observacion.trim()) {
        setErrorMsg(`Debe indicar una observación para el ítem con DEFECTO: "${it.item}".`);
        return;
      }
    }

    const payloadBatch: PautaEvaluacionItemDTO[] = Object.entries(evaluaciones).map(
      ([itemIdStr, data]) => ({
        item_id: Number(itemIdStr),
        estado: data.estado,
        observacion: data.observacion.trim() || undefined,
      })
    );

    if (payloadBatch.length === 0) {
      setErrorMsg('Debe evaluar al menos un ítem antes de guardar.');
      return;
    }

    setGuardando(true);
    try {
      await guardarPautaBatch(solicitudId, payloadBatch);
      setSuccessMsg('¡Pauta preventiva guardada exitosamente!');
      if (onGuardadoExitoso) onGuardadoExitoso();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'No se pudo guardar la pauta preventiva.'));
    } finally {
      setGuardando(false);
    }
  };

  // Métricas en tiempo real
  const total = items.length || 11;
  const respondidos = Object.keys(evaluaciones).length;
  const porcentaje = Math.round((respondidos / total) * 100);
  const defectosCount = Object.values(evaluaciones).filter((e) => e.estado === 'DEFECTO').length;

  // Agrupar items por categoría
  const itemsPorCategoria = items.reduce<Record<string, PautaTallerItemDTO[]>>((acc, it) => {
    const cat = it.categoria || 'Inspección General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(it);
    return acc;
  }, {});

  return (
    <div className="pauta-modal-overlay">
      <div className="pauta-modal-container">
        {/* Header */}
        <div className="pauta-modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">
                Pauta Preventiva de Taller ({items.length || 11} Ítems)
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Bus N° {nBus} • Orden #{solicitudId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="pauta-modal-body">
          {/* Mensajes de Alerta / Éxito */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Caja de Progreso */}
          <div className="pauta-progress-box">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-slate-700">Progreso de Inspección:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-black">
                  {respondidos} de {total} ({porcentaje}%)
                </span>
              </div>
              {defectosCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-black flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {defectosCount} con DEFECTO
                </span>
              )}
            </div>

            <div className="pauta-progress-bar-bg">
              <div
                className="pauta-progress-bar-fill"
                style={{
                  width: `${porcentaje}%`,
                  backgroundColor: porcentaje === 100 ? '#16a34a' : '#2563eb',
                }}
              />
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleMarcarTodosOK}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                title="Marcar todos los ítems aún no evaluados como OK"
              >
                <Sparkles size={13} />
                <span>Marcar pendientes como OK</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw size={32} className="animate-spin text-blue-600" />
              <p className="text-sm font-semibold">Cargando ítems de la pauta preventiva...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(itemsPorCategoria).map(([categoria, listaItems]) => (
                <div key={categoria} className="flex flex-col gap-3">
                  <div className="pauta-category-header">
                    <span>{categoria}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({listaItems.length} ítems)
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {listaItems.map((it) => {
                      const actual = evaluaciones[it.id];
                      const estado = actual?.estado;
                      const obs = actual?.observacion || '';

                      return (
                        <div
                          key={it.id}
                          className={`pauta-item-card ${
                            estado === 'DEFECTO'
                              ? 'border-red-300 bg-red-50/30'
                              : estado === 'OK'
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-black text-slate-400 w-5 pt-0.5">
                                #{it.orden || it.id}
                              </span>
                              <span className="text-sm font-bold text-slate-800">
                                {it.item}
                              </span>
                            </div>

                            {/* Botones de calificación */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleSetEstado(it.id, 'OK')}
                                className={`pauta-btn-state pauta-btn-ok ${
                                  estado === 'OK' ? 'active' : ''
                                }`}
                              >
                                <CheckCircle2 size={15} />
                                <span>OK</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetEstado(it.id, 'DEFECTO')}
                                className={`pauta-btn-state pauta-btn-defecto ${
                                  estado === 'DEFECTO' ? 'active' : ''
                                }`}
                              >
                                <AlertTriangle size={15} />
                                <span>DEFECTO</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetEstado(it.id, 'NO_APLICA')}
                                className={`pauta-btn-state pauta-btn-na ${
                                  estado === 'NO_APLICA' ? 'active' : ''
                                }`}
                              >
                                <HelpCircle size={15} />
                                <span>N/A</span>
                              </button>
                            </div>
                          </div>

                          {/* Campo de observación (obligatorio si DEFECTO) */}
                          {estado === 'DEFECTO' && (
                            <div className="mt-2.5 pt-2 border-t border-red-200">
                              <label className="block text-[11px] font-black uppercase tracking-wider text-red-700 mb-1">
                                Detalle del Defecto Encontrado *
                              </label>
                              <input
                                type="text"
                                value={obs}
                                onChange={(e) => handleSetObservacion(it.id, e.target.value)}
                                placeholder="Especifique el defecto o pieza dañada (ej: Fuga en manguera de retorno)..."
                                className="pauta-obs-input"
                              />
                            </div>
                          )}

                          {estado === 'OK' && obs && (
                            <p className="mt-1 text-xs text-emerald-700 font-medium">
                              Nota: {obs}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pauta-modal-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {guardando ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>{guardando ? 'Guardando Evaluaciones...' : 'Guardar Pauta'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
