import { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  FileText,
  BellRing,
  Compass
} from 'lucide-react';
import {
  obtenerResumenTaller,
  obtenerAuditoriaBusesTaller,
  obtenerAlertasSupervision,
  type ResumenTallerDTO,
  type AuditoriaBusTallerDTO,
  type AuditoriaFiltros,
  type AlertaSupervisionDTO
} from './supervisionService';
import {
  obtenerBuses,
  actualizarEstadoEnTaller,
  type BusAutocompleteDTO
} from '../../buses/busesService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import ModalAsignarFallas from './ModalAsignarFallas';
import AlertasTab from './tabs/AlertasTab';
import KpisTab from './tabs/KpisTab';
import AuditoriaTab from './tabs/AuditoriaTab';
import PatioTab from './tabs/PatioTab';
import ModalControlPatio from './tabs/ModalControlPatio';

interface DashboardSupervisionProps {
  onVolver?: () => void;
}

type TabSupervision = 'alertas' | 'resumen' | 'auditoria' | 'patio';

export default function DashboardSupervision({ onVolver: _onVolver }: DashboardSupervisionProps) {
  // 4 Pestañas principales
  const [activeTab, setActiveTab] = useState<TabSupervision>('alertas');

  // Datos
  const [resumen, setResumen] = useState<ResumenTallerDTO | null>(null);
  const [auditorias, setAuditorias] = useState<AuditoriaBusTallerDTO[]>([]);
  const [alertas, setAlertas] = useState<AlertaSupervisionDTO[]>([]);
  const [busesPatio, setBusesPatio] = useState<BusAutocompleteDTO[]>([]);

  // Estados de carga y error
  const [loading, setLoading] = useState<boolean>(true);
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  const [errorGenerico, setErrorGenerico] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');

  // Filtros globales de pestaña
  const [filtroSeveridadAlerta, setFiltroSeveridadAlerta] = useState<string>('TODAS');

  // Modal de Asignación Supervisora
  const [asignacionModalData, setAsignacionModalData] = useState<{
    solicitudId: number;
    nBus: string;
    detalles: { id: number; descripcion_personalizada: string; resuelto?: boolean }[];
    detalleIdPre?: number | null;
  } | null>(null);

  // Modal de Control de Patio
  const [modalPatioBus, setModalPatioBus] = useState<BusAutocompleteDTO | null>(null);
  const [motivoPatio, setMotivoPatio] = useState<string>('');
  const [guardandoPatio, setGuardandoPatio] = useState<boolean>(false);

  // Cargar Alertas en Vivo
  const cargarAlertas = async () => {
    try {
      const data = await obtenerAlertasSupervision();
      setAlertas(data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response && (e.response.status === 403 || e.response.status === 401)) {
        setErrorAcceso(getApiErrorMessage(err, 'Acceso denegado a Supervisión.'));
      }
    }
  };

  // Cargar Resumen del Taller (KPIs)
  const cargarResumen = async () => {
    try {
      const data = await obtenerResumenTaller();
      setResumen(data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response && (e.response.status === 403 || e.response.status === 401)) {
        setErrorAcceso(getApiErrorMessage(err, 'Acceso denegado a Supervisión.'));
      }
    }
  };

  // Cargar Lista de Auditoría
  const cargarAuditoria = async (filtrosAplicados?: AuditoriaFiltros) => {
    try {
      const data = await obtenerAuditoriaBusesTaller(filtrosAplicados);
      setAuditorias(data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response && (e.response.status === 403 || e.response.status === 401)) {
        setErrorAcceso(getApiErrorMessage(err, 'Acceso denegado a Supervisión.'));
      }
    }
  };

  // Cargar Flota de Taller para Patio
  const cargarPatio = async () => {
    try {
      const buses = await obtenerBuses();
      setBusesPatio(buses);
    } catch (err: unknown) {
      console.warn('Error cargando flota de patio:', err);
    }
  };

  // Orquestador de Refresco
  const refrescarDatos = async (filtrosAud?: AuditoriaFiltros) => {
    setLoading(true);
    setErrorGenerico(null);
    try {
      await Promise.all([
        cargarAlertas(),
        cargarResumen(),
        cargarAuditoria(filtrosAud),
        cargarPatio(),
      ]);
      setUltimaActualizacion(new Date().toLocaleTimeString('es-CL'));
    } catch (err: unknown) {
      setErrorGenerico(getApiErrorMessage(err, 'Error al sincronizar datos de supervisión.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refrescarDatos();
  }, []);

  // Manejo de Confirmar Ingreso/Egreso de Patio
  const handleConfirmarCambioPatio = async () => {
    if (!modalPatioBus) return;
    setGuardandoPatio(true);
    setErrorGenerico(null);
    try {
      const nuevoEstado = !modalPatioBus.en_taller;
      await actualizarEstadoEnTaller(modalPatioBus.id, {
        en_taller: nuevoEstado,
        motivo: motivoPatio.trim() || undefined,
      });
      setSuccessMsg(
        `Bus ${modalPatioBus.n_bus} marcado como ${nuevoEstado ? 'EN TALLER' : 'EN RUTA'}.`
      );
      setModalPatioBus(null);
      setMotivoPatio('');
      await Promise.all([cargarPatio(), cargarResumen()]);
    } catch (err: unknown) {
      setErrorGenerico(getApiErrorMessage(err, 'No se pudo actualizar el estado de patio del bus.'));
    } finally {
      setGuardandoPatio(false);
    }
  };

  // Pantalla de Acceso Denegado
  if (errorAcceso) {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-xl space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-xl font-black text-slate-900">Acceso Restringido</h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">{errorAcceso}</p>
        <p className="text-[11px] text-slate-400 font-semibold">
          Este panel está reservado exclusivamente para roles de Supervisión, Jefatura de Taller y Administrador.
        </p>
      </div>
    );
  }

  const criticasCount = alertas.filter((a) => a.severidad === 'CRITICA').length;

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Torre de Control
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Actualizado: {ultimaActualizacion || 'Sincronizando...'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Supervisión y Auditoría Taller</h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor operativo en tiempo real, alertas de pauta y control patrimonial de flota.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refrescarDatos()}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'alertas'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BellRing size={16} />
          <span>Alertas en Vivo</span>
          {criticasCount > 0 && (
            <span className="ml-1 px-2 py-0.2 bg-white text-red-700 text-[10px] font-black rounded-full">
              {criticasCount} críticas
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'resumen'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 size={16} />
          <span>Telemetría KPIs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auditoria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'auditoria'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText size={16} />
          <span>Auditoría de Buses</span>
          <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-md">
            {auditorias.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'patio'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass size={16} />
          <span>Control de Patio</span>
          <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
            {busesPatio.filter((b) => b.en_taller).length}
          </span>
        </button>
      </div>

      {/* Mensajes de feedback */}
      {errorGenerico && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <span>{errorGenerico}</span>
          </div>
          <button onClick={() => setErrorGenerico(null)} className="text-red-500 hover:text-red-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Pestaña 1: Alertas */}
      {activeTab === 'alertas' && (
        <AlertasTab
          alertas={alertas}
          loading={loading}
          filtroSeveridadAlerta={filtroSeveridadAlerta}
          onFiltroSeveridadChange={setFiltroSeveridadAlerta}
          onAsignarMecanicoClick={(al) => {
            setAsignacionModalData({
              solicitudId: al.solicitud_id,
              nBus: al.n_bus,
              detalles: [
                {
                  id: al.detalle_id || 1,
                  descripcion_personalizada: al.mensaje,
                },
              ],
              detalleIdPre: al.detalle_id,
            });
          }}
        />
      )}

      {/* Pestaña 2: KPIs */}
      {activeTab === 'resumen' && resumen && <KpisTab resumen={resumen} />}

      {/* Pestaña 3: Auditoría */}
      {activeTab === 'auditoria' && (
        <AuditoriaTab
          auditorias={auditorias}
          loading={loading}
          onFiltrar={(filtros) => cargarAuditoria(filtros)}
          onAsignarClick={(aud) => {
            setAsignacionModalData({
              solicitudId: aud.id,
              nBus: aud.n_bus,
              detalles: aud.detalles.map((d) => ({
                id: d.id,
                descripcion_personalizada: d.descripcion_personalizada || 'Avería sin descripción',
                resuelto: d.resuelto,
              })),
            });
          }}
        />
      )}

      {/* Pestaña 4: Control de Patio */}
      {activeTab === 'patio' && (
        <PatioTab
          busesPatio={busesPatio}
          loading={loading}
          onCambiarEstadoClick={(bus) => {
            setModalPatioBus(bus);
            setMotivoPatio('');
          }}
        />
      )}

      {/* Modal de Control de Patio */}
      <ModalControlPatio
        bus={modalPatioBus}
        motivoPatio={motivoPatio}
        guardandoPatio={guardandoPatio}
        onMotivoChange={setMotivoPatio}
        onConfirmar={handleConfirmarCambioPatio}
        onClose={() => setModalPatioBus(null)}
      />

      {/* Modal de Asignación Supervisora */}
      {asignacionModalData && (
        <ModalAsignarFallas
          solicitudId={asignacionModalData.solicitudId}
          nBus={asignacionModalData.nBus}
          detalles={asignacionModalData.detalles}
          detallePreseleccionadoId={asignacionModalData.detalleIdPre}
          onClose={() => setAsignacionModalData(null)}
          onAsignacionExitosa={() => {
            setSuccessMsg('¡Averías asignadas exitosamente al mecánico!');
            refrescarDatos();
          }}
        />
      )}
    </div>
  );
}
