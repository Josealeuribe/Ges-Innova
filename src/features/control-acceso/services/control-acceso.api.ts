export type EstadoRegistro = 'ACTIVO' | 'INACTIVO'

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ModuloApi {
  idModulo: number
  codigo: string
  nombre: string
  descripcion: string | null
  ruta: string | null
  icono: string | null
  orden: number
  visibleMenu: boolean
  idModuloPadre: number | null
  estado: EstadoRegistro
  totalSubmodulos: number
  totalPermisos: number
  fechaCreacion: string
  fechaActualizacion: string
}

export interface AccionApi {
  idAccion: number
  codigo: string
  nombre: string
  descripcion: string | null
  estado: EstadoRegistro
  totalPermisos: number
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PermisoApi {
  idPermiso: number
  idModulo: number
  idAccion: number
  estado: EstadoRegistro
  modulo: { idModulo: number; codigo: string; nombre: string }
  accion: { idAccion: number; codigo: string; nombre: string }
  totalRoles: number
  fechaCreacion: string
  fechaActualizacion: string
}

export interface RolApi {
  idRol: number
  nombreRol: string
  estado: EstadoRegistro
}

export interface MatrizPermisosRol {
  rol: RolApi
  acciones: Array<{ idAccion: number; codigo: string; nombre: string }>
  modulos: Array<{
    idModulo: number
    codigo: string
    nombre: string
    descripcion: string | null
    orden: number
    permisos: Array<{
      idPermiso: number
      idAccion: number
      codigoAccion: string
      permitido: boolean
    }>
  }>
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

function getToken(): string | null {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token')
  )
}

function backendMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message?: string | string[] }).message
    if (Array.isArray(message)) return message.join(' ')
    if (typeof message === 'string') return message
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  const contentType = response.headers.get('content-type')
  const body = contentType?.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new Error(
      backendMessage(
        body,
        response.status === 401
          ? 'Tu sesión no es válida o expiró.'
          : `Error ${response.status} al consultar el servidor.`,
      ),
    )
  }
  return body as T
}

function unwrap<T>(value: T | { data: T }): T {
  return typeof value === 'object' && value !== null && 'data' in value
    ? (value as { data: T }).data
    : (value as T)
}

export const controlAccesoApi = {
  listarModulos: () => request<PaginatedResponse<ModuloApi>>('/modulos?page=1&limit=100'),
  crearModulo: (payload: Partial<ModuloApi>) => request<ModuloApi>('/modulos', { method: 'POST', body: JSON.stringify(payload) }),
  actualizarModulo: (id: number, payload: Partial<ModuloApi>) => request<ModuloApi>(`/modulos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  async inactivarModulo(id: number) {
    return unwrap(await request<ModuloApi | { data: ModuloApi }>(`/modulos/${id}`, { method: 'DELETE' }))
  },

  listarAcciones: () => request<PaginatedResponse<AccionApi>>('/acciones?page=1&limit=100'),
  crearAccion: (payload: Partial<AccionApi>) => request<AccionApi>('/acciones', { method: 'POST', body: JSON.stringify(payload) }),
  actualizarAccion: (id: number, payload: Partial<AccionApi>) => request<AccionApi>(`/acciones/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  async inactivarAccion(id: number) {
    return unwrap(await request<AccionApi | { data: AccionApi }>(`/acciones/${id}`, { method: 'DELETE' }))
  },

  listarPermisos: () => request<PaginatedResponse<PermisoApi>>('/permisos?page=1&limit=100'),
  crearPermiso: (payload: { idModulo: number; idAccion: number; estado?: EstadoRegistro }) => request<PermisoApi>('/permisos', { method: 'POST', body: JSON.stringify(payload) }),
  actualizarPermiso: (id: number, payload: Partial<{ idModulo: number; idAccion: number; estado: EstadoRegistro }>) => request<PermisoApi>(`/permisos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  async inactivarPermiso(id: number) {
    return unwrap(await request<PermisoApi | { data: PermisoApi }>(`/permisos/${id}`, { method: 'DELETE' }))
  },

  listarRoles: () => request<PaginatedResponse<RolApi>>('/roles?page=1&limit=100'),
  obtenerMatriz: (idRol: number) => request<MatrizPermisosRol>(`/roles/${idRol}/permisos`),
  guardarMatriz: (idRol: number, permisos: Array<{ idPermiso: number; permitido: boolean }>) =>
    request<MatrizPermisosRol>(`/roles/${idRol}/permisos`, {
      method: 'PUT',
      body: JSON.stringify({ permisos }),
    }),
}
