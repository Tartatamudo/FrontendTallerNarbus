import { apiClient } from '../../api/apiClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from './authTypes';
import { guardarDato, eliminarDato, obtenerDato } from '../../utils/storage';
import { isTokenExpired } from '../../utils/token';

/**
 * Endpoint 1.1: Iniciar Sesión con JSON Payload
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
 * Endpoint 1.2: Iniciar Sesión con OAuth2 / Form Data (application/x-www-form-urlencoded)
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
 * Endpoint 1.3: Registro Público de Usuario
 * Endpoint: POST /api/v1/auth/register
 */
export async function registerPublic(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', payload);
  if (response.data.access_token) {
    await guardarDato('access_token', response.data.access_token);
    await guardarDato('user_data', JSON.stringify(response.data.user));
    await guardarDato('sesion_activa', 'true');
  }
  return response.data;
}

/**
 * Endpoint 1.6: Crear Usuario desde Administración (Solo SUPERVISOR o ADMIN)
 * Endpoint: POST /api/v1/auth/usuarios
 */
export async function crearUsuario(payload: RegisterPayload): Promise<User> {
  const response = await apiClient.post<User>('/api/v1/auth/usuarios', payload);
  return response.data;
}

// Alias para compatibilidad
export async function registerUser(payload: RegisterPayload): Promise<User> {
  return crearUsuario(payload);
}

/**
 * Endpoint 1.5: Listar Usuarios (Solo SUPERVISOR o ADMIN)
 * Endpoint: GET /api/v1/auth/usuarios?skip=0&limit=100
 */
export async function obtenerUsuarios(skip = 0, limit = 100): Promise<User[]> {
  const response = await apiClient.get<User[]>('/api/v1/auth/usuarios', {
    params: { skip, limit }
  });
  return response.data;
}

/**
 * Endpoint 1.7: Deshabilitar Usuario (Soft Delete - Solo SUPERVISOR o ADMIN)
 * Endpoint: DELETE /api/v1/auth/usuarios/{usuario_id}
 */
export async function deshabilitarUsuario(usuarioId: number): Promise<User> {
  const response = await apiClient.delete<User>(`/api/v1/auth/usuarios/${usuarioId}`);
  return response.data;
}

/**
 * Endpoint 1.4: Obtener Perfil del Usuario Actual Logueado (/me)
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
 * Obtener usuario almacenado localmente
 */
export async function getStoredUser(): Promise<User | null> {
  const userData = await obtenerDato('user_data');
  if (!userData) return null;
  try {
    return JSON.parse(userData) as User;
  } catch (e) {
    console.error("Error parseando user_data:", e);
    return null;
  }
}

export interface VerificacionSesionResult {
  activa: boolean;
  user: User | null;
  motivo?: 'sin_token' | 'token_expirado' | 'token_invalido' | 'servidor_desconectado';
  mensajeError?: string;
}

/**
 * Valida de forma completa el estado de la sesión:
 * 1. Verifica la existencia de un token en el almacenamiento.
 * 2. Comprueba si el token ha expirado localmente según el payload JWT (`exp`).
 * 3. Si el token está en fecha, realiza una petición de confirmación a `GET /api/v1/auth/me`.
 *    - Si responde 200 OK y el usuario está activo, actualiza datos y confirma la sesión.
 *    - Si responde 401/403, limpia la sesión y marca como expirada.
 *    - Si el backend está apagado o no responde, rechaza el acceso para evitar pantallas rotas sin permisos.
 */
export async function verificarSesion(): Promise<VerificacionSesionResult> {
  const token = await obtenerDato('access_token');
  if (!token) {
    await logout();
    return { activa: false, user: null, motivo: 'sin_token' };
  }

  // 1. Verificación local inmediata según claim exp del JWT
  if (isTokenExpired(token)) {
    console.warn('[Auth] El token JWT ha expirado localmente según el campo exp.');
    await logout();
    return {
      activa: false,
      user: null,
      motivo: 'token_expirado',
      mensajeError: 'Tu sesión ha expirado por límite de tiempo. Por favor ingresa nuevamente.'
    };
  }

  // 2. Verificación activa contra el Backend
  try {
    const user = await getMe();
    if (user && user.is_active !== false) {
      await guardarDato('sesion_activa', 'true');
      return { activa: true, user };
    } else {
      await logout();
      return {
        activa: false,
        user: null,
        motivo: 'token_invalido',
        mensajeError: 'Usuario inactivo o credenciales no válidas.'
      };
    }
  } catch (err: unknown) {
    console.error('[Auth] Error al verificar sesión contra el servidor:', err);
    const errorObj = err as { isAxiosError?: boolean; response?: { status?: number } };
    const status = errorObj?.response?.status;

    if (status === 401 || status === 403) {
      await logout();
      return {
        activa: false,
        user: null,
        motivo: 'token_expirado',
        mensajeError: 'Tu sesión ha expirado en el servidor. Por favor inicia sesión nuevamente.'
      };
    }

    // Servidor inalcanzable (backend apagado, error de red)
    await logout();
    return {
      activa: false,
      user: null,
      motivo: 'servidor_desconectado',
      mensajeError: 'No fue posible conectar con el servidor de taller. Verifica tu conexión o que el backend esté en ejecución.'
    };
  }
}


export interface MecanicoItem {
  id: number;
  nombre_completo: string;
}

/**
 * Endpoint: GET /api/v1/auth/mecanicos/buscar?q=s
 * Busca mecánicos por letra/nombre y retorna sólo id y nombre_completo
 */
export async function buscarMecanicos(query: string = '', excludeId?: number): Promise<MecanicoItem[]> {
  const response = await apiClient.get<MecanicoItem[]>('/api/v1/auth/mecanicos/buscar', {
    params: { q: query, ...(excludeId ? { exclude_id: excludeId } : {}) }
  });
  return response.data;
}


