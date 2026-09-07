import React, { useState, useEffect } from 'react';
import { Bus, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { loginJSON } from './authService';
import type { User } from './authTypes';
import { guardarDato, obtenerDato } from '../../utils/storage';
import './Login.css';

import { getApiErrorMessage } from '../../utils/apiErrors';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Al cargar la pantalla, revisar si ya existe un usuario recordado en el teléfono
    const cargarUsuarioGuardado = async () => {
      const savedUser = await obtenerDato('usuario_rut');
      if (savedUser) {
        setUsername(savedUser);
      }
    };
    cargarUsuarioGuardado();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingrese su usuario y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Consumir Endpoint: POST /api/v1/auth/login
      const authResult = await loginJSON({ username: username.trim(), password });

      // Guardar el username localmente para conveniencia
      await guardarDato('usuario_rut', username.trim());

      onLoginSuccess(authResult.user);
    } catch (err) {
      console.error('Error de autenticación:', err);
      const msg = getApiErrorMessage(err, 'No se pudo conectar con el servidor backend. Verifique su conexión o credenciales.');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header con Marca Narbus */}
        <div className="auth-header">
          <div className="auth-logo-box">
            <Bus size={38} className="text-white" />
          </div>
          <h1 className="auth-title">Plataforma Narbus</h1>
          <p className="auth-subtitle">Control y Mantención de Flota</p>
        </div>

        {/* Alerta de Error */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error mb-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">
              <UserIcon size={15} className="text-blue-600" />
              <span>Usuario / RUT</span>
            </label>
            <div className="auth-input-wrapper">
              <UserIcon size={18} className="auth-input-icon" />
              <input
                type="text"
                placeholder="Ej: admin o chofer_juan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <Lock size={15} className="text-blue-600" />
              <span>Contraseña</span>
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <div className="auth-spinner" />
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Sistema de Acceso & Autenticación • Narbus Flotas v2.0</p>
        </div>
      </div>
    </div>
  );
}

