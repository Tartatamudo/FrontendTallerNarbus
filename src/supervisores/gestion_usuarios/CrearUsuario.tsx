import React, { useState } from 'react';
import { UserPlus, Shield, Key, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { crearUsuario } from '../../usuarios/auth/authService';
import type { RolUsuario } from '../../usuarios/auth/authTypes';
import './CrearUsuario.css';

interface CrearUsuarioProps {
  onUsuarioCreado?: () => void;
  onVolver?: () => void;
}

export default function CrearUsuario({ onUsuarioCreado, onVolver }: CrearUsuarioProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [rut, setRut] = useState('');
  const [rol, setRol] = useState<RolUsuario>('CONDUCTOR');
  const [conductorId, setConductorId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Debe ingresar un nombre de usuario y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Consumir Endpoint 1.6: POST /api/v1/auth/usuarios
      const newUser = await crearUsuario({
        username: username.trim(),
        password,
        nombre_completo: nombreCompleto.trim() || username.trim(),
        rut: rut.trim() || '12345678-9',
        rol,
        conductor_id: conductorId ? parseInt(conductorId, 10) : null,
      });

      setSuccessMsg(`¡Usuario "${newUser.username}" creado exitosamente con el rol ${newUser.rol}!`);
      setUsername('');
      setPassword('');
      setNombreCompleto('');
      setRut('');
      setConductorId('');

      if (onUsuarioCreado) {
        onUsuarioCreado();
      }
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      if (err.response?.status === 400 || err.response?.status === 409) {
        setErrorMsg(err.response?.data?.detail || 'El nombre de usuario ya existe en el sistema.');
      } else {
        setErrorMsg('Error al conectar con el servidor para registrar el usuario.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-usuario-card">
      <div className="crear-usuario-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Módulo Supervisor: Registrar Usuario</h2>
            <p className="text-sm text-slate-500">Crear nuevas credenciales de acceso para personal de flota</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="crear-usuario-grid">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de Usuario *</label>
          <div className="relative flex items-center">
            <UserCheck size={18} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Ej: chofer1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña *</label>
          <div className="relative flex items-center">
            <Key size={18} className="absolute left-3 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            placeholder="Ej: Pedro Mecánico"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">RUT</label>
          <input
            type="text"
            placeholder="Ej: 12345678-9"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Rol de Usuario</label>
          <div className="relative flex items-center">
            <Shield size={18} className="absolute left-3 text-slate-400" />
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
              disabled={loading}
            >
              <option value="CONDUCTOR">Conductor</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MECANICO">Mecánico</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">ID Conductor (Opcional)</label>
          <input
            type="number"
            placeholder="Ej: 101"
            value={conductorId}
            onChange={(e) => setConductorId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white text-sm"
            disabled={loading}
          />
        </div>

        <div className="full-width flex gap-3 mt-4">
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm"
            >
              Volver
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Registrando...' : 'Registrar Nuevo Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
