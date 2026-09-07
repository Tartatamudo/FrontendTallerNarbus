import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Wrench, 
  Disc, 
  BarChart3, 
  ClipboardCheck, 
  Users, 
  AlertTriangle, 
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  LogOut,
  Bus,
  TrendingUp,
  Fuel,
  CreditCard,
  Star,
  MessageSquare,
  Scale,
  FileText,
  RotateCcw,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { getMe, logout } from '../auth/authService';
import type { User } from '../auth/authTypes';
import { getApiErrorMessage } from '../../utils/apiErrors';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import './PerfilUsuario.css';

interface PerfilUsuarioProps {
  initialUser?: User | null;
  onVolver?: () => void;
  onLogout?: () => void;
  onNavigate?: (opcion: 'mantencion' | 'neumaticos' | 'crear_usuario' | 'mecanico' | 'supervision') => void;
}

const CONSEJOS_SEGURIDAD = [
  {
    tag: 'DISTANCIA Y PREVENCIÓN',
    frase: 'Mantener la distancia de seguridad con el vehículo precedente otorga los segundos vitales que marcan la diferencia ante cualquier imprevisto.',
    num: '18 de 35'
  },
  {
    tag: 'CONDUCCIÓN EFICIENTE',
    frase: 'Una aceleración progresiva y el uso anticipado del freno motor garantizan el confort de los pasajeros y reducen el desgaste de neumáticos.',
    num: '19 de 35'
  },
  {
    tag: 'PAUTA DE SEGURIDAD',
    frase: 'La inspección visual de frenos, neumáticos y luces antes del despacho es el estándar inquebrantable de la familia Narbus.',
    num: '20 de 35'
  }
];

export default function PerfilUsuario({ 
  initialUser, 
  onVolver, 
  onLogout,
  onNavigate 
}: PerfilUsuarioProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);
  const [consejoIndex, setConsejoIndex] = useState<number>(0);

  const fetchPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      const meData = await getMe();
      setUser(meData);
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError(getApiErrorMessage(err, 'No pudimos cargar tus datos de perfil en este momento.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialUser) {
      fetchPerfil();
    }
  }, [initialUser]);

  const handleVolver = () => {
    if (onVolver) {
      onVolver();
    } else {
      navigate('/home');
    }
  };

  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
      navigate('/login');
    }
  };

  const handleNavegar = (ruta: string, opcion?: 'mantencion' | 'neumaticos' | 'crear_usuario' | 'mecanico' | 'supervision') => {
    if (onNavigate && opcion) {
      onNavigate(opcion);
    } else {
      navigate(ruta);
    }
  };

  const rotarConsejo = () => {
    setConsejoIndex((prev) => (prev + 1) % CONSEJOS_SEGURIDAD.length);
  };

  if (loading) {
    return (
      <div className="perfil-container p-4">
        <div className="bg-[#111622] rounded-3xl p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <SkeletonLoader variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="perfil-container p-4">
        <div className="bg-[#111622] border border-white/10 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-red-900/30 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No se pudo cargar la información</h3>
          <p className="text-red-400 font-medium mb-6">{error || 'No hay una sesión activa.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={fetchPerfil}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-sm transition cursor-pointer"
            >
              Intentar Nuevamente
            </button>
            <button
              onClick={handleVolver}
              className="perfil-btn-volver-menu"
            >
              <ArrowLeft size={16} />
              <span>Volver a la Consola Principal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rol = user.rol?.toUpperCase() || 'CONDUCTOR';

  const getRoleConfig = (rolStr: string) => {
    switch (rolStr) {
      case 'ADMIN':
        return {
          pillClass: 'perfil-pill-blue',
          label: 'Administrador',
          icon: <Shield size={13} className="text-sky-400" />,
        };
      case 'SUPERVISOR':
        return {
          pillClass: 'perfil-pill-amber',
          label: 'Supervisor de Flota',
          icon: <BarChart3 size={13} className="text-amber-400" />,
        };
      case 'MECANICO':
        return {
          pillClass: 'perfil-pill-purple',
          label: 'Mecánico de Taller',
          icon: <Wrench size={13} className="text-purple-400" />,
        };
      case 'CONDUCTOR':
      default:
        return {
          pillClass: 'perfil-pill-blue',
          label: 'Conductor',
          icon: <Bus size={13} className="text-sky-400" />,
        };
    }
  };

  const roleConfig = getRoleConfig(rol);
  const nombreParaMostrar = user.nombre_completo || user.username;
  const primerNombre = nombreParaMostrar.split(' ')[0] || nombreParaMostrar;

  // Fecha en formato chileno
  const fechaChile = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  const fechaFormateada = fechaChile.charAt(0).toUpperCase() + fechaChile.slice(1);

  const getWelcomeSubtitle = (rolStr: string) => {
    switch (rolStr) {
      case 'ADMIN':
        return 'Resumen ejecutivo y accesos a la operación de Narbus Internacional.';
      case 'CONDUCTOR':
        return 'Hoja de ruta operacional y reporte de incidencias para Narbus Internacional.';
      case 'MECANICO':
        return 'Consola técnica de reparaciones y pautas preventivas en maestranza.';
      case 'SUPERVISOR':
        return 'Supervisión ejecutiva, control de patio y telemetría de flota en tiempo real.';
      default:
        return 'Resumen ejecutivo y accesos a la operación de Narbus Internacional.';
    }
  };

  // 4 Tarjetas de Métricas KPI adaptadas visualmente al mockup
  const renderKpiCards = () => {
    if (rol === 'ADMIN' || rol === 'SUPERVISOR') {
      return (
        <div className="perfil-kpi-grid">
          {/* Tarjeta 1: Flota en Operación */}
          <div className="perfil-kpi-card perfil-kpi-blue">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-sky-400">
                  <Bus size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-blue">MES ACTUAL</span>
              </div>
              <p className="perfil-kpi-label">FLOTA EN OPERACIÓN</p>
              <h3 className="perfil-kpi-value">48 Buses</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Buses activos en septiembre</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Tarjeta 2: Viajes del Período */}
          <div className="perfil-kpi-card perfil-kpi-green">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-green">TRÁFICO</span>
              </div>
              <p className="perfil-kpi-label">VIAJES DEL PERÍODO</p>
              <h3 className="perfil-kpi-value">438</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Salidas en septiembre</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Tarjeta 3: Combustible Mensual */}
          <div className="perfil-kpi-card perfil-kpi-amber">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-amber-400">
                  <Fuel size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-amber">DIÉSEL</span>
              </div>
              <p className="perfil-kpi-label">COMBUSTIBLE MENSUAL</p>
              <h3 className="perfil-kpi-value">52.620 L</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Litros diésel en septiembre</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Tarjeta 4: Gasto en Peajes */}
          <div className="perfil-kpi-card perfil-kpi-purple">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-purple-400">
                  <CreditCard size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-purple">TAG</span>
              </div>
              <p className="perfil-kpi-label">GASTO EN PEAJES</p>
              <h3 className="perfil-kpi-value">$0</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Sin cartola de septiembre</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      );
    }

    if (rol === 'MECANICO') {
      return (
        <div className="perfil-kpi-grid">
          <div className="perfil-kpi-card perfil-kpi-blue">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-sky-400">
                  <Bus size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-blue">PATIO TALLER</span>
              </div>
              <p className="perfil-kpi-label">BUSES EN ESPERA</p>
              <h3 className="perfil-kpi-value">5 Buses</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Pendientes de atención</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          <div className="perfil-kpi-card perfil-kpi-green">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-emerald-400">
                  <ClipboardCheck size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-green">CUADRILLA</span>
              </div>
              <p className="perfil-kpi-label">MIS TRABAJOS</p>
              <h3 className="perfil-kpi-value">2 Órdenes</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Turno activo en faena</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          <div className="perfil-kpi-card perfil-kpi-amber">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-amber-400">
                  <CheckCircle2 size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-amber">SEGURIDAD</span>
              </div>
              <p className="perfil-kpi-label">PAUTA 11 PUNTOS</p>
              <h3 className="perfil-kpi-value">100% OK</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Inspecciones completas</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          <div className="perfil-kpi-card perfil-kpi-purple">
            <div>
              <div className="perfil-kpi-header">
                <div className="perfil-kpi-icon-box text-purple-400">
                  <Wrench size={20} />
                </div>
                <span className="perfil-kpi-tag perfil-tag-purple">BODEGA</span>
              </div>
              <p className="perfil-kpi-label">REPUESTOS</p>
              <h3 className="perfil-kpi-value">98% Stock</h3>
            </div>
            <div className="perfil-kpi-footer">
              <span>Sin quiebres críticos</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      );
    }

    // CONDUCTOR
    return (
      <div className="perfil-kpi-grid">
        <div className="perfil-kpi-card perfil-kpi-blue">
          <div>
            <div className="perfil-kpi-header">
              <div className="perfil-kpi-icon-box text-sky-400">
                <Bus size={20} />
              </div>
              <span className="perfil-kpi-tag perfil-tag-blue">FLOTA NARBUS</span>
            </div>
            <p className="perfil-kpi-label">BUSES ACTIVOS</p>
            <h3 className="perfil-kpi-value">48 Buses</h3>
          </div>
          <div className="perfil-kpi-footer">
            <span>Flota en carretera</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="perfil-kpi-card perfil-kpi-green">
          <div>
            <div className="perfil-kpi-header">
              <div className="perfil-kpi-icon-box text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <span className="perfil-kpi-tag perfil-tag-green">MI RUTA</span>
            </div>
            <p className="perfil-kpi-label">TURNO HOY</p>
            <h3 className="perfil-kpi-value">En Servicio</h3>
          </div>
          <div className="perfil-kpi-footer">
            <span>Itinerario vigente</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="perfil-kpi-card perfil-kpi-amber">
          <div>
            <div className="perfil-kpi-header">
              <div className="perfil-kpi-icon-box text-amber-400">
                <Wrench size={20} />
              </div>
              <span className="perfil-kpi-tag perfil-tag-amber">SISTEMA TALLER</span>
            </div>
            <p className="perfil-kpi-label">ESTADO BUS</p>
            <h3 className="perfil-kpi-value">Operativo</h3>
          </div>
          <div className="perfil-kpi-footer">
            <span>Sin fallas declaradas</span>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="perfil-kpi-card perfil-kpi-purple">
          <div>
            <div className="perfil-kpi-header">
              <div className="perfil-kpi-icon-box text-purple-400">
                <CheckCircle2 size={20} />
              </div>
              <span className="perfil-kpi-tag perfil-tag-purple">PREVENTIVA</span>
            </div>
            <p className="perfil-kpi-label">CHECKLIST</p>
            <h3 className="perfil-kpi-value">Al Día</h3>
          </div>
          <div className="perfil-kpi-footer">
            <span>Pauta de seguridad</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    );
  };

  // Módulos con diseño idéntico a las tarjetas del mockup
  const renderModulosPorRol = () => {
    switch (rol) {
      case 'ADMIN':
        return (
          <>
            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-amber">
                  <Star size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Resumen de Feedback</span>
                    <span className="perfil-modulo-category-badge">Atención</span>
                  </div>
                  <p className="perfil-modulo-desc">Dashboard y notas de satisfacción</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-blue">
                  <MessageSquare size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Opiniones de Pasajeros</span>
                    <span className="perfil-modulo-category-badge">Pasajeros</span>
                  </div>
                  <p className="perfil-modulo-desc">Listado y comentarios en vivo</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-rose">
                  <Scale size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Reclamos SERNAC</span>
                    <span className="perfil-modulo-category-badge">Legal</span>
                  </div>
                  <p className="perfil-modulo-desc">Bandeja de casos y respuestas formales</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-emerald">
                  <FileText size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Encuestas de Calidad</span>
                    <span className="perfil-modulo-category-badge">Auditoría</span>
                  </div>
                  <p className="perfil-modulo-desc">Muestreos de confort y servicio</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/crear_usuario', 'crear_usuario')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-purple">
                  <Users size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Evaluación de Choferes</span>
                    <span className="perfil-modulo-category-badge">Tripulación</span>
                  </div>
                  <p className="perfil-modulo-desc">Desempeño y notas por conductor</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-blue">
                  <Bus size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Monitoreo de Flota</span>
                    <span className="perfil-modulo-category-badge">Operaciones</span>
                  </div>
                  <p className="perfil-modulo-desc">Estado, patentes y asignación de buses</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </>
        );

      case 'CONDUCTOR':
        return (
          <>
            <div 
              onClick={() => handleNavegar('/mantencion', 'mantencion')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-amber">
                  <Wrench size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Ingreso de Bus a Taller</span>
                    <span className="perfil-modulo-category-badge">Mecánica</span>
                  </div>
                  <p className="perfil-modulo-desc">Reportar fallas antes de ingresar a patio</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/neumaticos', 'neumaticos')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-emerald">
                  <Disc size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Auxilio de Neumáticos</span>
                    <span className="perfil-modulo-category-badge">Ruta</span>
                  </div>
                  <p className="perfil-modulo-desc">Declaración de pinchazo o vulcanización</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/home')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-blue">
                  <Bus size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Máquina Asignada</span>
                    <span className="perfil-modulo-category-badge">Flota</span>
                  </div>
                  <p className="perfil-modulo-desc">Verificar patente y condición del bus</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/home')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-purple">
                  <FileText size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Pauta Preventiva</span>
                    <span className="perfil-modulo-category-badge">Seguridad</span>
                  </div>
                  <p className="perfil-modulo-desc">Checklist de inspección pre-viaje</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </>
        );

      case 'MECANICO':
        return (
          <>
            <div 
              onClick={() => handleNavegar('/mecanico', 'mecanico')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-blue">
                  <ClipboardCheck size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Consola de Taller</span>
                    <span className="perfil-modulo-category-badge">Faena</span>
                  </div>
                  <p className="perfil-modulo-desc">Órdenes activas y autoasignación</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/mecanico', 'mecanico')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-emerald">
                  <CheckCircle2 size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Pauta de 11 Puntos</span>
                    <span className="perfil-modulo-category-badge">Seguridad</span>
                  </div>
                  <p className="perfil-modulo-desc">Checklist de salida a carretera</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/mecanico', 'mecanico')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-amber">
                  <Wrench size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Falta de Repuestos</span>
                    <span className="perfil-modulo-category-badge">Bodega</span>
                  </div>
                  <p className="perfil-modulo-desc">Notificar bloqueo y solicitar piezas</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/mecanico', 'mecanico')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-indigo">
                  <Bus size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Buses en Maestranza</span>
                    <span className="perfil-modulo-category-badge">Patio</span>
                  </div>
                  <p className="perfil-modulo-desc">Buses ingresados esperando liberación</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </>
        );

      case 'SUPERVISOR':
        return (
          <>
            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-blue">
                  <BarChart3 size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Telemetría y KPIs</span>
                    <span className="perfil-modulo-category-badge">Operaciones</span>
                  </div>
                  <p className="perfil-modulo-desc">Tablero ejecutivo de flota en tiempo real</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-rose">
                  <AlertTriangle size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Centro de Alertas</span>
                    <span className="perfil-modulo-category-badge">Urgente</span>
                  </div>
                  <p className="perfil-modulo-desc">Monitoreo de demoras y auxilios en ruta</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/crear_usuario', 'crear_usuario')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-purple">
                  <Users size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Control de Personal</span>
                    <span className="perfil-modulo-category-badge">Cuentas</span>
                  </div>
                  <p className="perfil-modulo-desc">Gestión de choferes y mecánicos</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div 
              onClick={() => handleNavegar('/supervision', 'supervision')}
              className="perfil-modulo-item"
            >
              <div className="perfil-modulo-left">
                <div className="perfil-modulo-icon-box perfil-icon-emerald">
                  <FileText size={20} />
                </div>
                <div className="perfil-modulo-content">
                  <div className="perfil-modulo-title-row">
                    <span className="perfil-modulo-title">Auditoría Inmutable</span>
                    <span className="perfil-modulo-category-badge">Historial</span>
                  </div>
                  <p className="perfil-modulo-desc">Trazabilidad por N° de bus y mecánico</p>
                </div>
              </div>
              <div className="perfil-modulo-arrow">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const consejoActual = CONSEJOS_SEGURIDAD[consejoIndex];

  return (
    <div className="perfil-container">
      {/* 1. BARRA SUPERIOR DE ESTADO / METADATOS (PILLS) */}
      <div className="perfil-status-row">
        <div className="perfil-status-left">
          <span className={`perfil-pill ${roleConfig.pillClass}`}>
            {roleConfig.icon}
            <span>{roleConfig.label}</span>
          </span>

          <span className="perfil-pill perfil-pill-green">
            <span className="perfil-dot-green" />
            <span>Plataforma Operativa</span>
          </span>

          <span className="perfil-date-text">
            • {fechaFormateada}
          </span>
        </div>

        <div className="perfil-status-right">
          <span className="perfil-filter-pill perfil-filter-active">
            <span className="perfil-dot-green" />
            <span>Mes en curso</span>
          </span>
          <span className="perfil-filter-pill">
            <Calendar size={12} className="text-slate-400" />
            <span>Último consolidado</span>
          </span>
          <span className="perfil-filter-pill">
            <Bus size={12} className="text-slate-400" />
            <span>Flota</span>
          </span>
          <span className="perfil-filter-pill">
            <MessageSquare size={12} className="text-slate-400" />
            <span>Atención</span>
          </span>
        </div>
      </div>

      {/* 2. ENCABEZADO DE BIENVENIDA HERO */}
      <div className="perfil-welcome-block">
        <h1 className="perfil-welcome-title">
          ¡Bienvenido, <span className="perfil-welcome-name">{primerNombre}!</span> 👋
        </h1>
        <p className="perfil-welcome-subtitle">
          {getWelcomeSubtitle(rol)}
        </p>
      </div>

      {/* 3. GRILLA DE 4 TARJETAS KPI */}
      {renderKpiCards()}

      {/* 4. SECCIÓN PRINCIPAL: ACCESOS RÁPIDOS + INSPIRACIÓN */}
      <div className="perfil-main-grid">
        {/* Panel Izquierdo: Accesos Rápidos Operativos */}
        <div className="perfil-accesos-card">
          <div className="perfil-accesos-header">
            <div className="perfil-accesos-title-box">
              <div className="perfil-sparkle-icon">
                <Sparkles size={16} />
              </div>
              <h2 className="perfil-accesos-title">ACCESOS RÁPIDOS OPERATIVOS</h2>
            </div>
            <p className="perfil-accesos-subtitle">
              Módulos y herramientas asignadas a tu perfil de acceso.
            </p>
          </div>

          <div className="perfil-modulos-grid">
            {renderModulosPorRol()}
          </div>
        </div>

        {/* Panel Derecho: Tarjeta de Inspiración y Seguridad Narbus */}
        <div className="perfil-inspiration-card">
          <div className="perfil-inspiration-hero">
            <div className="perfil-inspiration-topbar">
              <div className="perfil-brand-title">
                <span>NAR</span>
                <span className="perfil-brand-star">★</span>
                <span>BUS</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider ml-1">INTERNACIONAL</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="perfil-inspiration-badge">
                  {consejoActual.tag}
                </span>
                <button
                  type="button"
                  onClick={rotarConsejo}
                  className="perfil-refresh-btn"
                  title="Cambiar consejo de seguridad"
                  aria-label="Cambiar consejo"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            <div className="perfil-quote-box">
              <div className="perfil-quote-icon-box">
                <Shield size={20} />
              </div>
              <p className="perfil-quote-text">
                "{consejoActual.frase}"
              </p>
            </div>
          </div>

          <div className="perfil-inspiration-footer">
            <div className="perfil-comunidad-tag">
              <Sparkles size={14} />
              <span>Comunidad Narbus</span>
            </div>
            <span className="perfil-num-pill">
              Inspiración #{consejoActual.num}
            </span>
          </div>
        </div>
      </div>

      {/* 5. RETORNO A LA CONSOLA PRINCIPAL Y CERRAR SESIÓN */}
      <div className="perfil-footer-actions">
        <button
          type="button"
          onClick={handleVolver}
          className="perfil-btn-volver-menu w-full sm:w-auto"
          title="Regresar a la pantalla principal"
        >
          <ArrowLeft size={18} />
          <span>Volver a la Consola Principal</span>
        </button>

        <button
          type="button"
          onClick={handleLogoutClick}
          className="perfil-btn-logout w-full sm:w-auto"
          title="Cerrar tu sesión de forma segura"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
