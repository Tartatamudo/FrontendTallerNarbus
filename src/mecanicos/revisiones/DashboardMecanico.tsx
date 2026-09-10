import { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Bus,
  PackageX,
  AlertTriangle,
  Search,
  ArrowUpDown,
  FileText
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
  tieneAsignacionMecanico,
  type SolicitudDTO,
  type PautaEstadoResumenDTO,
  type AgregarFallaDTO,
  type DetalleUpdateDTO,
  type ComentarioBitacoraDTO
} from '../../services/mantencionService';
import { getStoredUser, type MecanicoItem } from '../../usuarios/auth/authService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { formatearFechaHora } from '../../utils/formatters';
import PautaPreventivaModal from './PautaPreventivaModal';
import ModalTomarTrabajo from './modales/ModalTomarTrabajo';
import ModalAutoasignarFallas from './modales/ModalAutoasignarFallas';
import ModalTerminarAvance from './modales/ModalTerminarAvance';
import ModalNuevaObservacion from './modales/ModalNuevaObservacion';
import ModalReportarRepuesto from './modales/ModalReportarRepuesto';
import ModalFinalizarOrden from './modales/ModalFinalizarOrden';
import ModalAgregarFalla from './modales/ModalAgregarFalla';
import ModalDetalleReporte from './modales/ModalDetalleReporte';
import EstadoBadge from '../../components/EstadoBadge/EstadoBadge';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import PaginationControl from '../../components/PaginationControl/PaginationControl';

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

  // Paginación de bandejas (skip y limit)
  const PAGE_SIZE = 20;
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [paginaMisTrabajos, setPaginaMisTrabajos] = useState(1);

  // Estados para modales
  const [colaboradoresMecanicos, setColaboradoresMecanicos] = useState<MecanicoItem[]>([]);
  const [nuevoComentarioText, setNuevoComentarioText] = useState('');
  const [comentarioTipo, setComentarioTipo] = useState('TECNICO');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Modal Detalle de Reporte Técnico (Ventana flotante sobre la pantalla)
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);

  // Ordenamiento y Búsqueda de Órdenes Pendientes (por OT o Bus)
  type CriterioOrden = 'ot_desc' | 'ot_asc' | 'bus_asc' | 'fecha_desc';
  const [criterioOrden, setCriterioOrden] = useState<CriterioOrden>('ot_desc');
  const [busquedaPendientes, setBusquedaPendientes] = useState('');
  const [busquedaMisTrabajos, setBusquedaMisTrabajos] = useState('');

  // Modal Agregar Falla en Caliente
  const [modalAgregarFallaAbierto, setModalAgregarFallaAbierto] = useState(false);

  // Selección atómica de fallas en pendientes y modal de autoasignación
  const [selectedDetallesIds, setSelectedDetallesIds] = useState<number[]>([]);
  const [modalAutoasignarAbierto, setModalAutoasignarAbierto] = useState(false);

  // Modal Pauta Preventiva (11 ítems)
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

  const cargarDatos = async (
    pagPendientes: number = paginaPendientes,
    pagMisTrabajos: number = paginaMisTrabajos
  ) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (tabActiva === 'pendientes') {
        const skip = (pagPendientes - 1) * PAGE_SIZE;
        const data = await obtenerPendientes(PAGE_SIZE, skip);
        setPendientes(data);
      } else {
        const skip = (pagMisTrabajos - 1) * PAGE_SIZE;
        const data = await obtenerMisTrabajos(PAGE_SIZE, skip);
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

  const handleCambiarPagina = (nuevaPagina: number) => {
    if (tabActiva === 'pendientes') {
      setPaginaPendientes(nuevaPagina);
      cargarDatos(nuevaPagina, paginaMisTrabajos);
    } else {
      setPaginaMisTrabajos(nuevaPagina);
      cargarDatos(paginaPendientes, nuevaPagina);
    }
  };

  // Ordenamiento y filtrado reactivo de órdenes pendientes
  const pendientesFiltradosYOrdenados = useMemo(() => {
    let list = [...pendientes];

    // Filtro por texto (OT, Bus, Conductor o Descripción)
    if (busquedaPendientes.trim()) {
      const q = busquedaPendientes.toLowerCase().trim();
      list = list.filter((sol) => {
        const matchOt = sol.id.toString().includes(q);
        const matchBus = (sol.n_bus || '').toLowerCase().includes(q);
        const matchDesc = (sol.descripcion_general || '').toLowerCase().includes(q);
        const matchConductor = (sol.usuario_creador_nombre || '').toLowerCase().includes(q);
        return matchOt || matchBus || matchDesc || matchConductor;
      });
    }

    // Criterio de ordenamiento (priorizando Orden de Trabajo)
    list.sort((a, b) => {
      if (criterioOrden === 'ot_desc') {
        return b.id - a.id;
      }
      if (criterioOrden === 'ot_asc') {
        return a.id - b.id;
      }
      if (criterioOrden === 'bus_asc') {
        return (a.n_bus || '').localeCompare(b.n_bus || '', undefined, { numeric: true });
      }
      if (criterioOrden === 'fecha_desc') {
        const timeA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
        const timeB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
        return timeB - timeA;
      }
      return b.id - a.id;
    });

    return list;
  }, [pendientes, busquedaPendientes, criterioOrden]);

  // Filtrado reactivo de órdenes en curso de mis trabajos
  const misTrabajosFiltrados = useMemo(() => {
    let list = [...misTrabajos];
    if (busquedaMisTrabajos.trim()) {
      const q = busquedaMisTrabajos.toLowerCase().trim();
      list = list.filter((sol) => {
        const matchOt = sol.id.toString().includes(q);
        const matchBus = (sol.n_bus || '').toLowerCase().includes(q);
        const matchDesc = (sol.descripcion_general || '').toLowerCase().includes(q);
        const matchChofer = (sol.usuario_creador_nombre || '').toLowerCase().includes(q);
        return matchOt || matchBus || matchDesc || matchChofer;
      });
    }
    return list;
  }, [misTrabajos, busquedaMisTrabajos]);

  // Apertura de ventana flotante de reporte técnico
  const handleAbrirReporte = (sol: SolicitudDTO) => {
    setSolicitudSeleccionada(sol);
    setModalReporteAbierto(true);
  };

  // Tomar todas las averías o reanudar trabajo desde el modal de reporte
  const handleTomarTodasAveriasModal = () => {
    if (!solicitudSeleccionada) return;
    const fallasPendientes = solicitudSeleccionada.detalles?.filter((d) => !d.resuelto) || [];
    const pendIds = fallasPendientes.map((d) => d.id);
    if (pendIds.length > 0) {
      setSelectedDetallesIds(pendIds);
      setModalReporteAbierto(false);
      setModalAutoasignarAbierto(true);
    } else {
      setModalReporteAbierto(false);
      setModalAbierto('tomar');
    }
  };

  // Autoasignar averías seleccionadas desde el modal de reporte
  const handleAutoasignarSeleccionModal = () => {
    if (selectedDetallesIds.length === 0) {
      setErrorMsg('Debe seleccionar al menos 1 avería para autoasignarse.');
      return;
    }
    setModalReporteAbierto(false);
    setModalAutoasignarAbierto(true);
  };

  // Al seleccionar una orden, consultar pauta preventiva para badges y cargar ficha técnica completa en background
  useEffect(() => {
    if (solicitudSeleccionada?.id) {
      const solId = solicitudSeleccionada.id;
      obtenerPautaResumen(solId)
        .then((res) => setPautaResumenActual(res))
        .catch(() => setPautaResumenActual(null));
      setSelectedDetallesIds([]);

      // Si la solicitud proviene de listado ligero (noload), cargar ficha técnica completa en segundo plano
      obtenerSolicitud(solId)
        .then((fullSol) => {
          setSolicitudSeleccionada((prev) => (prev && prev.id === solId ? fullSol : prev));
        })
        .catch((err) => console.warn('Error cargando ficha técnica completa en background:', err));
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
      setModalReporteAbierto(false);
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
      setModalReporteAbierto(false);
      setTabActiva('misTrabajos');
    } catch (err) {
      console.error('Error en autoasignación atómica:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudieron autoasignar las averías seleccionadas.'));
    } finally {
      setAccionLoading(false);
    }
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
      setModalReporteAbierto(false);
      cargarDatos();
    } catch (err) {
      console.error('Error al terminar avance:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo registrar el término de avance.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // Actualización inmutable reactiva tras recibir DetalleUpdateDTO (Contratos atómicos Nivel 3)
  const aplicarDetalleUpdate = (data: DetalleUpdateDTO) => {
    const updater = (sol: SolicitudDTO): SolicitudDTO => {
      const nuevosDetalles = (sol.detalles || []).map((d) =>
        d.id === data.detalle_id
          ? {
              ...d,
              resuelto: data.resuelto,
              falta_repuesto: data.falta_repuesto,
              mecanico_resolvio_id: data.mecanico_resolvio_id,
              mecanico_resolvio_nombre: data.mecanico_resolvio_nombre,
              comentario_repuesto: data.comentario_repuesto,
              fecha_resolucion: data.fecha_resolucion,
            }
          : d
      );
      return {
        ...sol,
        detalles: nuevosDetalles,
        fallas_resueltas: nuevosDetalles.filter((d) => d.resuelto).length,
        fallas_con_falta_repuesto: nuevosDetalles.filter((d) => d.falta_repuesto).length,
      };
    };

    setSolicitudSeleccionada((prev) => (prev && prev.id === data.solicitud_id ? updater(prev) : prev));
    setMisTrabajos((prev) => prev.map((s) => (s.id === data.solicitud_id ? updater(s) : s)));
  };

  // 6.16 Check / Uncheck Falla (Contrato Atómico Nivel 3)
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
      const detalleActualizado = await marcarCheckDetalle(solicitudId, detalleId, !actualResuelto);
      aplicarDetalleUpdate(detalleActualizado);
    } catch (err) {
      console.error('Error al marcar check:', err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo actualizar el estado de la falla.'));
    } finally {
      setAccionLoading(false);
    }
  };

  // 6.17 Falta de Repuesto (Contrato Atómico Nivel 3)
  const handleGuardarRepuesto = async () => {
    if (!solicitudSeleccionada || !modalRepuestoData) return;
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const reportandoFalta = !modalRepuestoData.actualFalta;
      const detActual = solicitudSeleccionada.detalles?.find((d) => d.id === modalRepuestoData.detalleId);

      const detalleActualizado = await reportarRepuestoFalla(
        solicitudSeleccionada.id,
        modalRepuestoData.detalleId,
        reportandoFalta,
        comentarioRepuesto.trim() || undefined
      );

      let detalleFinal = detalleActualizado;

      // Si se reportó falta de repuesto y la falla figuraba como resuelta, desmarcarla preventivamente
      if (reportandoFalta && detActual?.resuelto) {
        try {
          const desmarcada = await marcarCheckDetalle(solicitudSeleccionada.id, modalRepuestoData.detalleId, false);
          detalleFinal = desmarcada;
        } catch (checkErr) {
          console.warn('No se pudo desmarcar check al reportar repuesto:', checkErr);
        }
      }

      aplicarDetalleUpdate(detalleFinal);

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

  // 6.19 Agregar Comentario a Bitácora (Contrato Atómico Nivel 3)
  const handleAgregarComentario = async () => {
    if (!solicitudSeleccionada) return;
    if (!nuevoComentarioText.trim()) {
      setErrorMsg('Debe escribir un comentario.');
      return;
    }
    setAccionLoading(true);
    setErrorMsg(null);
    try {
      const comentarioNuevo = await agregarComentario(
        solicitudSeleccionada.id,
        nuevoComentarioText.trim(),
        comentarioTipo
      );

      const nuevoComentarioDTO: ComentarioBitacoraDTO = {
        id: comentarioNuevo.comentario_id,
        solicitud_id: comentarioNuevo.solicitud_id,
        usuario_id: comentarioNuevo.usuario_id,
        usuario_nombre: comentarioNuevo.usuario_nombre || undefined,
        tipo: comentarioNuevo.tipo,
        comentario: comentarioNuevo.comentario,
        fecha_registro: comentarioNuevo.fecha_registro,
      };

      const agregarComentarioASol = (sol: SolicitudDTO): SolicitudDTO => ({
        ...sol,
        comentarios: [...(sol.comentarios || []), nuevoComentarioDTO],
      });

      setSolicitudSeleccionada((prev) =>
        prev && prev.id === comentarioNuevo.solicitud_id ? agregarComentarioASol(prev) : prev
      );
      setMisTrabajos((prev) =>
        prev.map((s) => (s.id === comentarioNuevo.solicitud_id ? agregarComentarioASol(s) : s))
      );

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
    const totalPauta = pautaResumenActual?.total_items || 11;
    const pautaIncompleta = respondidos < totalPauta;
    if (pautaIncompleta && !motivoIncompletoChecklist.trim()) {
      setErrorMsg(`⚠️ OBLIGATORIO: Debe ingresar la justificación por la pauta preventiva incompleta (< ${totalPauta} ítems).`);
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
      setModalReporteAbierto(false);
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
          <span>
            Buses por Atender en Taller ({pendientes.length}
            {pendientes.length === PAGE_SIZE ? '+' : ''})
          </span>
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
          <span>
            Mis Órdenes en Curso ({misTrabajos.length}
            {misTrabajos.length === PAGE_SIZE ? '+' : ''})
          </span>
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

      {/* Contenido Principal según Pestaña */}
      {tabActiva === 'pendientes' ? (
        /* VISTA COMPLETA: BUSES POR ATENDER (ORDENADOS POR ORDEN DE TRABAJO CON VENTANA MODAL) */
        <div className="space-y-4">
          {/* Barra Superior de Herramientas: Búsqueda, Ordenamiento por OT y Refrescar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-800 uppercase tracking-wider">
                Buses por Atender
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                {pendientesFiltradosYOrdenados.length} en bandeja
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Buscador Rápido */}
              <div className="relative flex-1 sm:w-60 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar OT, Bus, chofer..."
                  value={busquedaPendientes}
                  onChange={(e) => setBusquedaPendientes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Selector de Criterio de Ordenamiento */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                <ArrowUpDown size={14} className="text-slate-500 shrink-0" />
                <label htmlFor="select-orden-pendientes" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Ordenar:
                </label>
                <select
                  id="select-orden-pendientes"
                  value={criterioOrden}
                  onChange={(e) => setCriterioOrden(e.target.value as CriterioOrden)}
                  className="bg-transparent text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="ot_desc">N° OT (Más nueva primero)</option>
                  <option value="ot_asc">N° OT (Más antigua primero)</option>
                  <option value="bus_asc">N° de Bus (1 → 999)</option>
                  <option value="fecha_desc">Fecha de Reporte (Reciente)</option>
                </select>
              </div>

              {/* Botón Refrescar */}
              <button
                onClick={() => cargarDatos()}
                disabled={loading}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Refrescar lista"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Grilla de Órdenes de Trabajo */}
          {loading && pendientes.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader variant="card" count={6} />
            </div>
          ) : pendientesFiltradosYOrdenados.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-slate-500">
              <Bus size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {busquedaPendientes
                  ? `No se encontraron órdenes que coincidan con "${busquedaPendientes}".`
                  : 'No hay buses por atender en este momento en taller.'}
              </p>
              {busquedaPendientes && (
                <button
                  type="button"
                  onClick={() => setBusquedaPendientes('')}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendientesFiltradosYOrdenados.map((sol) => {
                const hasRepuestoBloqueado = sol.detalles?.some((d) => d.falta_repuesto);
                const fallasPendientesCount = sol.detalles?.filter((d) => !d.resuelto).length || 0;
                return (
                  <div
                    key={sol.id}
                    onClick={() => handleAbrirReporte(sol)}
                    className="p-5 rounded-2xl border-2 transition cursor-pointer min-w-0 bg-white border-slate-200 hover:border-indigo-500 hover:shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cabecera Tarjeta: OT y Estado */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-black text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-sm tracking-wide">
                          OT #{sol.id}
                        </span>
                        <EstadoBadge estado={sol.estado} size="xs" />
                      </div>

                      {/* Datos del Bus y Chofer */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                            <Bus size={20} />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-lg leading-tight block">
                              Bus {sol.n_bus}
                            </span>
                            {sol.usuario_creador_nombre && (
                              <span className="text-[11px] text-slate-500 font-semibold block">
                                Chofer: {sol.usuario_creador_nombre}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={12} />
                          {formatearFechaHora(sol.fecha_creacion)}
                        </span>
                      </div>

                      {/* Snippet del Reporte */}
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 break-words [overflow-wrap:anywhere] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-0.5">Reporte Chofer:</span>
                        {sol.descripcion_general || 'Sin descripción general registrada'}
                      </p>
                    </div>

                    {/* Footer con Badges y Botón para abrir modal */}
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {sol.detalles?.length || 0} avería(s) ({fallasPendientesCount} pendiente{fallasPendientesCount !== 1 ? 's' : ''})
                        </span>

                        {hasRepuestoBloqueado && (
                          <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <PackageX size={12} />
                            Falta Repuesto
                          </span>
                        )}

                        {sol.estado === 'PENDIENTE_REASIGNACION' && (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Pausa / Reasignación
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirReporte(sol);
                        }}
                        className="w-full min-h-[44px] py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer group-hover:bg-indigo-600 group-hover:text-white shadow-sm"
                      >
                        <FileText size={16} />
                        <span>Ver Reporte Completo</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Control de Paginación para Pendientes */}
          {(pendientes.length > 0 || paginaPendientes > 1) && (
            <PaginationControl
              page={paginaPendientes}
              pageSize={PAGE_SIZE}
              itemCount={pendientes.length}
              hasMore={pendientes.length === PAGE_SIZE}
              onPageChange={handleCambiarPagina}
              loading={loading}
              label="buses por atender"
              className="mt-4"
            />
          )}
        </div>
      ) : (
        /* VISTA MIS TRABAJOS: GRILLA PANORÁMICA DE ÓRDENES EN CURSO CON VENTANA EMERGENTE */
        <div>
          {/* Barra de Herramientas Superior: Título, Filtro y Refresco */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight [data-theme=dark]_&:text-white">
                Mis Órdenes en Curso
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full [data-theme=dark]_&:bg-emerald-950 [data-theme=dark]_&:text-emerald-400">
                {misTrabajosFiltrados.length} en taller asignadas
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Buscador Rápido */}
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar OT, Bus, reporte..."
                  value={busquedaMisTrabajos}
                  onChange={(e) => setBusquedaMisTrabajos(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Botón Refrescar */}
              <button
                onClick={() => cargarDatos()}
                disabled={loading}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Refrescar lista"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Grilla de Mis Órdenes en Curso */}
          {loading && misTrabajos.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader variant="card" count={6} />
            </div>
          ) : misTrabajosFiltrados.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-slate-500">
              <Bus size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {busquedaMisTrabajos
                  ? `No se encontraron órdenes que coincidan con "${busquedaMisTrabajos}".`
                  : 'No tienes órdenes de trabajo asignadas activamente.'}
              </p>
              {busquedaMisTrabajos && (
                <button
                  type="button"
                  onClick={() => setBusquedaMisTrabajos('')}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {misTrabajosFiltrados.map((sol) => {
                const hasRepuestoBloqueado = sol.detalles?.some((d) => d.falta_repuesto);
                const fallasPendientesCount = sol.detalles?.filter((d) => !d.resuelto).length || 0;
                const todasResueltas = sol.detalles && sol.detalles.length > 0 && fallasPendientesCount === 0;

                return (
                  <div
                    key={sol.id}
                    onClick={() => handleAbrirReporte(sol)}
                    className="p-5 rounded-2xl border-2 transition cursor-pointer min-w-0 bg-white border-slate-200 hover:border-emerald-500 hover:shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cabecera Tarjeta: OT y Estado */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-black text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-sm tracking-wide">
                          OT #{sol.id}
                        </span>
                        <EstadoBadge estado={sol.estado} size="xs" />
                      </div>

                      {/* Datos del Bus y Chofer */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                            <Bus size={20} />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-lg leading-tight block">
                              Bus {sol.n_bus}
                            </span>
                            {sol.usuario_creador_nombre && (
                              <span className="text-[11px] text-slate-500 font-semibold block">
                                Chofer: {sol.usuario_creador_nombre}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={12} />
                          {formatearFechaHora(sol.fecha_creacion)}
                        </span>
                      </div>

                      {/* Snippet del Reporte */}
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 break-words [overflow-wrap:anywhere] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-0.5">Reporte:</span>
                        {sol.descripcion_general || 'Sin descripción general registrada'}
                      </p>
                    </div>

                    {/* Footer con Badges y Botón para abrir modal */}
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          todasResueltas
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sol.detalles?.length || 0} avería(s) {todasResueltas ? '(Todas resueltas ✓)' : `(${fallasPendientesCount} pendiente${fallasPendientesCount !== 1 ? 's' : ''})`}
                        </span>

                        {hasRepuestoBloqueado && (
                          <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <PackageX size={12} />
                            Falta Repuesto
                          </span>
                        )}

                        {sol.estado === 'PENDIENTE_REASIGNACION' && (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Pausa / Reasignación
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirReporte(sol);
                        }}
                        className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer group-hover:bg-emerald-600 group-hover:text-white shadow-sm"
                      >
                        <Wrench size={16} />
                        <span>Gestionar Orden de Trabajo</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Control de Paginación para Mis Trabajos */}
          {(misTrabajos.length > 0 || paginaMisTrabajos > 1) && (
            <PaginationControl
              page={paginaMisTrabajos}
              pageSize={PAGE_SIZE}
              itemCount={misTrabajos.length}
              hasMore={misTrabajos.length === PAGE_SIZE}
              onPageChange={handleCambiarPagina}
              loading={loading}
              label="mis órdenes"
              className="mt-4"
            />
          )}
        </div>
      )}

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

      {/* CÁLCULO DE PERMISOS: Un mecánico sólo puede rellenar la pauta si la OT o una parte de ella está bajo su orden */}
      {(() => {
        const puedeRellenarPauta =
          tabActiva === 'misTrabajos' ||
          tieneAsignacionMecanico(solicitudSeleccionada, currentUserId);

        return (
          <>
            {/* MODAL DE PAUTA PREVENTIVA (11 ÍTEMS) */}
            {pautaModalData && (
              <PautaPreventivaModal
                solicitudId={pautaModalData.id}
                nBus={pautaModalData.nBus}
                solicitud={solicitudSeleccionada}
                tabActiva={tabActiva}
                readOnly={!puedeRellenarPauta}
                onClose={() => setPautaModalData(null)}
                onGuardadoExitoso={() => {
                  if (solicitudSeleccionada) {
                    refrescarOrdenActual(solicitudSeleccionada.id);
                  }
                  cargarDatos();
                }}
              />
            )}

            {/* MODAL FLOTANTE: DETALLE DEL REPORTE TÉCNICO Y CONSOLA DE TRABAJO */}
            <ModalDetalleReporte
              isOpen={modalReporteAbierto}
              solicitud={solicitudSeleccionada}
              pautaResumen={pautaResumenActual}
              modo={tabActiva}
              puedeRellenarPauta={puedeRellenarPauta}
              selectedDetallesIds={selectedDetallesIds}
              onToggleSelectDetalle={toggleSelectDetalle}
              onSelectAllDetalles={seleccionarTodosDetalles}
              onTomarTodasAverias={handleTomarTodasAveriasModal}
              onAutoasignarSeleccion={handleAutoasignarSeleccionModal}
              onAbrirPauta={(solId, nBus) => {
                setPautaModalData({ id: solId, nBus });
              }}
              onClose={() => setModalReporteAbierto(false)}
              accionLoading={accionLoading}
              onToggleCheckFalla={(solId, detId, resuelto) => handleToggleCheck(solId, detId, resuelto)}
              onReportarRepuestoClick={(det) => {
                setModalRepuestoData({
                  detalleId: det.id,
                  descripcion: det.descripcion,
                  actualFalta: det.faltaRepuesto,
                });
              }}
              onAgregarFallaClick={() => setModalAgregarFallaAbierto(true)}
              onAgregarComentarioClick={() => setModalAbierto('comentario')}
              onTerminarAvanceClick={() => setModalTerminarAvanceAbierto(true)}
              onFinalizarOrdenClick={handleAbrirFinalizar}
            />
          </>
        );
      })()}
    </div>
  );
}
