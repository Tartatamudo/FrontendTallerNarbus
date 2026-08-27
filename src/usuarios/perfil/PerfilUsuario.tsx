import { useState, useEffect } from 'react';
import { Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { getMe } from '../auth/authService';
import type { User } from '../auth/authTypes';
import './PerfilUsuario.css';

interface PerfilUsuarioProps {
  initialUser?: User | null;
}

export default function PerfilUsuario({ initialUser }: PerfilUsuarioProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);

  const fetchPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      const meData = await getMe();
      setUser(meData);
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError('No se pudieron obtener los datos actualizados del perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialUser) {
      fetchPerfil();
    }
  }, [initialUser]);

  if (loading) {
    return (
      <div className="perfil-card flex items-center justify-center p-8">
        <RefreshCw size={24} className="animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600 font-medium">Cargando perfil de usuario...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="perfil-card">
        <div className="text-red-600 font-medium mb-3">{error || 'Sin datos de sesión activa.'}</div>
        <button
          onClick={fetchPerfil}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700"
        >
          <RefreshCw size={14} />
          <span>Reintentar (GET /api/v1/auth/me)</span>
        </button>
      </div>
    );
  }

  const getBadgeClass = (rol: string) => {
    switch (rol?.toUpperCase()) {
      case 'ADMIN': return 'badge-admin';
      case 'SUPERVISOR': return 'badge-supervisor';
      case 'CONDUCTOR': return 'badge-conductor';
      case 'MECANICO': return 'badge-mecanico';
      default: return 'badge-conductor';
    }
  };

  return (
    <div className="perfil-card">
      <div className="perfil-header">
        <div className="perfil-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{user.username}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`perfil-badge ${getBadgeClass(user.rol)}`}>
              {user.rol}
            </span>
            {user.is_active && (
              <span className="flex items-center text-xs text-emerald-600 font-medium gap-1">
                <CheckCircle size={14} />
                <span>Activo</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <span className="text-slate-500 block font-medium">ID Usuario</span>
          <span className="text-slate-900 font-semibold">#{user.id}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Nombre de Usuario</span>
          <span className="text-slate-900 font-semibold">{user.username}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Rol Asignado</span>
          <span className="text-slate-900 font-semibold flex items-center gap-1">
            <Shield size={14} className="text-blue-600" />
            {user.rol}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">ID Conductor Asociado</span>
          <span className="text-slate-900 font-semibold">
            {user.conductor_id !== null ? `#${user.conductor_id}` : 'Ninguno (Personal)'}
          </span>
        </div>
      </div>
    </div>
  );
}
