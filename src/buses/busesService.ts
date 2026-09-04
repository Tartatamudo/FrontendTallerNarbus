import { apiClient } from '../api/apiClient';

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

/**
 * 4.1 Buscar números de máquina (autocompletado ágil)
 * GET /api/v1/buses/buscar?query=...&solo_flota_taller=true
 */
export async function buscarNumerosBuses(
  query: string = '',
  soloFlotaTaller: boolean = true
): Promise<string[]> {
  const response = await apiClient.get<string[]>('/api/v1/buses/buscar', {
    params: {
      query: query.trim(),
      solo_flota_taller: soloFlotaTaller,
    },
  });
  return response.data;
}

/**
 * 4.2 Catálogo general de buses
 * GET /api/v1/buses?solo_activos=true&solo_flota_taller=true
 */
export async function obtenerBuses(
  soloActivos: boolean = true,
  soloFlotaTaller: boolean = true
): Promise<BusAutocompleteDTO[]> {
  const response = await apiClient.get<BusAutocompleteDTO[]>('/api/v1/buses', {
    params: {
      solo_activos: soloActivos,
      solo_flota_taller: soloFlotaTaller,
    },
  });
  return response.data;
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
  return response.data;
}
