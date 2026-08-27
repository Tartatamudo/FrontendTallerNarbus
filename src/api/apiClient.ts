import axios from 'axios';
import { obtenerDato } from '../utils/storage';

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
