import { useState, useEffect } from 'react';
import { Users, UserX, Shield, RefreshCw, AlertCircle, CheckCircle2, UserPlus, Search } from 'lucide-react';
import { obtenerUsuarios, deshabilitarUsuario } from '../../usuarios/auth/authService';
import type { User } from '../../usuarios/auth/authTypes';
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

  const cargarUsuarios = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Consumir Endpoint 1.4: GET /api/v1/auth/usuarios?skip=0&limit=100
      const data = await obtenerUsuarios(0, 100);
      setUsuarios(data);
    } catch (err: any) {
      console.error("Error al cargar usuarios:", err);
      const detail = err.response?.data?.detail;
      setErrorMsg(detail || 'No se pudieron cargar los usuarios del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabActiva === 'lista') {
      cargarUsuarios();
    }
  }, [tabActiva]);

  const handleDeshabilitar = async (user: User) => {
    if (!user.is_active) return;
    const seguro = window.confirm(`¿Está seguro de deshabilitar al usuario "${user.username}"?`);
    if (!seguro) return;

    setDeshabilitandoId(user.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Consumir Endpoint 1.6: DELETE /api/v1/auth/usuarios/{id}
      const updatedUser = await deshabilitarUsuario(user.id);
      setSuccessMsg(`El usuario "${updatedUser.username}" ha sido deshabilitado.`);
      setUsuarios(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (err: any) {
      console.error("Error al deshabilitar usuario:", err);
      const detail = err.response?.data?.detail;
      setErrorMsg(detail || 'No se pudo deshabilitar al usuario.');
    } finally {
      setDeshabilitandoId(null);
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
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
                  MÓDULO SUPERVISOR / ADMIN
                </span>
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
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => setTabActiva('lista')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                tabActiva === 'lista'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Users size={16} />
              <span>Lista de Usuarios ({usuarios.length})</span>
            </button>
            <button
              onClick={() => setTabActiva('crear')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                tabActiva === 'crear'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <UserPlus size={16} />
              <span>Crear Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Notificaciones de Alertas */}
        <div className="p-4 space-y-3">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={cargarUsuarios}
                  disabled={loading}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="Refrescar Lista"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Tabla / Tarjetas de Usuarios */}
              {loading && usuarios.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-bold text-xs flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-amber-600" />
                  <span>Cargando usuarios desde /api/v1/auth/usuarios...</span>
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="py-10 text-center text-slate-500 font-bold text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No se encontraron usuarios en el sistema.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {usuariosFiltrados.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        user.is_active
                          ? 'bg-white border-slate-200 shadow-sm'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            user.rol === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : user.rol === 'SUPERVISOR'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : user.rol === 'MECANICO'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {user.rol.substring(0, 3)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{user.username}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                user.is_active
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-700 border border-red-300'
                              }`}
                            >
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Rol: {user.rol}</span>
                            {user.conductor_id && <span>• Conductor ID: #{user.conductor_id}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Acción Deshabilitar */}
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeshabilitar(user)}
                          disabled={deshabilitandoId === user.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black transition flex items-center gap-1 shrink-0 cursor-pointer"
                          title="Deshabilitar Usuario (Soft Delete)"
                        >
                          <UserX size={14} />
                          <span>{deshabilitandoId === user.id ? 'Deshabilitando...' : 'Deshabilitar'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 italic">Deshabilitado</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
