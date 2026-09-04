import { apiClient } from '../../api/apiClient';

export interface ReporteNeumaticoPayload {
  usuario_id?: number | null;
  maquina: string;
  tipo_bus: string;
  ruedas: string; // ej: "Rueda 1, Rueda 2"
  motivo: string;
  precio?: string | null;
  marca_fuego?: string | null;
  evidencia?: File | null;
}

export interface ReporteNeumaticoResponse {
  status: string;
  message: string;
  reporte_id?: number;
  bus_id?: number;
  resumen?: string;
  datos_recibidos?: {
    usuario_id?: number;
    maquina?: string;
    bus_id?: number;
    tipo_bus?: string;
    ruedas?: string[] | string;
    motivo?: string;
    precio?: string;
    marca_fuego?: string;
    evidencia_original?: string;
    evidencia_url?: string;
  };
}

/**
 * Envía el formulario operativo de neumático al backend (POST /api/v1/formularioNeumatico).
 * Encapsula la construcción de FormData y cabeceras multipart.
 */
export async function enviarReporteNeumatico(
  payload: ReporteNeumaticoPayload
): Promise<ReporteNeumaticoResponse> {
  const formData = new FormData();

  if (payload.usuario_id) {
    formData.append('usuario_id', String(payload.usuario_id));
  }
  formData.append('maquina', payload.maquina.trim());
  formData.append('tipo_bus', payload.tipo_bus);
  formData.append('ruedas', payload.ruedas);
  formData.append('motivo', payload.motivo.trim());

  if (payload.precio && payload.precio.trim()) {
    formData.append('precio', payload.precio.trim());
  }

  if (payload.marca_fuego && payload.marca_fuego.trim()) {
    formData.append('marca_fuego', payload.marca_fuego.trim());
  }

  if (payload.evidencia) {
    formData.append('evidencia', payload.evidencia);
  }

  const response = await apiClient.post<ReporteNeumaticoResponse>(
    '/api/v1/formularioNeumatico',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}
