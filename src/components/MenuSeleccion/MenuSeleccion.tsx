import { useState, useEffect } from 'react';
import { Wrench, Disc, ArrowRight, User as UserIcon, UserPlus, Shield, ClipboardCheck, BarChart3 } from 'lucide-react';
import { getStoredUser } from '../../usuarios/auth/authService';
import type { User } from '../../usuarios/auth/authTypes';
import './MenuSeleccion.css';

interface MenuSeleccionProps {
  onSelectOption: (opcion: 'mantencion' | 'neumaticos' | 'crear_usuario' | 'mecanico' | 'perfil' | 'supervision') => void;
  onLogout?: () => void;
  user?: User | null;
}

export default function MenuSeleccion({ onSelectOption, user }: MenuSeleccionProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);

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
  const isMecanicoOrAdmin = rol === 'MECANICO' || rol === 'ADMIN';

  return (
    <div className="menu-wrapper">
      <main className="menu-main-content">
        {/* Banner de datos del usuario logueado */}
        <div className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : <UserIcon size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Sesión Autenticada</span>
                <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-1">
                  <Shield size={11} className="text-blue-600" /> Rol: {rol || 'CARGANDO...'}
                </span>
              </div>
              <p className="text-lg font-black text-slate-900 leading-tight">
                {currentUser?.username || 'Usuario Narbus'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectOption('perfil')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserIcon size={14} />
            <span>Ver Mi Perfil (GET /me)</span>
          </button>
        </div>

        <div className="menu-welcome-text">
          <h1 className="menu-welcome-title">Panel de Control por Roles</h1>
          <p className="menu-welcome-subtitle">
            Seleccione un módulo según su rol asignado ({rol || 'cargando...'}) para ingresar o gestionar registros.
          </p>
        </div>

        <div className="menu-options-grid">
          {/* Módulo Conductor: Solicitud de Mantención Taller y Reporte de Neumáticos */}
          {isConductorOrAdmin && (
            <>
              <div
                onClick={() => onSelectOption('mantencion')}
                className="menu-option-card"
              >
                <div>
                  <div className="menu-card-icon-box menu-card-icon-mantencion">
                    <Wrench size={32} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">MÓDULO CONDUCTOR</span>
                  </div>
                  <h3 className="menu-card-title">Solicitud de Mantención Taller</h3>
                  <p className="menu-card-desc">
                    Registro de fallas generales de la unidad para el taller central.
                  </p>
                </div>

                <div className="menu-card-action">
                  <span>Ingresar Solicitud</span>
                  <ArrowRight size={18} />
                </div>
              </div>

              <div
                onClick={() => onSelectOption('neumaticos')}
                className="menu-option-card"
              >
                <div>
                  <div className="menu-card-icon-box menu-card-icon-neumaticos">
                    <Disc size={32} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">MÓDULO CONDUCTOR</span>
                  </div>
                  <h3 className="menu-card-title">Reporte de Neumáticos</h3>
                  <p className="menu-card-desc">
                    Registro específico de neumáticos por rueda, pinchazos y marca de fuego.
                  </p>
                </div>

                <div className="menu-card-action text-emerald-600">
                  <span>Ingresar Reporte</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </>
          )}

          {/* Módulo Supervisor: Telemetría / Auditoría y Gestión de Usuarios */}
          {isSupervisorOrAdmin && (
            <>
              <div
                onClick={() => onSelectOption('supervision')}
                className="menu-option-card border-2 border-indigo-300 bg-indigo-50/50"
              >
                <div>
                  <div className="menu-card-icon-box bg-indigo-600 text-white">
                    <BarChart3 size={32} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-md">MÓDULO SUPERVISOR</span>
                  </div>
                  <h3 className="menu-card-title">Supervisión y Auditoría Taller</h3>
                  <p className="menu-card-desc">
                    Telemetría KPIs en tiempo real y auditoría inmutable de reparación de buses.
                  </p>
                </div>

                <div className="menu-card-action text-indigo-700">
                  <span>Ver Auditoría Taller</span>
                  <ArrowRight size={18} />
                </div>
              </div>

              <div
                onClick={() => onSelectOption('crear_usuario')}
                className="menu-option-card border-2 border-amber-300 bg-amber-50/50"
              >
                <div>
                  <div className="menu-card-icon-box bg-amber-500 text-white">
                    <UserPlus size={32} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">MÓDULO SUPERVISOR</span>
                  </div>
                  <h3 className="menu-card-title">Gestión y Registro de Usuarios</h3>
                  <p className="menu-card-desc">
                    Crear y gestionar credenciales para choferes, supervisores y mecánicos.
                  </p>
                </div>

                <div className="menu-card-action text-amber-700">
                  <span>Gestión de Usuarios</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </>
          )}

          {/* Módulo Mecánico: Revisiones de Taller */}
          {isMecanicoOrAdmin && (
            <div
              onClick={() => onSelectOption('mecanico')}
              className="menu-option-card border-2 border-indigo-200 bg-indigo-50/50"
            >
              <div>
                <div className="menu-card-icon-box bg-indigo-600 text-white">
                  <ClipboardCheck size={32} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-md">MÓDULO MECÁNICO</span>
                </div>
                <h3 className="menu-card-title">Panel de Revisiones Taller</h3>
                <p className="menu-card-desc">
                  Ver y actualizar estado de órdenes de trabajo e inspección técnica de unidades.
                </p>
              </div>

              <div className="menu-card-action text-indigo-700">
                <span>Ver Revisiones</span>
                <ArrowRight size={18} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
