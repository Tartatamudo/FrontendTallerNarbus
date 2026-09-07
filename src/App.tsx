import { useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { ThemeProvider } from './context/ThemeContext';

interface RutaProtegidaProps {
  children: ReactNode;
  sesionActiva: boolean | null;
  comprobando: boolean;
}

function RutaProtegida({ children, sesionActiva, comprobando }: RutaProtegidaProps) {
  if (comprobando) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sesionActiva) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sesionActiva, setSesionActiva] = useState<boolean | null>(null);
  const [comprobando, setComprobando] = useState(true);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const sesion = await obtenerDato('sesion_activa');
        if (sesion === 'true') {
          const storedUser = await getStoredUser();
          if (storedUser) {
            setCurrentUser(storedUser);
          }
          setSesionActiva(true);
        } else {
          setSesionActiva(false);
        }
      } catch (err) {
        console.error('Error comprobando sesión:', err);
        setSesionActiva(false);
      } finally {
        setComprobando(false);
      }
    };

    comprobarSesion();
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setSesionActiva(false);
    navigate('/login');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSesionActiva(true);
    navigate('/home');
  };

  const esLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      {!esLogin && sesionActiva && (
        <TopBar />
      )}

      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Ruta Pública: Login */}
          <Route 
            path="/login" 
            element={
              sesionActiva ? (
                <Navigate to="/home" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            } 
          />

          {/* Rutas Protegidas */}
          <Route 
            path="/home" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                <MenuSeleccion
                  user={currentUser}
                  onLogout={handleLogout}
                />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/menu" 
            element={<Navigate to="/home" replace />} 
          />

          <Route 
            path="/perfil" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                <div className="container max-w-6xl mx-auto px-3 py-6 sm:px-6">
                  <PerfilUsuario
                    initialUser={currentUser}
                    onVolver={() => navigate('/home')}
                    onLogout={handleLogout}
                    onNavigate={(opcion) => navigate(`/${opcion}`)}
                  />
                </div>
              </RutaProtegida>
            } 
          />

          <Route 
            path="/mantencion" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                <FormularioMantencionTaller onVolver={() => navigate('/home')} />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/neumaticos" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                <FormularioNeumaticos onVolver={() => navigate('/home')} />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/crear_usuario" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                <div className="container max-w-3xl mx-auto p-4">
                  <ListaUsuarios onVolver={() => navigate('/home')} />
                </div>
              </RutaProtegida>
            } 
          />

          <Route 
            path="/supervision" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                <div className="container max-w-6xl mx-auto p-4">
                  <DashboardSupervision onVolver={() => navigate('/home')} />
                </div>
              </RutaProtegida>
            } 
          />

          <Route 
            path="/mecanico" 
            element={
              <RutaProtegida sesionActiva={sesionActiva} comprobando={comprobando}>
                {currentUser?.rol?.toUpperCase() === 'MECANICO' ? (
                  <div className="container max-w-4xl mx-auto p-4">
                    <DashboardMecanico onVolver={() => navigate('/home')} />
                  </div>
                ) : (
                  <Navigate to="/home" replace />
                )}
              </RutaProtegida>
            } 
          />

          {/* Redirección raíz y fallback */}
          <Route 
            path="/" 
            element={
              comprobando ? (
                <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sesionActiva ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
