import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User as UserIcon, 
  Wrench, 
  Disc, 
  BarChart3, 
  ClipboardCheck, 
  Users, 
  AlertTriangle, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  LogOut
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

  if (loading) {
    return (
      <div className="perfil-container p-4">
        <div className="perfil-hero-card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-700/30 rounded-2xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-slate-700/30 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-700/20 rounded animate-pulse" />
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
        <div className="perfil-hero-card p-8 text-center">
          <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No se pudo cargar la información</h3>
          <p className="text-red-400 font-medium mb-6">{error || 'No hay una sesión activa.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={fetchPerfil}
              className="perfil-action-btn perfil-btn-primary max-w-xs"
            >
              <span>Intentar Nuevamente</span>
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
          avatarClass: 'perfil-avatar-admin',
          badgeClass: 'perfil-role-admin',
          label: 'ADMINISTRADOR GENERAL',
          icon: <Shield size={15} className="text-red-400" />,
        };
      case 'SUPERVISOR':
        return {
          avatarClass: 'perfil-avatar-supervisor',
          badgeClass: 'perfil-role-supervisor',
          label: 'SUPERVISOR DE FLOTA',
          icon: <BarChart3 size={15} className="text-amber-400" />,
        };
      case 'MECANICO':
        return {
          avatarClass: 'perfil-avatar-mecanico',
          badgeClass: 'perfil-role-mecanico',
          label: 'MECÁNICO DE TALLER',
          icon: <Wrench size={15} className="text-indigo-400" />,
        };
      case 'CONDUCTOR':
      default:
        return {
          avatarClass: 'perfil-avatar-conductor',
          badgeClass: 'perfil-role-conductor',
          label: 'CONDUCTOR',
          icon: <UserIcon size={15} className="text-sky-400" />,
        };
    }
  };

  const roleConfig = getRoleConfig(rol);
  const nombreParaMostrar = user.nombre_completo || user.username;
  const letraInicial = nombreParaMostrar.charAt(0).toUpperCase();

  // Módulos con explicaciones claras para usuario común
  const renderModulosPorRol = () => {
    switch (rol) {
      case 'CONDUCTOR':
        return (
          <>
            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-blue">
                <Wrench size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Ingreso de Bus a Taller</h4>
                <p className="perfil-module-desc">
                  Usa esta opción cuando tu bus presente algún problema mecánico, eléctrico o daño en la carrocería. Podrás describir la falla y adjuntar fotografías para que el equipo de mecánicos prepare los repuestos antes de que llegues al taller.
                </p>
              </div>
            </div>

            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-emerald">
                <Disc size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Emergencia de Neumáticos en Ruta</h4>
                <p className="perfil-module-desc">
                  Si sufres un pinchazo, reventón o necesitas vulcanización de emergencia durante tu recorrido en carretera, puedes declarar la asistencia indicando la rueda afectada y el costo para coordinar el auxilio.
                </p>
              </div>
            </div>

            <div className="perfil-actions-group mt-2">
              <button
                onClick={() => handleNavegar('/mantencion', 'mantencion')}
                className="perfil-action-btn perfil-btn-primary"
              >
                <Wrench size={18} />
                <span>Ir a Ingresar Bus a Taller</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => handleNavegar('/neumaticos', 'neumaticos')}
                className="perfil-action-btn perfil-btn-menu"
              >
                <Disc size={18} />
                <span>Ir a Emergencia de Neumáticos</span>
              </button>
            </div>
          </>
        );

      case 'MECANICO':
        return (
          <>
            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-indigo">
                <ClipboardCheck size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Consola de Trabajo y Reparaciones</h4>
                <p className="perfil-module-desc">
                  Aquí puedes ver todos los buses que están esperando arreglo en el taller central. Puedes tomar una orden de trabajo, registrar el tiempo que dedicas a la reparación junto a tus compañeros de cuadrilla y marcar las averías resueltas.
                </p>
              </div>
            </div>

            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-blue">
                <CheckCircle2 size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Revisión Preventiva de Seguridad (11 Puntos)</h4>
                <p className="perfil-module-desc">
                  Checklist obligatorio de seguridad donde revisas frenos, luces, dirección, neumáticos y niveles de fluidos para asegurar que el bus esté en perfectas condiciones antes de salir nuevamente a la carretera.
                </p>
              </div>
            </div>

            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-amber">
                <Wrench size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Aviso de Falta de Repuestos</h4>
                <p className="perfil-module-desc">
                  Si durante la reparación encuentras una pieza que necesita ser cambiada y no está en la bodega, puedes reportarlo para que el supervisor gestione la compra y continuar cuando llegue el repuesto.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNavegar('/mecanico', 'mecanico')}
              className="perfil-action-btn perfil-btn-primary mt-2"
            >
              <ClipboardCheck size={18} />
              <span>Abrir mi Taller de Mecánica</span>
              <ArrowRight size={16} />
            </button>
          </>
        );

      case 'SUPERVISOR':
        return (
          <>
            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-indigo">
                <BarChart3 size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Monitoreo y Estado de la Flota</h4>
                <p className="perfil-module-desc">
                  Visualiza en tiempo real cuántos buses están activos en viaje, cuáles están en reparación en el patio, los tiempos que demoran los arreglos y el historial completo de cada máquina.
                </p>
              </div>
            </div>

            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-rose">
                <AlertTriangle size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Centro de Alertas de Taller</h4>
                <p className="perfil-module-desc">
                  Recibe avisos automáticos si un bus lleva demasiado tiempo detenido en reparación o si un chofer declara una emergencia grave de neumáticos durante su servicio.
                </p>
              </div>
            </div>

            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-amber">
                <Users size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Administración de Choferes y Mecánicos</h4>
                <p className="perfil-module-desc">
                  Crea nuevas cuentas de acceso y gestiona las contraseñas y permisos del personal del taller cuando ingresen nuevos trabajadores a la empresa.
                </p>
              </div>
            </div>

            <div className="perfil-actions-group mt-2">
              <button
                onClick={() => handleNavegar('/supervision', 'supervision')}
                className="perfil-action-btn perfil-btn-primary"
              >
                <BarChart3 size={18} />
                <span>Abrir Tablero de Supervisión</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => handleNavegar('/crear_usuario', 'crear_usuario')}
                className="perfil-action-btn perfil-btn-menu"
              >
                <Users size={18} />
                <span>Gestionar Personal</span>
              </button>
            </div>
          </>
        );

      case 'ADMIN':
        return (
          <>
            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-rose">
                <Shield size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Administración y Supervisión General</h4>
                <p className="perfil-module-desc">
                  Tienes acceso a la supervisión estratégica de toda la flota: puedes consultar los tableros de rendimiento, revisar las alertas y auditar los registros inmutables de buses sin intervenir directamente en las tareas mecánicas de patio.
                </p>
              </div>
            </div>

            <div className="perfil-module-card">
              <div className="perfil-module-icon-box perfil-icon-amber">
                <Users size={22} />
              </div>
              <div className="perfil-module-info">
                <h4 className="perfil-module-title">Gestión de Usuarios y Seguridad</h4>
                <p className="perfil-module-desc">
                  Creación, deshabilitación y control de credenciales para todo el personal de la empresa (choferes, mecánicos y supervisores).
                </p>
              </div>
            </div>

            <div className="perfil-actions-group mt-2">
              <button
                onClick={() => handleNavegar('/supervision', 'supervision')}
                className="perfil-action-btn perfil-btn-primary"
              >
                <BarChart3 size={18} />
                <span>Abrir Consola de Supervisión</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => handleNavegar('/crear_usuario', 'crear_usuario')}
                className="perfil-action-btn perfil-btn-menu"
              >
                <Users size={18} />
                <span>Gestionar Personal</span>
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="perfil-container">
      {/* 1. HERO CARD: IDENTIFICACIÓN DEL OPERADOR */}
      <div className="perfil-hero-card">
        <div className="perfil-cover-banner flex justify-end items-start">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-sky-200 bg-black/40 px-2.5 py-1 rounded-full border border-sky-400/20">
              CUENTA ACTIVA
            </span>
          </div>
        </div>

        <div className="perfil-hero-body">
          <div className="perfil-avatar-container">
            {/* Avatar Circular con Halo Temático */}
            <div className={`perfil-avatar-circle ${roleConfig.avatarClass}`}>
              <div className="perfil-avatar-inner">
                {letraInicial}
              </div>
            </div>
          </div>

          {/* Información Principal */}
          <div className="space-y-2">
            <div>
              <h1 className="perfil-user-name">
                {nombreParaMostrar}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`perfil-role-badge ${roleConfig.badgeClass}`}>
                {roleConfig.icon}
                <span>{roleConfig.label}</span>
              </span>

              {user.rut && (
                <span className="perfil-rut-badge">
                  RUT: {user.rut}
                </span>
              )}

              {user.is_active && (
                <span className="badge-status badge-ok" title="Tu cuenta se encuentra habilitada">
                  Habilitado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TARJETA PRINCIPAL: TUS TAREAS Y MÓDULOS HABILITADOS */}
      <div className="perfil-section-card">
        <div className="perfil-section-header">
          <div className="perfil-section-title">
            <Sparkles size={18} className="text-sky-400" />
            <span>¿Qué puedes hacer en tu cuenta?</span>
          </div>
        </div>

        <div className="perfil-modules-list">
          {renderModulosPorRol()}
        </div>

        {/* Retorno al Menú Principal y Cerrar Sesión */}
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
    </div>
  );
}
