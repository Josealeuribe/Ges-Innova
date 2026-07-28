export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface AuthRole {
  idRol: number;
  nombreRol: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  estado?: string;
  rol: AuthRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType?: 'Bearer';
  expiresIn?: number;
  usuario: AuthUser;
}

export interface ApiValidationError {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}