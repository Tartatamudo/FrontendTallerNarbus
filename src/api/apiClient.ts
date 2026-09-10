import axios from 'axios';
import { obtenerDato, eliminarDato } from '../utils/storage';

// Determinar la URL base de la API del Backend FastAPI
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    try {
      const url = new URL(envUrl);
      return url.origin;
    } catch {
      return 'http://127.0.0.1:8000';
    }
  }
  return 'http://127.0.0.1:8000';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token Bearer en cada petición HTTP
apiClient.interceptors.request.use(
  async (config) => {
    const token = await obtenerDato('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para detectar expiración de sesión (401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Evitar interceptar el login para permitir mostrar mensaje de credenciales incorrectas en el formulario
      const isLoginRequest = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isLoginRequest) {
        console.warn('[apiClient] Sesión expirada o token revocado (401). Limpiando credenciales locales...');
        await eliminarDato('access_token');
        await eliminarDato('user_data');
        await eliminarDato('sesion_activa');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('narbus:auth-unauthorized', {
              detail: {
                message: 'Tu sesión ha expirado en el servidor. Por favor, inicia sesión nuevamente.'
              }
            })
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

