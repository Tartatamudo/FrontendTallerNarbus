import { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  RefreshCw,
  Play,
  LogOut,
  Share2,
  MessageSquare,
  AlertCircle,
  FileCheck,
  Bus,
  UserPlus,
  Users
} from 'lucide-react';
import {
  obtenerPendientes,
  obtenerMisTrabajos,
  tomarTrabajo,
  desasignarme,
  liberarTurno,
  marcarCheckDetalle,
  agregarComentario,
  finalizarOrden,
  agregarColaborador,
  type SolicitudDTO
} from '../../conductores/mantencion/mantencionService';
import MecanicoSelector from '../../components/MecanicoSelector/MecanicoSelector';
import { getStoredUser, type MecanicoItem } from '../../usuarios/auth/authService';

interface DashboardMecanicoProps {
  onVolver?: () => void;
}

const formatEstado = (estado: string) => {
  const mapa: Record<string, string> = {
    REPORTADO: 'REPORTADO',
    PENDIENTE_REASIGNACION: 'REASIGNACIÓN',
    EN_REPARACION: 'EN REPARACIÓN',
    FINALIZADO: 'FINALIZADO',
  };
  return mapa[estado] ?? estado;
};

export default function DashboardMecanico({ onVolver }: DashboardMecanicoProps) {
  const [tabActiva, setTabActiva] = useState<'pendientes' | 'misTrabajos'>('pendientes');
  const [pendientes, setPendientes] = useState<SolicitudDTO[]>([]);
  const [misTrabajos, setMisTrabajos] = useState<SolicitudDTO[]>([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudDTO | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for modals/dialogs

  const [colaboradoresMecanicos, setColaboradoresMecanicos] = useState<MecanicoItem[]>([]);
  const [colaboradorAgregar, setColaboradorAgregar] = useState<MecanicoItem[]>([]);
  const [comentarioLiberar, setComentarioLiberar] = useState('');
  const [nuevoComentarioText, setNuevoComentarioText] = useState('');
  const [comentarioTipo, setComentarioTipo] = useState('TECNICO');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);


  const [modalAbierto, setModalAbierto] = useState<'tomar' | 'liberar' | 'finalizar' | 'comentario' | 'agregarColaborador' | null>(null);

  useEffect(() => {
    getStoredUser().then(u => { if (u) setCurrentUserId(u.id); });
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (tabActiva === 'pendientes') {
        const data = await obtenerPendientes();
        setPendientes(data);
      } else {
        const data = await obtenerMisTrabajos();
        setMisTrabajos(data);
      }
    } catch (err: any) {
      console.error("Error cargando dashboard mecánico:", err);
      const detail = err.response?.data?.detail;
      setErrorMsg(detail || 'No se pudieron cargar los datos desde el taller.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [tabActiva]);

  // 2.7 Tomar Trabajo como Líder
  const handleTomarTrabajo = async () => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const colabIds = colaboradoresMecanicos.map(m => m.id);
      
      const updated = await tomarTrabajo(solicitudSeleccionada.id, colabIds);
      setSuccessMsg(`¡Has tomado la orden #${updated.id} para el bus ${updated.n_bus}!`);
      setModalAbierto(null);
      setSolicitudSeleccionada(null);
      setColaboradoresMecanicos([]);
      setTabActiva('misTrabajos');
    } catch (err: any) {
      console.error("Error al tomar trabajo:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo tomar la orden de trabajo.');
    } finally {
      setAccionLoading(false);
    }
  };

  // 2.8 Desasignarme ("Salir del equipo")
  const handleDesasignarme = async (id: number) => {
    const comentario = window.prompt("Ingresa una razón para desasignarte (ej: Fin de turno - Opcional):") || '';

    setAccionLoading(true);
    setErrorMsg(null);
    try {
      await desasignarme(id, comentario);
      setSuccessMsg(`Te has desasignado de la orden #${id}.`);
      setSolicitudSeleccionada(null);
      cargarDatos();
    } catch (err: any) {
      console.error("Error al desasignarme:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo completar la desasignación.');
    } finally {
      setAccionLoading(false);
    }
  };

  // 2.9 Liberar Turno
  const handleLiberarTurno = async () => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      await liberarTurno(solicitudSeleccionada.id, comentarioLiberar.trim());
      setSuccessMsg(`Turno entregado para la orden #${solicitudSeleccionada.id}. Pasa a estado Pendiente de Reasignación.`);
      setModalAbierto(null);
      setSolicitudSeleccionada(null);
      setComentarioLiberar('');
      cargarDatos();
    } catch (err: any) {
      console.error("Error al liberar turno:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo entregar el turno.');
    } finally {
      setAccionLoading(false);
    }
  };

  // 2.10 Check / Uncheck Falla
  const handleToggleCheck = async (solicitudId: number, detalleId: number, actualResuelto: boolean) => {
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await marcarCheckDetalle(solicitudId, detalleId, !actualResuelto);
      if (solicitudSeleccionada && solicitudSeleccionada.id === solicitudId) {
        setSolicitudSeleccionada(updated);
      }
      setMisTrabajos(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err: any) {
      console.error("Error al marcar check:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo actualizar el estado de la falla.');
    } finally {
      setAccionLoading(false);
    }
  };

  // 2.11 Agregar Comentario / Repuesto
  const handleAgregarComentario = async () => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await agregarComentario(solicitudSeleccionada.id, nuevoComentarioText.trim(), comentarioTipo);
      setSolicitudSeleccionada(updated);
      setMisTrabajos(prev => prev.map(s => s.id === updated.id ? updated : s));
      setModalAbierto(null);
      setNuevoComentarioText('');
    } catch (err: any) {
      console.error("Error al agregar comentario:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo registrar el comentario.');
    } finally {
      setAccionLoading(false);
    }
  };

  // 2.12 Finalizar Orden
  const handleFinalizarOrden = async () => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await finalizarOrden(solicitudSeleccionada.id, '');
      setSuccessMsg(`¡Orden #${updated.id} finalizada exitosamente! Bus liberado para ruta.`);
      setModalAbierto(null);
      setSolicitudSeleccionada(null);
      cargarDatos();
    } catch (err: any) {
      console.error("Error al finalizar orden:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo finalizar la orden.');
    } finally {
      setAccionLoading(false);
    }
  };

  // 2.13 Agregar Colaborador en Caliente
  const handleAgregarColaborador = async () => {
    if (!solicitudSeleccionada || colaboradorAgregar.length === 0) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const colab = colaboradorAgregar[0];
      const updated = await agregarColaborador(solicitudSeleccionada.id, colab.id, colab.nombre_completo);
      setSolicitudSeleccionada(updated);
      setMisTrabajos(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSuccessMsg(`Mecánico ${colab.nombre_completo} agregado exitosamente al equipo.`);
      setModalAbierto(null);
      setColaboradorAgregar([]);
    } catch (err: any) {
      console.error("Error al agregar colaborador:", err);
      setErrorMsg(err.response?.data?.detail || 'No se pudo agregar al colaborador.');
    } finally {
      setAccionLoading(false);
    }
  };

  const esLiderActual = solicitudSeleccionada?.mecanicos?.some(
    m => m.mecanico_id === currentUserId && m.is_activo && m.es_lider_responsable
  ) ?? false;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-sm border border-slate-200 font-sans">
      {/* Header Corporativo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
            <Wrench size={26} />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              TALLER CENTRAL NARBUS
            </span>
            <h1 className="text-2xl font-black text-slate-900">Panel de Control Mecánico</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onVolver && (
            <button
              onClick={onVolver}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              ← Menú Principal
            </button>
          )}
        </div>
      </div>

      {/* Tabs de Navegación del Mecánico */}
      <div className="flex gap-3 mb-6 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => { setTabActiva('pendientes'); setSolicitudSeleccionada(null); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            tabActiva === 'pendientes'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock size={16} />
          <span>Pestaña 1: Solicitudes Pendientes ({pendientes.length})</span>
        </button>

        <button
          onClick={() => { setTabActiva('misTrabajos'); setSolicitudSeleccionada(null); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            tabActiva === 'misTrabajos'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench size={16} />
          <span>Pestaña 2: Mis Trabajos ({misTrabajos.length})</span>
        </button>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Lista de Tarjetas (Pendientes o Mis Trabajos) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-sm text-slate-700 uppercase tracking-wider">
              {tabActiva === 'pendientes' ? 'Órdenes por Asignar' : 'Mis Órdenes en Reparación'}
            </h2>
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              title="Refrescar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading && (pendientes.length === 0 && misTrabajos.length === 0) ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
              <span>Cargando datos del taller...</span>
            </div>
          ) : (tabActiva === 'pendientes' ? pendientes : misTrabajos).length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-500">
              {tabActiva === 'pendientes'
                ? 'No hay solicitudes pendientes en este momento.'
                : 'No tienes trabajos asignados activamente.'}
            </div>
          ) : (
            (tabActiva === 'pendientes' ? pendientes : misTrabajos).map((sol) => {
              const isSelected = solicitudSeleccionada?.id === sol.id;
              return (
                <div
                  key={sol.id}
                  onClick={() => setSolicitudSeleccionada(sol)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bus size={18} className="text-indigo-600" />
                      <span className="font-black text-slate-900 text-base">{sol.n_bus}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      {formatEstado(sol.estado)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-600 line-clamp-2 mb-3">
                    {sol.descripcion_general || 'Sin descripción general'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    <span>Folio #{sol.id}</span>
                    <span>{sol.detalles?.length || 0} detalle(s)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Detalle de Solicitud Seleccionada */}
        <div className="lg:col-span-2">
          {solicitudSeleccionada ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-6">
              
              {/* Header Detalle */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    Folio #{solicitudSeleccionada.id}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Bus: {solicitudSeleccionada.n_bus}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {solicitudSeleccionada.descripcion_general}
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black rounded-xl">
                  {formatEstado(solicitudSeleccionada.estado)}
                </span>
              </div>

              {/* Botón Tomar Trabajo si está Pendiente */}
              {tabActiva === 'pendientes' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-sm text-indigo-900">Tomar Solicitud de Mantención</h4>
                    <p className="text-xs font-medium text-indigo-700">Asumir rol de mecánico líder e invitar colaboradores</p>
                  </div>
                  <button
                    onClick={() => setModalAbierto('tomar')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Play size={16} />
                    <span>Tomar Trabajo</span>
                  </button>
                </div>
              )}

              {/* Checklist de Detalles de Fallas (Pestaña 2) */}
              <div>
                <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider mb-3">
                  Checklist de Fallas & Repuestos ({solicitudSeleccionada.detalles?.length || 0}):
                </h4>
                <div className="space-y-2">
                  {solicitudSeleccionada.detalles && solicitudSeleccionada.detalles.length > 0 ? (
                    solicitudSeleccionada.detalles.map((det) => (
                      <div
                        key={det.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          det.resuelto
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {tabActiva === 'misTrabajos' ? (
                            <input
                              type="checkbox"
                              checked={det.resuelto}
                              onChange={() => handleToggleCheck(solicitudSeleccionada.id, det.id, det.resuelto)}
                              disabled={accionLoading}
                              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                              •
                            </span>
                          )}
                          <span className={`text-xs font-extrabold ${det.resuelto ? 'line-through opacity-70' : ''}`}>
                            {det.descripcion_personalizada}
                          </span>
                        </div>

                        {det.resuelto && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            Resuelto ✓
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-white border rounded-xl text-xs text-slate-400 italic">
                      Sin ítems detallados
                    </div>
                  )}
                </div>
              </div>

              {/* Bitácora de Comentarios / Repuestos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">
                    Bitácora & Registro de Repuestos:
                  </h4>
                  {tabActiva === 'misTrabajos' && (
                    <button
                      onClick={() => setModalAbierto('comentario')}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>+ Agregar Nota / Repuesto</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {solicitudSeleccionada.comentarios && solicitudSeleccionada.comentarios.length > 0 ? (
                    solicitudSeleccionada.comentarios.map((c, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-500 text-[10px]">
                          <span className="uppercase text-indigo-600">[{c.tipo || 'GENERAL'}]</span>
                          <span>{c.fecha_registro || ''}</span>
                        </div>
                        <p className="font-semibold text-slate-800">{c.comentario}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay comentarios en la bitácora.</p>
                  )}
                </div>
              </div>

              {/* Acciones para Mis Trabajos (Pestaña 2) */}
              {tabActiva === 'misTrabajos' && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDesasignarme(solicitudSeleccionada.id)}
                    disabled={accionLoading}
                    className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Desasignarme</span>
                  </button>

                  <button
                    onClick={() => setModalAbierto('liberar')}
                    disabled={accionLoading}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={15} />
                    <span>Entregar Turno</span>
                  </button>

                  <button
                    onClick={() => setModalAbierto('finalizar')}
                    disabled={accionLoading}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck size={15} />
                    <span>Finalizar y Liberar Bus</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-6">
              <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-600 text-sm">
                Selecciona una orden de trabajo de la lista para ver el detalle y operar.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: TOMAR TRABAJO */}
      {modalAbierto === 'tomar' && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Play size={20} className="text-indigo-600" />
              <span>Tomar Orden #{solicitudSeleccionada.id} ({solicitudSeleccionada.n_bus})</span>
            </h3>



            <div>
              <MecanicoSelector
                selectedMecanicos={colaboradoresMecanicos}
                onChange={(selected) => setColaboradoresMecanicos(selected)}
                label="Invitar Colaboradores (Mecánicos)"
                placeholder="Buscar mecánico por nombre (ej: Santiago)..."
                excludeId={currentUserId ?? undefined}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalAbierto(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleTomarTrabajo}
                disabled={accionLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md"
              >
                {accionLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LIBERAR / ENTREGAR TURNO */}
      {modalAbierto === 'liberar' && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Share2 size={20} className="text-blue-600" />
              <span>Entregar Turno / Liberar Orden #{solicitudSeleccionada.id}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Comentario de Entrega de Turno (Opcional):</label>
              <textarea
                rows={3}
                placeholder="Ej: Se entrega turno noche. Faltan repuestos..."
                value={comentarioLiberar}
                onChange={(e) => setComentarioLiberar(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalAbierto(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleLiberarTurno}
                disabled={accionLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md"
              >
                {accionLoading ? 'Entregando...' : 'Entregar Turno'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AGREGAR COMENTARIO / REPUESTO */}
      {modalAbierto === 'comentario' && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" />
              <span>Agregar Bitácora #{solicitudSeleccionada.id}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Registro:</label>
              <select
                value={comentarioTipo}
                onChange={(e) => setComentarioTipo(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs font-semibold mb-3"
              >
                <option value="TECNICO">TÉCNICO (Diagnóstico o trabajo)</option>
                <option value="REPUESTO">REPUESTO (Solicitud a bodega)</option>
                <option value="GENERAL">OBSERVACIÓN GENERAL</option>
              </select>

              <label className="block text-xs font-bold text-slate-700 mb-1">Comentario / Nota (Opcional):</label>
              <textarea
                rows={3}
                placeholder="Ej: Se solicitaron 2 pastillas de freno a bodega."
                value={nuevoComentarioText}
                onChange={(e) => setNuevoComentarioText(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalAbierto(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarComentario}
                disabled={accionLoading}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md"
              >
                {accionLoading ? 'Guardando...' : 'Guardar Comentario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FINALIZAR ORDEN */}
      {modalAbierto === 'finalizar' && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <FileCheck size={20} className="text-emerald-600" />
              <span>Finalizar Orden & Liberar Bus</span>
            </h3>



            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalAbierto(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizarOrden}
                disabled={accionLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md"
              >
                {accionLoading ? 'Finalizando...' : 'Finalizar y Liberar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
