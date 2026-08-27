import { apiClient } from '../../api/apiClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from './authTypes';
import { guardarDato, eliminarDato, obtenerDato } from '../../utils/storage';

/**
 * Iniciar Sesión con JSON Payload
 * Endpoint: POST /api/v1/auth/login
 */
export async function loginJSON(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);
  if (response.data.access_token) {
    await guardarDato('access_token', response.data.access_token);
    await guardarDato('user_data', JSON.stringify(response.data.user));
    await guardarDato('sesion_activa', 'true');
  }
  return response.data;
}

/**
 * Iniciar Sesión con OAuth2 / Form Data (application/x-www-form-urlencoded)
 * Endpoint: POST /api/v1/auth/login/token
 */
export async function loginFormData(payload: LoginPayload): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);

  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.data.access_token) {
    await guardarDato('access_token', response.data.access_token);
    await guardarDato('user_data', JSON.stringify(response.data.user));
    await guardarDato('sesion_activa', 'true');
  }
  return response.data;
}

/**
 * Crear Usuario desde Panel (Solo SUPERVISOR o ADMIN)
 * Endpoint: POST /api/v1/auth/usuarios
 */
export async function crearUsuario(payload: RegisterPayload): Promise<User> {
  const response = await apiClient.post<User>('/api/v1/auth/usuarios', payload);
  return response.data;
}

// Alias para compatibilidad con código existente
export async function registerUser(payload: RegisterPayload): Promise<User> {
  return crearUsuario(payload);
}

/**
 * Listar Usuarios (Solo SUPERVISOR o ADMIN)
 * Endpoint: GET /api/v1/auth/usuarios?skip=0&limit=100
 */
export async function obtenerUsuarios(skip = 0, limit = 100): Promise<User[]> {
  const response = await apiClient.get<User[]>('/api/v1/auth/usuarios', {
    params: { skip, limit }
  });
  return response.data;
}

/**
 * Deshabilitar Usuario (Soft Delete - Solo SUPERVISOR o ADMIN)
 * Endpoint: DELETE /api/v1/auth/usuarios/{usuario_id}
 */
export async function deshabilitarUsuario(usuarioId: number): Promise<User> {
  const response = await apiClient.delete<User>(`/api/v1/auth/usuarios/${usuarioId}`);
  return response.data;
}

/**
 * Obtener Perfil del Usuario Actual Logueado
 * Endpoint: GET /api/v1/auth/me
 * Headers: Authorization: Bearer <access_token>
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/api/v1/auth/me');
  if (response.data) {
    await guardarDato('user_data', JSON.stringify(response.data));
  }
  return response.data;
}

/**
 * Health Check Backend Service Status
 * Endpoint: GET /api/v1/health
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await apiClient.get<{ status: string; timestamp: string }>('/api/v1/health');
  return response.data;
}

/**
 * Cerrar Sesión y limpiar almacenamiento local del dispositivo
 */
export async function logout(): Promise<void> {
  await eliminarDato('access_token');
  await eliminarDato('user_data');
  await eliminarDato('sesion_activa');
}

/**
 * Obtener datos del usuario guardados localmente
 */
export async function getStoredUser(): Promise<User | null> {
  const data = await obtenerDato('user_data');
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}
