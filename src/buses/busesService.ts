import { apiClient } from '../api/apiClient';

export interface BusSimpleDTO {
  id: number;
  n_bus: string;
  patente?: string;
  en_taller?: boolean;
}

export interface BusAutocompleteDTO {
  id: number;
  n_bus: string;
  patente?: string;
  marca?: string;
  modelo?: string;
  tipo_bus?: string;
  is_active: boolean;
  en_taller: boolean;
}

export interface BusResponseDTO {
  id: number;
  n_bus: string;
  patente?: string;
  marca?: string;
  modelo?: string;
  tipo_bus?: string;
  año?: number;
  capacidad?: number;
  chasis?: string;
  motor?: string;
  is_active: boolean;
  en_taller: boolean;
  motivo_taller?: string | null;
  fecha_ingreso_taller?: string | null;
}

export interface BusUpdateEnTallerDTO {
  en_taller: boolean;
  motivo?: string;
}

// ==================== CACHÉ EN MEMORIA ====================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let busesCatalogoCache: {
  data: BusAutocompleteDTO[];
  timestamp: number;
  soloActivos: boolean;
  soloFlotaTaller: boolean;
} | null = null;

let busesCatalogoPromise: Promise<BusAutocompleteDTO[]> | null = null;

export function invalidarCacheBuses(): void {
  busesCatalogoCache = null;
  busesCatalogoPromise = null;
}

/**
 * 4.1 Buscar buses (contrato optimizado BusSimpleDTO)
 * GET /api/v1/buses/buscar?query=...&solo_flota_taller=true
 */
export async function buscarBuses(
  query: string = '',
  soloFlotaTaller: boolean = true
): Promise<BusSimpleDTO[]> {
  const response = await apiClient.get<BusSimpleDTO[] | string[]>('/api/v1/buses/buscar', {
    params: {
      query: query.trim(),
      solo_flota_taller: soloFlotaTaller,
    },
  });

  // Manejar compatibilidad tanto con BusSimpleDTO[] como con string[] antiguo
  if (Array.isArray(response.data)) {
    return response.data.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return { id: index + 1, n_bus: String(item) };
      }
      return item as BusSimpleDTO;
    });
  }

  return [];
}

/**
 * 4.1.b Buscar números de máquina (compatibilidad con firmas anteriores)
 */
export async function buscarNumerosBuses(
  query: string = '',
  soloFlotaTaller: boolean = true
): Promise<string[]> {
  const items = await buscarBuses(query, soloFlotaTaller);
  return items.map((b) => b.n_bus);
}

/**
 * 4.2 Catálogo general de buses con caché en memoria y deduplicación en vuelo
 * GET /api/v1/buses?solo_activos=true&solo_flota_taller=true
 */
export async function obtenerBuses(
  soloActivos: boolean = true,
  soloFlotaTaller: boolean = true,
  forceRefresh: boolean = false
): Promise<BusAutocompleteDTO[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    busesCatalogoCache &&
    busesCatalogoCache.soloActivos === soloActivos &&
    busesCatalogoCache.soloFlotaTaller === soloFlotaTaller &&
    now - busesCatalogoCache.timestamp < CACHE_TTL_MS
  ) {
    return busesCatalogoCache.data;
  }

  // Deduplicación de peticiones concurrentes en vuelo (ej. React.StrictMode o montajes simultáneos)
  if (!forceRefresh && busesCatalogoPromise) {
    return busesCatalogoPromise;
  }

  busesCatalogoPromise = apiClient
    .get<BusAutocompleteDTO[]>('/api/v1/buses', {
      params: {
        solo_activos: soloActivos,
        solo_flota_taller: soloFlotaTaller,
      },
    })
    .then((response) => {
      busesCatalogoCache = {
        data: response.data,
        timestamp: Date.now(),
        soloActivos,
        soloFlotaTaller,
      };
      busesCatalogoPromise = null;
      return response.data;
    })
    .catch((err) => {
      busesCatalogoPromise = null;
      throw err;
    });

  return busesCatalogoPromise;
}

/**
 * 4.3 Ficha técnica por ID
 * GET /api/v1/buses/{bus_id}
 */
export async function obtenerBusPorId(busId: number): Promise<BusResponseDTO> {
  const response = await apiClient.get<BusResponseDTO>(`/api/v1/buses/${busId}`);
  return response.data;
}

/**
 * 4.4 Ficha técnica por número visible de bus
 * GET /api/v1/buses/numero/{n_bus}
 */
export async function obtenerBusPorNumero(nBus: string): Promise<BusResponseDTO> {
  const response = await apiClient.get<BusResponseDTO>(`/api/v1/buses/numero/${encodeURIComponent(nBus.trim())}`);
  return response.data;
}

/**
 * 4.5 Control de entrada / salida física al patio del taller
 * PATCH /api/v1/buses/{bus_id}/en-taller
 */
export async function actualizarEstadoEnTaller(
  busId: number,
  payload: BusUpdateEnTallerDTO
): Promise<BusResponseDTO> {
  const response = await apiClient.patch<BusResponseDTO>(
    `/api/v1/buses/${busId}/en-taller`,
    payload
  );
  // Invalidar caché para reflejar el cambio de patio inmediatamente
  invalidarCacheBuses();
  return response.data;
}
