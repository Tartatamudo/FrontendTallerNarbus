import { useState, useEffect } from 'react';
import Login from './usuarios/auth/Login';
import PerfilUsuario from './usuarios/perfil/PerfilUsuario';
import MenuSeleccion from './components/MenuSeleccion/MenuSeleccion';
import FormularioMantencionTaller from './conductores/mantencion/FormularioMantencionTaller';
import FormularioNeumaticos from './conductores/neumaticos/FormularioNeumaticos';
import ListaUsuarios from './supervisores/gestion_usuarios/ListaUsuarios';
import DashboardMecanico from './mecanicos/revisiones/DashboardMecanico';
import DashboardSupervision from './supervisores/supervision/DashboardSupervision';
import TopBar from './components/TopBar/TopBar';
import { logout, getStoredUser } from './usuarios/auth/authService';
import { obtenerDato } from './utils/storage';
import type { User } from './usuarios/auth/authTypes';

type PantallaState = 'login' | 'menu' | 'mantencion' | 'neumaticos' | 'crear_usuario' | 'mecanico' | 'perfil' | 'supervision';

export default function App() {
  const [pantallaActual, setPantallaActual] = useState<PantallaState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Comprobar si existe sesión activa persistida en el dispositivo
    const comprobarSesion = async () => {
      const sesionActiva = await obtenerDato('sesion_activa');
      if (sesionActiva === 'true') {
        const storedUser = await getStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
        }
        setPantallaActual('menu');
      }
    };
    comprobarSesion();
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setPantallaActual('login');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setPantallaActual('menu');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {pantallaActual !== 'login' && (
        <TopBar
          onLogout={handleLogout}
          onVolver={pantallaActual !== 'menu' ? () => setPantallaActual('menu') : undefined}
        />
      )}

      {/* 🔐 MÓDULO USUARIOS (Pantalla compartida Login) */}
      {pantallaActual === 'login' && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {/* 👤 MÓDULO USUARIOS (Perfil me) */}
      {pantallaActual === 'perfil' && (
        <div className="container max-w-3xl mx-auto p-4">
          <PerfilUsuario initialUser={currentUser} />
        </div>
      )}

      {/* 📋 MENÚ PRINCIPAL ESTRUCTURADO POR ROLES */}
      {pantallaActual === 'menu' && (
        <MenuSeleccion
          user={currentUser}
          onSelectOption={(opcion) => setPantallaActual(opcion)}
          onLogout={handleLogout}
        />
      )}

      {/* 🚌 MÓDULO CONDUCTORES: Mantención Taller */}
      {pantallaActual === 'mantencion' && (
        <FormularioMantencionTaller onVolver={() => setPantallaActual('menu')} />
      )}

      {/* 🛞 MÓDULO CONDUCTORES: Reporte Neumáticos */}
      {pantallaActual === 'neumaticos' && (
        <FormularioNeumaticos onVolver={() => setPantallaActual('menu')} />
      )}

      {/* 👑 MÓDULO SUPERVISORES: Gestión de Usuarios (Crear / Listar / Deshabilitar) */}
      {pantallaActual === 'crear_usuario' && (
        <div className="container max-w-3xl mx-auto p-4">
          <ListaUsuarios onVolver={() => setPantallaActual('menu')} />
        </div>
      )}

      {/* 📊 MÓDULO SUPERVISORES: Telemetría KPIs y Auditoría Inmutable de Buses */}
      {pantallaActual === 'supervision' && (
        <div className="container max-w-6xl mx-auto p-4">
          <DashboardSupervision onVolver={() => setPantallaActual('menu')} />
        </div>
      )}

      {/* 🔧 MÓDULO MECÁNICOS: Panel de Revisiones Taller */}
      {pantallaActual === 'mecanico' && (
        <div className="container max-w-4xl mx-auto p-4">
          <DashboardMecanico onVolver={() => setPantallaActual('menu')} />
        </div>
      )}
    </div>
  );
}

