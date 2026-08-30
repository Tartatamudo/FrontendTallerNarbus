export type RolUsuario = 'ADMIN' | 'SUPERVISOR' | 'CONDUCTOR' | 'MECANICO';

export interface User {
  id: number;
  username: string;
  nombre_completo?: string;
  rut?: string;
  rol: RolUsuario | string;
  is_active: boolean;
  conductor_id?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  nombre_completo: string;
  rut: string;
  rol: RolUsuario | string;
  conductor_id?: number | null;
}

