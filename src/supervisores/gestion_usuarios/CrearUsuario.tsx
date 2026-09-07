import React, { useState } from 'react';
import { UserPlus, Shield, Key, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { crearUsuario } from '../../usuarios/auth/authService';
import type { RolUsuario } from '../../usuarios/auth/authTypes';
import { getApiErrorMessage } from '../../utils/apiErrors';
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
        conductor_id: null,
      });

      setSuccessMsg(`¡Usuario "${newUser.username}" creado exitosamente con el rol ${newUser.rol}!`);
      setUsername('');
      setPassword('');
      setNombreCompleto('');
      setRut('');

      if (onUsuarioCreado) {
        onUsuarioCreado();
      }
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setErrorMsg(getApiErrorMessage(err, 'Error al conectar con el servidor para registrar el usuario.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-usuario-card">
      <div className="crear-usuario-header">
        <div className="flex items-center gap-3">
          <div className="crear-usuario-icon-box">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="crear-usuario-title">Registrar Nuevo Usuario</h2>
            <p className="crear-usuario-subtitle">Crear nuevas credenciales de acceso para personal de flota</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="cu-alert-error">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="cu-alert-success">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="crear-usuario-grid">
        <div>
          <label className="cu-label">Nombre de Usuario *</label>
          <div className="cu-input-wrapper">
            <UserCheck size={18} className="cu-input-icon" />
            <input
              type="text"
              placeholder="Ej: chofer1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="cu-input cu-input-with-icon"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="cu-label">Contraseña *</label>
          <div className="cu-input-wrapper">
            <Key size={18} className="cu-input-icon" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cu-input cu-input-with-icon"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="cu-label">Nombre Completo</label>
          <input
            type="text"
            placeholder="Ej: Pedro Mecánico"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            className="cu-input"
            disabled={loading}
          />
        </div>

        <div>
          <label className="cu-label">RUT</label>
          <input
            type="text"
            placeholder="Ej: 12345678-9"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className="cu-input"
            disabled={loading}
          />
        </div>

        <div>
          <label className="cu-label">Rol de Usuario</label>
          <div className="cu-input-wrapper">
            <Shield size={18} className="cu-input-icon" />
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
              className="cu-select cu-input-with-icon"
              disabled={loading}
            >
              <option value="CONDUCTOR">Conductor</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MECANICO">Mecánico</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>

        <div className="full-width flex gap-3 mt-4">
          {onVolver && (
            <button
              type="button"
              onClick={onVolver}
              className="cu-btn-volver"
            >
              Volver
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="cu-btn-submit"
          >
            {loading ? 'Registrando...' : 'Registrar Nuevo Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
