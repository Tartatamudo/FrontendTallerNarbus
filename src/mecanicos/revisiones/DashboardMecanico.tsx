import { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  RefreshCw,
  Play,
  MessageSquare,
  AlertCircle,
  FileCheck,
  ClipboardCheck,
  Bus,
  PackageX,
  PackageCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  UserCheck,
  Plus,
  PauseCircle
} from 'lucide-react';
import {
  obtenerPendientes,
  obtenerMisTrabajos,
  obtenerSolicitud,
  tomarTrabajo,
  autoasignarFallas,
  terminarAvance,
  marcarCheckDetalle,
  reportarRepuestoFalla,
  agregarComentario,
  finalizarSolicitud,
  obtenerPautaResumen,
  agregarFallaSolicitud,
  type SolicitudDTO,
  type PautaEstadoResumenDTO,
  type AgregarFallaDTO
} from '../../services/mantencionService';
import { getStoredUser, type MecanicoItem } from '../../usuarios/auth/authService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import PautaPreventivaModal from './PautaPreventivaModal';
import ModalTomarTrabajo from './modales/ModalTomarTrabajo';
import ModalAutoasignarFallas from './modales/ModalAutoasignarFallas';
import ModalTerminarAvance from './modales/ModalTerminarAvance';
import ModalNuevaObservacion from './modales/ModalNuevaObservacion';
import ModalReportarRepuesto from './modales/ModalReportarRepuesto';
import ModalFinalizarOrden from './modales/ModalFinalizarOrden';
import ModalAgregarFalla from './modales/ModalAgregarFalla';
import { formatearEstadoSolicitud } from '../../utils/formatters';

interface DashboardMecanicoProps {
  onVolver?: () => void;
}

export default function DashboardMecanico({ onVolver }: DashboardMecanicoProps) {
  const [tabActiva, setTabActiva] = useState<'pendientes' | 'misTrabajos'>('pendientes');
  const [pendientes, setPendientes] = useState<SolicitudDTO[]>([]);
  const [misTrabajos, setMisTrabajos] = useState<SolicitudDTO[]>([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudDTO | null>(null);

  const [loading, setLoading] = useState(false);
  const [accionLoading, setAccionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados para modales
  const [colaboradoresMecanicos, setColaboradoresMecanicos] = useState<MecanicoItem[]>([]);
  const [nuevoComentarioText, setNuevoComentarioText] = useState('');
  const [comentarioTipo, setComentarioTipo] = useState('TECNICO');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Modal Agregar Falla en Caliente
  const [modalAgregarFallaAbierto, setModalAgregarFallaAbierto] = useState(false);

  // Selección atómica de fallas en pendientes y modal de autoasignación
  const [selectedDetallesIds, setSelectedDetallesIds] = useState<number[]>([]);
  const [modalAutoasignarAbierto, setModalAutoasignarAbierto] = useState(false);

  // Modal Pauta Preventiva de 19 ítems
  const [pautaModalData, setPautaModalData] = useState<{ id: number; nBus: string } | null>(null);
  const [pautaResumenActual, setPautaResumenActual] = useState<PautaEstadoResumenDTO | null>(null);

  // Modal Falta de Repuesto
  const [modalRepuestoData, setModalRepuestoData] = useState<{
    detalleId: number;
    descripcion: string;
    actualFalta: boolean;
  } | null>(null);
  const [comentarioRepuesto, setComentarioRepuesto] = useState('');

  // Modal Terminar Avance / Pausa grupal de cuadrilla
  const [modalTerminarAvanceAbierto, setModalTerminarAvanceAbierto] = useState(false);
  const [comentarioTerminarAvance, setComentarioTerminarAvance] = useState('');

  // Modal Finalizar Solicitud con justificaciones condicionales
  const [modalFinalizarAbierto, setModalFinalizarAbierto] = useState(false);
  const [comentarioCierre, setComentarioCierre] = useState('');
  const [motivoIncompletoChecklist, setMotivoIncompletoChecklist] = useState('');
  const [motivoCierreParcial, setMotivoCierreParcial] = useState('');
  const [liberarBusTaller, setLiberarBusTaller] = useState(true);

  const [modalAbierto, setModalAbierto] = useState<'tomar' | 'comentario' | null>(null);

  useEffect(() => {
    getStoredUser().then((u) => {
      if (u) setCurrentUserId(u.id);
    });
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
    } catch (err) {
      console.error('Error cargando dashboard mecánico:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudieron cargar los datos del taller.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [tabActiva]);

  // Al seleccionar una orden, consultar pauta preventiva para badges
  useEffect(() => {
    if (solicitudSeleccionada) {
      obtenerPautaResumen(solicitudSeleccionada.id)
        .then((res) => setPautaResumenActual(res))
        .catch(() => setPautaResumenActual(null));
      setSelectedDetallesIds([]);
    } else {
      setPautaResumenActual(null);
      setSelectedDetallesIds([]);
    }
  }, [solicitudSeleccionada?.id]);

  // Refrescar orden seleccionada
  const refrescarOrdenActual = async (solicitudId: number) => {
    try {
      const updated = await obtenerSolicitud(solicitudId);
      setSolicitudSeleccionada(updated);
      setMisTrabajos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      const pauta = await obtenerPautaResumen(solicitudId).catch(() => null);
      setPautaResumenActual(pauta);
    } catch (e) {
      console.warn('Error refrescando solicitud:', e);
    }
  };

  // 6.13 Tomar Trabajo como Líder (Bus completo)
  const handleTomarTrabajo = async () => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const colabIds = colaboradoresMecanicos.map((m) => m.id);
      const updated = await tomarTrabajo(solicitudSeleccionada.id, colabIds);
      setSuccessMsg(`¡Has tomado la orden #${updated.id} para el bus ${updated.n_bus}!`);
      setModalAbierto(null);
      setSolicitudSeleccionada(null);
      setColaboradoresMecanicos([]);
      setTabActiva('misTrabajos');
    } catch (err) {
      console.error('Error al tomar trabajo:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo tomar la orden de trabajo.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.10 Autoasignación Atómica de Fallas Específicas (con compañeros opcionales)
  const handleConfirmarAutoasignar = async (colaboradoresIds: number[], comentario?: string) => {
    if (!solicitudSeleccionada) return;
    if (selectedDetallesIds.length === 0) {
      setErrorMsg('Debe seleccionar al menos 1 avería para autoasignarse.');
      return;
    }

    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await autoasignarFallas(
        solicitudSeleccionada.id,
        selectedDetallesIds,
        colaboradoresIds,
        comentario
      );
      const colabMsg = colaboradoresIds.length > 0 ? ` con ${colaboradoresIds.length} compañero(s)` : '';
      setSuccessMsg(`¡Has tomado ${selectedDetallesIds.length} avería(s) del bus ${updated.n_bus}${colabMsg}!`);
      setSelectedDetallesIds([]);
      setSolicitudSeleccionada(null);
      setModalAutoasignarAbierto(false);
      setTabActiva('misTrabajos');
    } catch (err) {
      console.error('Error en autoasignación atómica:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudieron autoasignar las averías seleccionadas.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // Abrir modal de autoasignación para una falla puntual (aun que sea una sola)
  const handleAbrirAutoasignarPuntual = (detalleId: number) => {
    const det = solicitudSeleccionada?.detalles?.find((d) => d.id === detalleId);
    if (det?.resuelto) return;
    setSelectedDetallesIds([detalleId]);
    setModalAutoasignarAbierto(true);
  };

  // Tomar todas las averías del bus para asignación conjunta (solo pendientes)
  const handleTomarTodasAverias = () => {
    if (!solicitudSeleccionada || !solicitudSeleccionada.detalles) return;
    const fallasPendientes = solicitudSeleccionada.detalles.filter((d) => !d.resuelto);
    const pendIds = fallasPendientes.map((d) => d.id);
    if (pendIds.length === 0) return;
    setSelectedDetallesIds(pendIds);
    setModalAutoasignarAbierto(true);
  };

  // 6.12b Agregar Avería en Caliente a Solicitud Existente
  const handleConfirmarAgregarFalla = async (payload: AgregarFallaDTO) => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await agregarFallaSolicitud(solicitudSeleccionada.id, payload);
      setSolicitudSeleccionada(updated);
      setMisTrabajos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setPendientes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSuccessMsg(`¡Avería técnica agregada exitosamente a la orden #${updated.id}!`);
      setModalAgregarFallaAbierto(false);
    } catch (err) {
      console.error('Error al agregar avería en taller:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo agregar la avería en la solicitud.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.12 Término de Avance / Pausa de Cuadrilla (Cronometrado Grupal)
  const handleTerminarAvance = async () => {
    if (!solicitudSeleccionada) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await terminarAvance(solicitudSeleccionada.id, {
        comentario: comentarioTerminarAvance.trim() || null,
      });
      setSuccessMsg(
        `¡Avance registrado en la orden #${updated.id}! La orden pasa a PENDIENTE y los tiempos cronometrados de la cuadrilla fueron calculados.`
      );
      setModalTerminarAvanceAbierto(false);
      setComentarioTerminarAvance('');
      setSolicitudSeleccionada(null);
      cargarDatos();
    } catch (err) {
      console.error('Error al terminar avance:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo registrar el término de avance.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.16 Check / Uncheck Falla
  const handleToggleCheck = async (solicitudId: number, detalleId: number, actualResuelto: boolean) => {
    // Si la falla ya está resuelta, es inmutable y no se puede volver a clicar ni desmarcar
    if (actualResuelto) {
      return;
    }

    // Validación preventiva: si falta repuesto, no se puede marcar como resuelta
    const det = solicitudSeleccionada?.detalles?.find((d) => d.id === detalleId);
    if (!actualResuelto && det?.falta_repuesto) {
      setErrorMsg('No puedes marcar esta avería como resuelta mientras esté bloqueada por falta de repuestos.');
      return;
    }

    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await marcarCheckDetalle(solicitudId, detalleId, !actualResuelto);
      if (solicitudSeleccionada && solicitudSeleccionada.id === solicitudId) {
        setSolicitudSeleccionada(updated);
      }
      setMisTrabajos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      console.error('Error al marcar check:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo actualizar el estado de la falla.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.17 Falta de Repuesto
  const handleGuardarRepuesto = async () => {
    if (!solicitudSeleccionada || !modalRepuestoData) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const reportandoFalta = !modalRepuestoData.actualFalta;
      const detActual = solicitudSeleccionada.detalles?.find((d) => d.id === modalRepuestoData.detalleId);

      const updated = await reportarRepuestoFalla(
        solicitudSeleccionada.id,
        modalRepuestoData.detalleId,
        reportandoFalta,
        comentarioRepuesto.trim() || undefined
      );

      // Si se reportó falta de repuesto y la falla figuraba como resuelta, desmarcarla preventivamente
      if (reportandoFalta && detActual?.resuelto) {
        try {
          const desmarcada = await marcarCheckDetalle(solicitudSeleccionada.id, modalRepuestoData.detalleId, false);
          setSolicitudSeleccionada(desmarcada);
          setMisTrabajos((prev) => prev.map((s) => (s.id === desmarcada.id ? desmarcada : s)));
        } catch {
          setSolicitudSeleccionada(updated);
          setMisTrabajos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      } else {
        setSolicitudSeleccionada(updated);
        setMisTrabajos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }

      setSuccessMsg(
        reportandoFalta
          ? 'Falla bloqueada por falta de repuesto. El check de resolución ha sido inhabilitado.'
          : 'Repuesto reportado como disponible. Falla habilitada para resolución.'
      );
      setModalRepuestoData(null);
      setComentarioRepuesto('');
    } catch (err) {
      console.error('Error al reportar repuesto:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo actualizar el estado del repuesto.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.19 Agregar Comentario a Bitácora
  const handleAgregarComentario = async () => {
    if (!solicitudSeleccionada) return;
    if (!nuevoComentarioText.trim()) {
      setErrorMsg('Debe escribir un comentario.');
      return;
    }
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await agregarComentario(
        solicitudSeleccionada.id,
        nuevoComentarioText.trim(),
        comentarioTipo
      );
      setSolicitudSeleccionada(updated);
      setMisTrabajos((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setModalAbierto(null);
      setNuevoComentarioText('');
    } catch (err) {
      console.error('Error al agregar comentario:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo registrar el comentario.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.20 Finalizar Orden Inteligente
  const handleAbrirFinalizar = async () => {
    if (!solicitudSeleccionada) return;
    setComentarioCierre('');
    setMotivoIncompletoChecklist('');
    setMotivoCierreParcial('');
    setLiberarBusTaller(true);

    // Obtener estado fresco de la pauta preventiva
    try {
      const pauta = await obtenerPautaResumen(solicitudSeleccionada.id);
      setPautaResumenActual(pauta);
    } catch {
      // Ignorar si no existe pauta previa
    }

    setModalFinalizarAbierto(true);
  };

  const handleConfirmarFinalizar = async () => {
    if (!solicitudSeleccionada) return;

    // Validar reglas de negocio condicionales en el cliente antes de enviar
    const respondidos = pautaResumenActual?.respondidos ?? 0;
    const pautaIncompleta = respondidos < 19;
    if (pautaIncompleta && !motivoIncompletoChecklist.trim()) {
      setErrorMsg('⚠️ OBLIGATORIO: Debe ingresar la justificación por la pauta preventiva incompleta (< 19 ítems).');
      return;
    }

    const fallasSinResolver = solicitudSeleccionada.detalles?.some((d) => !d.resuelto) ?? false;
    if (fallasSinResolver && !motivoCierreParcial.trim()) {
      setErrorMsg('⚠️ OBLIGATORIO: Hay fallas sin resolver. Debe ingresar la justificación de cierre parcial.');
      return;
    }

    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const updated = await finalizarSolicitud(solicitudSeleccionada.id, {
        comentario_cierre: comentarioCierre.trim() || undefined,
        motivo_incompleto_checklist: pautaIncompleta ? motivoIncompletoChecklist.trim() : null,
        motivo_cierre_parcial: fallasSinResolver ? motivoCierreParcial.trim() : null,
        liberar_bus_taller: liberarBusTaller,
      });

      setSuccessMsg(
        `¡Orden #${updated.id} finalizada exitosamente! ${
          liberarBusTaller ? 'Bus liberado del taller.' : 'Bus retenido en taller por observación.'
        }`
      );
      setModalFinalizarAbierto(false);
      setSolicitudSeleccionada(null);
      cargarDatos();
    } catch (err) {
      console.error('Error al finalizar orden:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo finalizar la orden de trabajo.'));
    } finally {
      setAccionLoading(false);
    }
  };

  const toggleSelectDetalle = (id: number) => {
    const det = solicitudSeleccionada?.detalles?.find((d) => d.id === id);
    if (det?.resuelto) return;
    setSelectedDetallesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const seleccionarTodosDetalles = () => {
    if (!solicitudSeleccionada?.detalles) return;
    const fallasPendientes = solicitudSeleccionada.detalles.filter((d) => !d.resuelto);
    const pendIds = fallasPendientes.map((d) => d.id);
    if (selectedDetallesIds.length === pendIds.length) {
      setSelectedDetallesIds([]);
    } else {
      setSelectedDetallesIds(pendIds);
    }
  };

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
            <h1 className="text-2xl font-black text-slate-900">Consola Técnica Mecánico</h1>
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
          onClick={() => {
            setTabActiva('pendientes');
            setSolicitudSeleccionada(null);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            tabActiva === 'pendientes'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock size={16} />
          <span>Bandeja 1: Solicitudes Pendientes ({pendientes.length})</span>
        </button>

        <button
          onClick={() => {
            setTabActiva('misTrabajos');
            setSolicitudSeleccionada(null);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            tabActiva === 'misTrabajos'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench size={16} />
          <span>Bandeja 2: Mis Trabajos ({misTrabajos.length})</span>
        </button>
      </div>

      {/* Alertas y Notificaciones */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Órdenes */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-sm text-slate-700 uppercase tracking-wider">
              {tabActiva === 'pendientes' ? 'Buses en Espera' : 'Mis Órdenes Asignadas'}
            </h2>
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
              title="Refrescar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading && pendientes.length === 0 && misTrabajos.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
              <span>Cargando datos del taller...</span>
            </div>
          ) : (tabActiva === 'pendientes' ? pendientes : misTrabajos).length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-500">
              {tabActiva === 'pendientes'
                ? 'No hay solicitudes pendientes en este momento.'
                : 'No tienes órdenes de trabajo asignadas activamente.'}
            </div>
          ) : (
            (tabActiva === 'pendientes' ? pendientes : misTrabajos).map((sol) => {
              const isSelected = solicitudSeleccionada?.id === sol.id;
              const hasRepuestoBloqueado = sol.detalles?.some((d) => d.falta_repuesto);
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
                      <span className="font-black text-slate-900 text-base">Bus {sol.n_bus}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      {formatearEstadoSolicitud(sol.estado)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-600 line-clamp-2 mb-3">
                    {sol.descripcion_general || 'Sin descripción general'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    <span>Folio #{sol.id}</span>
                    <span>{sol.detalles?.length || 0} avería(s)</span>
                  </div>

                  {hasRepuestoBloqueado && (
                    <div className="mt-2 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <PackageX size={12} />
                      <span>Falta Repuesto</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Detalle y Operatoria de la Orden */}
        <div className="lg:col-span-2">
          {solicitudSeleccionada ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-6">
              {/* Header Detalle */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      Folio #{solicitudSeleccionada.id}
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black rounded-full">
                      {formatearEstadoSolicitud(solicitudSeleccionada.estado)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Bus N° {solicitudSeleccionada.n_bus}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {solicitudSeleccionada.descripcion_general}
                  </p>

                  {/* Cuadrilla Técnica y Tiempos Cronometrados */}
                  {solicitudSeleccionada.mecanicos && solicitudSeleccionada.mecanicos.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                        Cuadrilla:
                      </span>
                      {solicitudSeleccionada.mecanicos.map((m) => (
                        <span
                          key={m.id}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                            m.is_activo
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.is_activo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{m.mecanico_nombre || `Mecánico #${m.mecanico_id}`}</span>
                          {m.duracion_minutos != null && (
                            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1 rounded">
                              {m.duracion_minutos} min
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón Acceso Rápido a Pauta Preventiva */}
                <button
                  type="button"
                  onClick={() =>
                    setPautaModalData({
                      id: solicitudSeleccionada.id,
                      nBus: solicitudSeleccionada.n_bus,
                    })
                  }
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer self-start"
                >
                  <ClipboardCheck size={16} />
                  <span>
                    Pauta Preventiva{' '}
                    {pautaResumenActual ? `(${pautaResumenActual.respondidos}/19)` : ''}
                  </span>
                </button>
              </div>

              {/* Modo Pendientes: Asignación Atómica o Bus Completo */}
              {tabActiva === 'pendientes' && (
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-indigo-900">Tomar Orden de Trabajo</h4>
                      <p className="text-xs text-indigo-700">
                        Selecciona averías específicas para autoasignarte con tu equipo o toma todas las fallas del bus.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={seleccionarTodosDetalles}
                      className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                    >
                      {selectedDetallesIds.length === (solicitudSeleccionada.detalles?.length || 0) ? (
                        <>
                          <CheckSquare size={14} />
                          <span>Deseleccionar</span>
                        </>
                      ) : (
                        <>
                          <Square size={14} />
                          <span>Marcar todas</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setModalAutoasignarAbierto(true)}
                      disabled={accionLoading || selectedDetallesIds.length === 0}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      <UserCheck size={16} />
                      <span>Autoasignar ({selectedDetallesIds.length}) Averías</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTomarTodasAverias}
                      disabled={
                        accionLoading ||
                        (solicitudSeleccionada.detalles?.filter((d) => !d.resuelto).length || 0) === 0
                      }
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-indigo-800 border border-indigo-300 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play size={15} />
                      <span>
                        Tomar Averías Pendientes (
                        {solicitudSeleccionada.detalles?.filter((d) => !d.resuelto).length || 0})
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Desglose de Fallas y Operatoria */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">
                    Averías y Tareas Técnicas ({solicitudSeleccionada.detalles?.length || 0}):
                  </h4>
                  <button
                    type="button"
                    onClick={() => setModalAgregarFallaAbierto(true)}
                    disabled={accionLoading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                    title="Agregar una avería detectada durante la reparación en taller"
                  >
                    <Plus size={15} />
                    <span>+ Agregar Avería</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {solicitudSeleccionada.detalles && solicitudSeleccionada.detalles.length > 0 ? (
                    solicitudSeleccionada.detalles.map((det) => {
                      const isAtomicSelected = selectedDetallesIds.includes(det.id);
                      return (
                        <div
                          key={det.id}
                          className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            det.resuelto
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                              : det.falta_repuesto
                              ? 'bg-red-50/50 border-red-300 text-red-900'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            {/* Checkbox para autoasignación en pendientes */}
                            {tabActiva === 'pendientes' && (
                              det.resuelto ? (
                                <span
                                  className="w-5 h-5 flex items-center justify-center text-emerald-600 font-black text-xs shrink-0 select-none"
                                  title="Avería ya resuelta (bloqueada)"
                                >
                                  ✓
                                </span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isAtomicSelected}
                                  onChange={() => toggleSelectDetalle(det.id)}
                                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5 sm:mt-0"
                                />
                              )
                            )}

                            {/* Checkbox de resolución en mis trabajos */}
                            {tabActiva === 'misTrabajos' && (
                              <input
                                type="checkbox"
                                checked={det.resuelto}
                                onChange={() => {
                                  if (!det.resuelto) {
                                    handleToggleCheck(solicitudSeleccionada.id, det.id, det.resuelto);
                                  }
                                }}
                                disabled={accionLoading || Boolean(det.falta_repuesto) || det.resuelto}
                                title={
                                  det.resuelto
                                    ? 'Avería resuelta (bloqueada, no se puede modificar)'
                                    : det.falta_repuesto
                                    ? 'Avería bloqueada: no se puede marcar como resuelta mientras falte repuesto en bodega'
                                    : 'Marcar como resuelta'
                                }
                                className={`w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 sm:mt-0 transition ${
                                  det.resuelto
                                    ? 'opacity-80 cursor-not-allowed bg-emerald-100 accent-emerald-600 pointer-events-none'
                                    : det.falta_repuesto
                                    ? 'opacity-30 cursor-not-allowed bg-slate-200 border-slate-300'
                                    : 'cursor-pointer'
                                }`}
                              />
                            )}

                            <div>
                              <p className={`text-xs font-extrabold select-none ${det.resuelto ? 'line-through opacity-70 text-emerald-900' : ''}`}>
                                {det.descripcion_personalizada}
                              </p>
                              {det.falta_repuesto && !det.resuelto && (
                                <p className="text-[11px] font-bold text-red-600 mt-0.5 flex items-center gap-1">
                                  <AlertTriangle size={12} className="shrink-0" />
                                  <span>
                                    Bloqueado: {det.comentario_repuesto || 'Falta repuesto en bodega'} (Check deshabilitado)
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Acciones de la avería */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {tabActiva === 'pendientes' && !det.resuelto && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAbrirAutoasignarPuntual(det.id);
                                }}
                                disabled={accionLoading}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer min-h-[38px]"
                                title="Autoasignar esta falla puntual (e invitar compañeros si deseas)"
                              >
                                <UserCheck size={14} />
                                <span>Autoasignar</span>
                              </button>
                            )}

                            {det.resuelto && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 select-none shadow-xs">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>Resuelto ✓</span>
                              </span>
                            )}

                            {tabActiva === 'misTrabajos' && !det.resuelto && (
                              <button
                                type="button"
                                onClick={() =>
                                  setModalRepuestoData({
                                    detalleId: det.id,
                                    descripcion: det.descripcion_personalizada,
                                    actualFalta: det.falta_repuesto ?? false,
                                  })
                                }
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 cursor-pointer transition ${
                                  det.falta_repuesto
                                    ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                }`}
                                title="Reportar repuesto faltante o marcar que ya llegó"
                              >
                                {det.falta_repuesto ? (
                                  <>
                                    <PackageCheck size={13} />
                                    <span>Llegó Repuesto</span>
                                  </>
                                ) : (
                                  <>
                                    <PackageX size={13} />
                                    <span>Falta Repuesto</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
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
                    Bitácora de Observaciones & Taller:
                  </h4>
                  {tabActiva === 'misTrabajos' && (
                    <button
                      onClick={() => setModalAbierto('comentario')}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>+ Nueva Observación</span>
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
                    <p className="text-xs text-slate-400 italic">No hay notas registradas.</p>
                  )}
                </div>
              </div>

              {/* Acciones para Mis Trabajos (2 Formas Únicas de Cierre Cronometradas) */}
              {tabActiva === 'misTrabajos' && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalTerminarAvanceAbierto(true)}
                    disabled={accionLoading}
                    className="py-3 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    title="Pausar o entregar turno para toda la cuadrilla (La orden pasa a PENDIENTE y el bus sigue en taller)"
                  >
                    <PauseCircle size={18} className="text-amber-600 shrink-0" />
                    <span>⏸️ Terminar Avance (Pausa Cuadrilla)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAbrirFinalizar}
                    disabled={accionLoading}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    title="Cierre definitivo de la orden y liberación física del bus del taller"
                  >
                    <FileCheck size={18} className="shrink-0" />
                    <span>✅ Finalizar y Liberar Bus</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-6">
              <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-600 text-sm">
                Selecciona una orden de trabajo de la lista para ver el detalle e iniciar labores.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AUTOASIGNACIÓN DE AVERÍAS (CON COMPAÑEROS) */}
      <ModalAutoasignarFallas
        isOpen={modalAutoasignarAbierto}
        solicitud={solicitudSeleccionada}
        selectedDetallesIds={selectedDetallesIds}
        onToggleDetalle={toggleSelectDetalle}
        currentUserId={currentUserId}
        accionLoading={accionLoading}
        onConfirmar={handleConfirmarAutoasignar}
        onClose={() => setModalAutoasignarAbierto(false)}
      />

      {/* MODAL 1: TOMAR TRABAJO COMPLETO */}
      <ModalTomarTrabajo
        isOpen={modalAbierto === 'tomar'}
        solicitud={solicitudSeleccionada}
        colaboradores={colaboradoresMecanicos}
        currentUserId={currentUserId}
        accionLoading={accionLoading}
        onColaboradoresChange={setColaboradoresMecanicos}
        onConfirmar={handleTomarTrabajo}
        onClose={() => setModalAbierto(null)}
      />

      {/* MODAL: AGREGAR AVERÍA EN CALIENTE */}
      <ModalAgregarFalla
        isOpen={modalAgregarFallaAbierto}
        solicitudId={solicitudSeleccionada?.id || null}
        nBus={solicitudSeleccionada?.n_bus}
        accionLoading={accionLoading}
        onConfirmar={handleConfirmarAgregarFalla}
        onClose={() => setModalAgregarFallaAbierto(false)}
      />

      {/* MODAL 2: TERMINAR AVANCE / PAUSA DE CUADRILLA */}
      <ModalTerminarAvance
        isOpen={modalTerminarAvanceAbierto}
        solicitud={solicitudSeleccionada}
        comentarioAvance={comentarioTerminarAvance}
        accionLoading={accionLoading}
        onComentarioChange={setComentarioTerminarAvance}
        onConfirmar={handleTerminarAvance}
        onClose={() => setModalTerminarAvanceAbierto(false)}
      />

      {/* MODAL 3: AGREGAR BITÁCORA */}
      <ModalNuevaObservacion
        isOpen={modalAbierto === 'comentario'}
        solicitud={solicitudSeleccionada}
        comentarioTipo={comentarioTipo}
        comentarioTexto={nuevoComentarioText}
        accionLoading={accionLoading}
        onTipoChange={setComentarioTipo}
        onTextoChange={setNuevoComentarioText}
        onConfirmar={handleAgregarComentario}
        onClose={() => setModalAbierto(null)}
      />

      {/* MODAL 4: FALTA DE REPUESTO */}
      <ModalReportarRepuesto
        data={modalRepuestoData}
        comentarioRepuesto={comentarioRepuesto}
        accionLoading={accionLoading}
        onComentarioChange={setComentarioRepuesto}
        onConfirmar={handleGuardarRepuesto}
        onClose={() => {
          setModalRepuestoData(null);
          setComentarioRepuesto('');
        }}
      />

      {/* MODAL 5: FINALIZAR SOLICITUD Y LIBERAR BUS */}
      <ModalFinalizarOrden
        isOpen={modalFinalizarAbierto}
        solicitud={solicitudSeleccionada}
        pautaResumen={pautaResumenActual}
        motivoIncompletoChecklist={motivoIncompletoChecklist}
        motivoCierreParcial={motivoCierreParcial}
        comentarioCierre={comentarioCierre}
        liberarBusTaller={liberarBusTaller}
        accionLoading={accionLoading}
        onMotivoIncompletoChange={setMotivoIncompletoChecklist}
        onMotivoCierreParcialChange={setMotivoCierreParcial}
        onComentarioCierreChange={setComentarioCierre}
        onLiberarBusTallerChange={setLiberarBusTaller}
        onConfirmar={handleConfirmarFinalizar}
        onClose={() => setModalFinalizarAbierto(false)}
      />

      {/* MODAL DE PAUTA PREVENTIVA DE 19 ÍTEMS */}
      {pautaModalData && (
        <PautaPreventivaModal
          solicitudId={pautaModalData.id}
          nBus={pautaModalData.nBus}
          onClose={() => setPautaModalData(null)}
          onGuardadoExitoso={() => {
            if (solicitudSeleccionada) {
              refrescarOrdenActual(solicitudSeleccionada.id);
            }
          }}
        />
      )}
    </div>
  );
}
