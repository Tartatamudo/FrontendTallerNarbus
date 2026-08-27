export type RolUsuario = 'ADMIN' | 'SUPERVISOR' | 'CONDUCTOR' | 'MECANICO';

export interface User {
  id: number;
  username: string;
  rol: RolUsuario | string;
  conductor_id: number | null;
  is_active: boolean;
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
  rol: RolUsuario | string;
  conductor_id?: number | null;
}
