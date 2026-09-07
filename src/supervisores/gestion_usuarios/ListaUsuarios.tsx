import { useState, useEffect } from 'react';
import { Users, UserX, Shield, RefreshCw, AlertCircle, CheckCircle2, UserPlus, Search } from 'lucide-react';
import { obtenerUsuarios, deshabilitarUsuario } from '../../usuarios/auth/authService';
import type { User } from '../../usuarios/auth/authTypes';
import { getApiErrorMessage } from '../../utils/apiErrors';
import ModalConfirmacion from '../../components/ModalConfirmacion/ModalConfirmacion';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import CrearUsuario from './CrearUsuario';
import './ListaUsuarios.css';

interface ListaUsuariosProps {
  onVolver?: () => void;
}

export default function ListaUsuarios({ onVolver }: ListaUsuariosProps) {
  const [tabActiva, setTabActiva] = useState<'lista' | 'crear'>('lista');
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [deshabilitandoId, setDeshabilitandoId] = useState<number | null>(null);
  const [usuarioADeshabilitar, setUsuarioADeshabilitar] = useState<User | null>(null);

  const cargarUsuarios = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Consumir Endpoint 1.4: GET /api/v1/auth/usuarios?skip=0&limit=100
      const data = await obtenerUsuarios(0, 100);
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudieron cargar los usuarios del sistema.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabActiva === 'lista') {
      cargarUsuarios();
    }
  }, [tabActiva]);

  const handleSolicitarDeshabilitar = (user: User) => {
    if (!user.is_active) return;
    setUsuarioADeshabilitar(user);
  };

  const confirmarDeshabilitar = async () => {
    if (!usuarioADeshabilitar) return;
    const user = usuarioADeshabilitar;

    setDeshabilitandoId(user.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Consumir Endpoint 1.6: DELETE /api/v1/auth/usuarios/{id}
      const updatedUser = await deshabilitarUsuario(user.id);
      setSuccessMsg(`El usuario "${updatedUser.username}" ha sido deshabilitado.`);
      setUsuarios(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (err) {
      console.error("Error al deshabilitar usuario:", err);
      setErrorMsg(getApiErrorMessage(err, 'No se pudo deshabilitar al usuario.'));
    } finally {
      setDeshabilitandoId(null);
      setUsuarioADeshabilitar(null);
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="lista-usuarios-wrapper">
      <div className="lista-usuarios-card">
        {/* Header Corporativo */}
        <div className="lista-usuarios-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-2xl">
                <Shield size={26} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Gestión de Usuarios</h1>
              </div>
            </div>

            {onVolver && (
              <button
                onClick={onVolver}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20"
              >
                ← Volver al Menú
              </button>
            )}
          </div>

          {/* Navegación por Pestañas */}
          <div className="lu-tabs-container">
            <button
              onClick={() => setTabActiva('lista')}
              className={`lu-tab-btn ${tabActiva === 'lista' ? 'lu-tab-btn-active' : ''}`}
            >
              <Users size={16} />
              <span>Lista de Usuarios ({usuarios.length})</span>
            </button>
            <button
              onClick={() => setTabActiva('crear')}
              className={`lu-tab-btn ${tabActiva === 'crear' ? 'lu-tab-btn-active' : ''}`}
            >
              <UserPlus size={16} />
              <span>Crear Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Notificaciones de Alertas */}
        <div className="p-4 space-y-3">
          {errorMsg && (
            <div className="lu-alert-error">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="lu-alert-success">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tabActiva === 'crear' ? (
            <CrearUsuario
              onUsuarioCreado={() => {
                setTabActiva('lista');
                cargarUsuarios();
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Buscador & Refrescar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario o rol..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="lu-search-input"
                  />
                </div>
                <button
                  onClick={cargarUsuarios}
                  disabled={loading}
                  className="lu-btn-refresh"
                  title="Refrescar Lista"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Tabla / Tarjetas de Usuarios */}
              {loading && usuarios.length === 0 ? (
                <div className="py-4">
                  <SkeletonLoader variant="row" count={4} />
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="lu-empty-box">
                  No se encontraron usuarios en el sistema.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {usuariosFiltrados.map((user) => (
                    <div
                      key={user.id}
                      className={`lu-user-item ${!user.is_active ? 'lu-user-item-disabled' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            user.rol === 'ADMIN'
                              ? 'lu-role-admin'
                              : user.rol === 'SUPERVISOR'
                              ? 'lu-role-supervisor'
                              : user.rol === 'MECANICO'
                              ? 'lu-role-mecanico'
                              : 'lu-role-conductor'
                          }`}
                        >
                          {user.rol.substring(0, 3)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="lu-user-name">{user.username}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                user.is_active ? 'lu-status-active' : 'lu-status-inactive'
                              }`}
                            >
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="lu-user-meta">
                            <span>Rol: {user.rol}</span>
                            {user.conductor_id && <span>• Conductor ID: #{user.conductor_id}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Acción Deshabilitar (Táctil accesible) */}
                      {user.is_active ? (
                        <button
                          onClick={() => handleSolicitarDeshabilitar(user)}
                          disabled={deshabilitandoId === user.id}
                          className="lu-btn-deshabilitar"
                          title="Deshabilitar Usuario (Soft Delete)"
                        >
                          <UserX size={15} />
                          <span>{deshabilitandoId === user.id ? 'Deshabilitando...' : 'Deshabilitar'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 italic">Deshabilitado</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación Táctil Preventivo */}
      <ModalConfirmacion
        abierto={usuarioADeshabilitar !== null}
        titulo="¿Deshabilitar Usuario?"
        mensaje={`Esta acción deshabilitará el acceso al sistema para el usuario "${usuarioADeshabilitar?.username}" (Rol: ${usuarioADeshabilitar?.rol}). No podrá iniciar sesión hasta que sea reactivado.`}
        textoConfirmar="Sí, Deshabilitar"
        textoCancelar="Cancelar"
        variante="danger"
        cargando={deshabilitandoId !== null}
        onConfirmar={confirmarDeshabilitar}
        onCancelar={() => setUsuarioADeshabilitar(null)}
      />
    </div>
  );
}
