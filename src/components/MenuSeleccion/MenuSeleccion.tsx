import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Disc, ArrowRight, User as UserIcon, UserPlus, Shield, ClipboardCheck, BarChart3 } from 'lucide-react';
import { getStoredUser } from '../../usuarios/auth/authService';
import { obtenerAlertasSupervision } from '../../supervisores/supervision/supervisionService';
import type { User } from '../../usuarios/auth/authTypes';
import './MenuSeleccion.css';

interface MenuSeleccionProps {
  onSelectOption?: (opcion: 'mantencion' | 'neumaticos' | 'crear_usuario' | 'mecanico' | 'perfil' | 'supervision') => void;
  onLogout?: () => void;
  user?: User | null;
}

export default function MenuSeleccion({ onSelectOption, user }: MenuSeleccionProps) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [alertasCount, setAlertasCount] = useState<number>(0);

  const handleSelectOption = (opcion: 'mantencion' | 'neumaticos' | 'crear_usuario' | 'mecanico' | 'perfil' | 'supervision') => {
    if (onSelectOption) {
      onSelectOption(opcion);
    }
    navigate(`/${opcion}`);
  };

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      const cargarUsuario = async () => {
        const stored = await getStoredUser();
        if (stored) {
          setCurrentUser(stored);
        }
      };
      cargarUsuario();
    }
  }, [user]);

  const rol = currentUser?.rol?.toUpperCase() || '';
  const isConductorOrAdmin = rol === 'CONDUCTOR' || rol === 'ADMIN';
  const isSupervisorOrAdmin = rol === 'SUPERVISOR' || rol === 'ADMIN';
  const isMecanico = rol === 'MECANICO';

  useEffect(() => {
    if (isSupervisorOrAdmin) {
      obtenerAlertasSupervision()
        .then((a) => setAlertasCount(a.length))
        .catch(() => setAlertasCount(0));
    }
  }, [isSupervisorOrAdmin]);

  return (
    <div className="menu-wrapper">
      <main className="menu-main-content">
        {/* Banner de datos del usuario logueado */}
        <div className="menu-user-banner w-full rounded-2xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : <UserIcon size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Operador Activo</span>
                <span className="text-[10px] font-black bg-sky-950/80 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-400/30 flex items-center gap-1">
                  <Shield size={11} className="text-sky-400" /> Rol: {rol || 'CARGANDO...'}
                </span>
              </div>
              <p className="menu-user-name text-lg font-black leading-tight">
                {currentUser?.username || 'Usuario Narbus'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSelectOption('perfil')}
            className="menu-btn-perfil px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <UserIcon size={14} />
            <span>Mi Perfil</span>
          </button>
        </div>

        <div className="menu-welcome-text">
          <h1 className="menu-welcome-title">Módulos Operacionales</h1>
          <p className="menu-welcome-subtitle">
            Selecciona una opción para continuar.
          </p>
        </div>

        <div className="menu-options-grid">
          {/* Ingreso a Taller y Auxilio de Neumáticos */}
          {isConductorOrAdmin && (
            <>
              <div
                onClick={() => handleSelectOption('mantencion')}
                className="menu-option-card"
              >
                <div>
                  <div className="menu-card-icon-box menu-card-icon-mantencion">
                    <Wrench size={30} />
                  </div>
                  <h3 className="menu-card-title">Ingreso de Bus a Taller</h3>
                  <p className="menu-card-desc">
                    Reporte de fallas mecánicas, eléctricas o de carrocería para ingreso a taller central.
                  </p>
                </div>

                <div className="menu-card-action">
                  <span>Ingresar Bus a Taller</span>
                  <ArrowRight size={18} />
                </div>
              </div>

              <div
                onClick={() => handleSelectOption('neumaticos')}
                className="menu-option-card"
              >
                <div>
                  <div className="menu-card-icon-box menu-card-icon-neumaticos">
                    <Disc size={30} />
                  </div>
                  <h3 className="menu-card-title">Emergencia de Neumáticos en Ruta</h3>
                  <p className="menu-card-desc">
                    Declaración de auxilio carretero por pinchazos o reventones, vulcanización y marca de fuego.
                  </p>
                </div>

                <div className="menu-card-action text-emerald-400">
                  <span>Declarar Emergencia</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </>
          )}

          {/* Telemetría / Auditoría y Gestión de Personal */}
          {isSupervisorOrAdmin && (
            <>
              <div
                onClick={() => handleSelectOption('supervision')}
                className="menu-option-card"
              >
                <div>
                  <div className="menu-card-icon-box menu-card-icon-supervision">
                    <BarChart3 size={30} />
                  </div>
                  {alertasCount > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black bg-red-950 text-red-300 border border-red-500/40 px-2.5 py-0.5 rounded-full animate-pulse">
                        {alertasCount} alerta(s) activa(s)
                      </span>
                    </div>
                  )}
                  <h3 className="menu-card-title">Supervisión y Telemetría de Flota</h3>
                  <p className="menu-card-desc">
                    Tablero de KPIs en vivo, centro de alertas críticas y bitácora histórica inmutable de buses.
                  </p>
                </div>

                <div className="menu-card-action text-purple-400">
                  <span>Abrir Consola de Supervisión</span>
                  <ArrowRight size={18} />
                </div>
              </div>

              <div
                onClick={() => handleSelectOption('crear_usuario')}
                className="menu-option-card"
              >
                <div>
                  <div className="menu-card-icon-box menu-card-icon-personal">
                    <UserPlus size={30} />
                  </div>
                  <h3 className="menu-card-title">Control de Acceso y Personal</h3>
                  <p className="menu-card-desc">
                    Administración de cuentas, credenciales y permisos para choferes, supervisores y mecánicos.
                  </p>
                </div>

                <div className="menu-card-action text-amber-400">
                  <span>Gestionar Personal</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </>
          )}

          {/* Consola Operacional de Taller */}
          {isMecanico && (
            <div
              onClick={() => handleSelectOption('mecanico')}
              className="menu-option-card"
            >
              <div>
                <div className="menu-card-icon-box menu-card-icon-mecanico">
                  <ClipboardCheck size={30} />
                </div>
                <h3 className="menu-card-title">Consola de Mecánicos: Órdenes en Curso</h3>
                <p className="menu-card-desc">
                  Atender buses en espera, cronometrar turnos de cuadrilla y completar checklist de seguridad.
                </p>
              </div>

              <div className="menu-card-action text-sky-400">
                <span>Abrir Taller Mecánico</span>
                <ArrowRight size={18} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
