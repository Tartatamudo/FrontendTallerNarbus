import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  MessageSquare,
  Bus,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Check,
  User,
  Wrench
} from 'lucide-react';
import {
  obtenerResumenTaller,
  obtenerAuditoriaBusesTaller
} from './supervisionService';
import type {
  ResumenTallerDTO,
  AuditoriaBusTallerDTO,
  AuditoriaFiltros
} from './supervisionService';

interface DashboardSupervisionProps {
  onVolver?: () => void;
}

export default function DashboardSupervision({ onVolver }: DashboardSupervisionProps) {
  // Tabs: 'resumen' (Telemetría / KPIs) | 'auditoria' (Trazabilidad Solicitudes)
  const [activeTab, setActiveTab] = useState<'resumen' | 'auditoria'>('resumen');

  // Datos
  const [resumen, setResumen] = useState<ResumenTallerDTO | null>(null);
  const [auditorias, setAuditorias] = useState<AuditoriaBusTallerDTO[]>([]);

  // Estados de carga y error
  const [loadingResumen, setLoadingResumen] = useState<boolean>(true);
  const [loadingAuditoria, setLoadingAuditoria] = useState<boolean>(false);
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  const [errorGenerico, setErrorGenerico] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');

  // Filtros de Auditoría
  const [filtroBus, setFiltroBus] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroMecanicoNombre, setFiltroMecanicoNombre] = useState<string>('');

  // Tarjetas expandidas en la auditoría
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Cargar Resumen del Taller
  const cargarResumen = async () => {
    setLoadingResumen(true);
    setErrorAcceso(null);
    setErrorGenerico(null);
    try {
      const data = await obtenerResumenTaller();
      setResumen(data);
      setUltimaActualizacion(new Date().toLocaleTimeString());
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setErrorAcceso(err.response.data?.detail || 'Acceso denegado: Se requieren permisos de SUPERVISOR o ADMIN.');
      } else if (err.response && err.response.status === 401) {
        setErrorAcceso('Credenciales no válidas o sesión expirada. Por favor, vuelva a iniciar sesión.');
      } else {
        setErrorGenerico('No se pudo conectar con el servicio de supervisión del taller.');
      }
    } finally {
      setLoadingResumen(false);
    }
  };

  // Cargar Lista de Auditoría
  const cargarAuditoria = async (filtrosAplicados?: AuditoriaFiltros) => {
    setLoadingAuditoria(true);
    setErrorAcceso(null);
    setErrorGenerico(null);
    try {
      const data = await obtenerAuditoriaBusesTaller(filtrosAplicados);
      setAuditorias(data);
      setUltimaActualizacion(new Date().toLocaleTimeString());
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setErrorAcceso(err.response.data?.detail || 'Acceso denegado: Se requieren permisos de SUPERVISOR o ADMIN.');
      } else if (err.response && err.response.status === 401) {
        setErrorAcceso('Credenciales no válidas o sesión expirada.');
      } else {
        setErrorGenerico('Error al obtener la trazabilidad de buses del taller.');
      }
    } finally {
      setLoadingAuditoria(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  useEffect(() => {
    if (activeTab === 'auditoria') {
      cargarAuditoria({
        n_bus: filtroBus,
        estado: filtroEstado,
        mecanico_nombre: filtroMecanicoNombre
      });
    }
  }, [activeTab]);

  const handleFiltrarAuditoria = (e: React.FormEvent) => {
    e.preventDefault();
    cargarAuditoria({
      n_bus: filtroBus,
      estado: filtroEstado,
      mecanico_nombre: filtroMecanicoNombre
    });
  };

  const handleLimpiarFiltros = () => {
    setFiltroBus('');
    setFiltroEstado('');
    setFiltroMecanicoNombre('');
    cargarAuditoria({});
  };

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Formatear timestamps ISO
  const formatearFecha = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      const fecha = new Date(isoString);
      return fecha.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Obtener badge por estado
  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'REPORTADO':
        return (
          <span className="px-3 py-1 text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 rounded-full flex items-center gap-1">
            <Clock size={12} className="text-amber-600" /> REPORTADO
          </span>
        );
      case 'EN_REPARACION':
        return (
          <span className="px-3 py-1 text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-300 rounded-full flex items-center gap-1">
            <Wrench size={12} className="text-blue-600 animate-pulse" /> EN REPARACIÓN
          </span>
        );
      case 'PENDIENTE_REASIGNACION':
        return (
          <span className="px-3 py-1 text-xs font-extrabold bg-purple-100 text-purple-900 border border-purple-300 rounded-full flex items-center gap-1">
            <AlertTriangle size={12} className="text-purple-600" /> PEND. REASIGNACIÓN
          </span>
        );
      case 'FINALIZADO':
        return (
          <span className="px-3 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" /> FINALIZADO
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-800 rounded-full">
            {estado}
          </span>
        );
    }
  };

  // Si hay error de permisos (403 Forbidden)
  if (errorAcceso) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-md text-center my-8">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl font-black text-red-900 mb-2">Acceso Denegado / No Autorizado</h2>
          <p className="text-sm font-semibold text-red-700 max-w-md mx-auto mb-6">
            {errorAcceso}
          </p>
          {onVolver && (
            <button
              onClick={onVolver}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Volver al Menú Principal
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <BarChart3 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} /> Módulo Supervisión
              </span>
              {ultimaActualizacion && (
                <span className="text-[11px] font-bold text-slate-400">
                  Actualizado: {ultimaActualizacion}
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">
              Dashboard de Supervisión y Auditoría del Taller
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === 'resumen') cargarResumen();
              else cargarAuditoria({ n_bus: filtroBus, estado: filtroEstado, mecanico_nombre: filtroMecanicoNombre });
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw size={14} className={loadingResumen || loadingAuditoria ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>

          {onVolver && (
            <button
              onClick={onVolver}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Volver</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Nivel Superior */}
      <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-2xl border shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'resumen'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity size={18} />
          <span>Telemetría y KPIs del Taller</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'auditoria'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={18} />
          <span>Auditoría Inmutable de Buses ({auditorias.length})</span>
        </button>
      </div>

      {errorGenerico && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 text-amber-900">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm font-semibold">{errorGenerico}</p>
        </div>
      )}

      {/* 📊 TAB 1: TELEMETRÍA Y KPIS */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {loadingResumen ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <RefreshCw size={32} className="animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">Cargando métricas clave del taller...</p>
            </div>
          ) : resumen ? (
            <>
              {/* Tarjetas resumen de estados */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Total */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow transition">
                  <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Solicitudes Totales
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {resumen.metricas_estado.total_solicitudes}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold mt-1">Registradas en sistema</div>
                </div>

                {/* Reportadas */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-sm hover:shadow transition">
                  <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock size={12} /> Reportadas
                  </div>
                  <div className="text-3xl font-black text-amber-950">
                    {resumen.metricas_estado.reportadas}
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold mt-1">Esperando mecánico</div>
                </div>

                {/* En Reparación */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 shadow-sm hover:shadow transition">
                  <div className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Wrench size={12} /> En Reparación
                  </div>
                  <div className="text-3xl font-black text-blue-950">
                    {resumen.metricas_estado.en_reparacion}
                  </div>
                  <div className="text-[10px] text-blue-700 font-bold mt-1">En atención activa</div>
                </div>

                {/* Pendiente Reasignación */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 shadow-sm hover:shadow transition">
                  <div className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Pend. Reasignación
                  </div>
                  <div className="text-3xl font-black text-purple-950">
                    {resumen.metricas_estado.pendiente_reasignacion}
                  </div>
                  <div className="text-[10px] text-purple-700 font-bold mt-1">Turno liberado</div>
                </div>

                {/* Finalizadas */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 shadow-sm hover:shadow transition col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Finalizadas
                  </div>
                  <div className="text-3xl font-black text-emerald-950">
                    {resumen.metricas_estado.finalizadas}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">Listas para ruta</div>
                </div>
              </div>

              {/* Fila Central: % Resolución de Fallas y Buses Activos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Indicador KPI Resolución */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Activity className="text-indigo-600" size={18} />
                        Porcentaje de Resolución de Fallas
                      </h3>
                      <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                        {resumen.porcentaje_resolucion_fallas.toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mb-4">
                      Proporción de fallas individuales resueltas en relación al total de ítems reportados.
                    </p>

                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200 p-0.5 mb-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(resumen.porcentaje_resolucion_fallas, 100)}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Fallas Resueltas</span>
                        <span className="text-lg font-black text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={16} /> {resumen.total_fallas_resueltas}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Total Fallas Registradas</span>
                        <span className="text-lg font-black text-slate-800 flex items-center gap-1">
                          <FileText size={16} /> {resumen.total_fallas_registradas}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buses Activos en Taller */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Bus className="text-blue-600" size={18} />
                        Buses Activos en Taller ({resumen.buses_activos_taller.length})
                      </h3>
                      <span className="text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        En Proceso
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mb-4">
                      Unidades de transporte actualmente ingresadas con orden abierta.
                    </p>

                    {resumen.buses_activos_taller.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-300">
                        <p className="text-xs font-bold text-slate-500">No hay buses activos en taller en este momento.</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                        {resumen.buses_activos_taller.map((n_bus, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl font-black text-sm text-blue-900 flex items-center gap-1.5 shadow-sm"
                          >
                            <Bus size={14} className="text-blue-600" />
                            <span>Bus #{n_bus}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Desglose de Fallas por Categoría */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                  <Filter className="text-indigo-600" size={18} />
                  Fallas Registradas por Categoría
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Distribución acumulada de fallas reportadas según rubro técnico.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {resumen.fallas_por_categoria.map((cat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-500 block uppercase">Categoría</span>
                        <span className="text-sm font-black text-slate-900">
                          {cat.categoria_nombre || 'Sin Categoría / Personalizada'}
                        </span>
                      </div>
                      <div className="bg-indigo-100 text-indigo-900 border border-indigo-200 font-black text-lg px-3 py-1 rounded-xl">
                        {cat.total_fallas}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 🔍 TAB 2: AUDITORÍA INMUTABLE DE BUSES */}
      {activeTab === 'auditoria' && (
        <div className="space-y-6">
          {/* Formulario de Filtros */}
          <form
            onSubmit={handleFiltrarAuditoria}
            className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Filter size={16} className="text-indigo-600" />
                Filtros de Búsqueda y Auditoría
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Respuesta instantánea
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Filtro Bus */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Número de Bus
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: 101"
                    value={filtroBus}
                    onChange={(e) => setFiltroBus(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Bus size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              {/* Filtro Estado */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Estado de la Orden
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Todos los Estados --</option>
                  <option value="REPORTADO">REPORTADO</option>
                  <option value="EN_REPARACION">EN REPARACIÓN</option>
                  <option value="PENDIENTE_REASIGNACION">PENDIENTE REASIGNACIÓN</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                </select>
              </div>

              {/* Filtro Mecánico Nombre / Username */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Mecánico (Nombre / Username)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Juan o Pérez"
                    value={filtroMecanicoNombre}
                    onChange={(e) => setFiltroMecanicoNombre(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Limpiar Filtros
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Search size={14} />
                <span>Aplicar Filtros</span>
              </button>
            </div>
          </form>

          {/* Lista de Registros de Auditoría */}
          {loadingAuditoria ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <RefreshCw size={32} className="animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">Consultando la bitácora inmutable del taller...</p>
            </div>
          ) : auditorias.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-700">Sin Solicitudes para el Filtro Indicado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No se encontraron registros de trazabilidad que coincidan con los criterios ingresados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditorias.map((item) => {
                const isExpanded = expandedCards[item.id] || false;
                const totalFallas = item.detalles?.length || 0;
                const fallasResueltas = item.detalles?.filter((d) => d.resuelto)?.length || 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 transition overflow-hidden"
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                          #{item.id}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-black text-slate-900 flex items-center gap-1">
                              <Bus size={18} className="text-blue-600" /> Bus #{item.n_bus}
                            </span>
                            {getBadgeEstado(item.estado)}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Creado por: <strong className="text-slate-800">{item.usuario_creador_nombre || `Usuario #${item.usuario_creador_id}`}</strong> • {formatearFecha(item.fecha_creacion)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] font-extrabold text-slate-400 block uppercase">
                            Avance Fallas
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {fallasResueltas} / {totalFallas} Resueltas
                          </span>
                        </div>

                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ocultar Auditoría' : 'Ver Auditoría Completa'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Descripción General */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-700 flex items-start gap-2">
                      <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-slate-900">Descripción inicial: </strong>
                        {item.descripcion_general || 'Sin observación general.'}
                      </div>
                    </div>

                    {/* Contenido Expandible: Detalle de Fallas, Mecánicos y Bitácora */}
                    {isExpanded && (
                      <div className="p-5 space-y-6 bg-slate-50/50">
                        {/* 1. Detalle de Fallas e Historial Mecánico */}
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Wrench size={14} className="text-indigo-600" />
                            1. Fallas Registradas y Auditoría de Mecánicos Resolutores
                          </h4>

                          {item.detalles && item.detalles.length > 0 ? (
                            <div className="space-y-2">
                              {item.detalles.map((det) => (
                                <div
                                  key={det.id}
                                  className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                                    det.resuelto
                                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                      : 'bg-amber-50/60 border-amber-200 text-amber-950'
                                  }`}
                                >
                                  <div className="flex items-start gap-2 max-w-lg">
                                    {det.resuelto ? (
                                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    ) : (
                                      <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <span className="font-black block">
                                        {det.falla?.nombre || det.descripcion_personalizada || 'Falla no especificada'}
                                      </span>
                                      {det.falla?.categoria && (
                                        <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                                          Categoría: {det.falla.categoria.nombre}
                                        </span>
                                      )}
                                      {det.descripcion_personalizada && det.falla && (
                                        <span className="text-[11px] italic text-slate-600 block mt-0.5">
                                          "{det.descripcion_personalizada}"
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    {det.resuelto ? (
                                      <div>
                                        <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                                          Resuelto por: {det.mecanico_resolvio_nombre || `Mecánico #${det.mecanico_resolvio_id}`}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                                          {formatearFecha(det.fecha_resolucion)}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                                        Pendiente de reparación
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Sin detalle de fallas registrado.</p>
                          )}
                        </div>

                        {/* 2. Equipo de Mecánicos Asignados */}
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Users size={14} className="text-indigo-600" />
                            2. Historial de Asignaciones y Turnos de Mecánicos
                          </h4>

                          {item.mecanicos && item.mecanicos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.mecanicos.map((mec) => (
                                <div
                                  key={mec.id}
                                  className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-slate-900 flex items-center gap-1">
                                      <User size={13} className="text-slate-500" />
                                      {mec.mecanico_nombre || `Mecánico #${mec.mecanico_id}`}
                                    </span>
                                    {mec.es_lider_responsable && (
                                      <span className="text-[10px] font-black bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200">
                                        LÍDER
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[10px] text-slate-500 font-medium">
                                    <div>Asignación: <strong className="text-slate-700">{formatearFecha(mec.fecha_asignacion)}</strong></div>
                                    {mec.fecha_desasignacion && (
                                      <div>Desasignado: <strong className="text-red-700">{formatearFecha(mec.fecha_desasignacion)}</strong></div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">No hay registros de asignación técnica aún.</p>
                          )}
                        </div>

                        {/* 3. Bitácora Cronológica de Comentarios */}
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-indigo-600" />
                            3. Bitácora Cronológica Inmutable ({item.comentarios?.length || 0})
                          </h4>

                          {item.comentarios && item.comentarios.length > 0 ? (
                            <div className="space-y-2 border-l-2 border-indigo-200 pl-3">
                              {item.comentarios.map((com) => (
                                <div key={com.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm">
                                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 mb-1">
                                    <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-black">
                                      {com.tipo || 'BITÁCORA'}
                                    </span>
                                    <span>{formatearFecha(com.fecha_registro)}</span>
                                  </div>
                                  <p className="font-bold text-slate-800">
                                    "{com.comentario}"
                                  </p>
                                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                                    Por: {com.usuario_nombre || `Usuario #${com.usuario_id}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Sin comentarios registrados en bitácora.</p>
                          )}
                        </div>

                        {/* Cierre general */}
                        {item.mecanico_cierre_nombre && (
                          <div className="bg-emerald-100/70 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 font-bold flex items-center justify-between">
                            <span>Orden finalizada y entregada por: {item.mecanico_cierre_nombre}</span>
                            <span className="text-[10px]">{formatearFecha(item.fecha_cierre)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
