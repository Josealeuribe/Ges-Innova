export type EstadoRol = 'ACTIVO' | 'INACTIVO'

export interface RolApi {
  idRol: number
  nombreRol: string
  descripcion: string | null
  estado: EstadoRol
  totalUsuarios: number
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CrearRolPayload {
  nombreRol: string
  descripcion?: string | null
  estado?: EstadoRol
}

export interface ListarRolesParams {
  page?: number
  limit?: number
  buscar?: string
  estado?: EstadoRol
}

export interface RolesListResponse {
  data: RolApi[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '')

function getToken(): string | null {
  const directToken =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('authToken')

  if (directToken) return directToken

  for (const key of ['auth', 'session', 'user']) {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as { accessToken?: string; token?: string }
      if (parsed.accessToken) return parsed.accessToken
      if (parsed.token) return parsed.token
    } catch {
      // Se ignoran valores que no sean JSON.
    }
  }

  return null
}

function getBackendMessage(body: unknown, fallback: string): string {
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
    const fallback =
      response.status === 401
        ? 'Tu sesión no es válida o expiró.'
        : `Error ${response.status} al consultar el servidor.`

    throw new Error(getBackendMessage(body, fallback))
  }

  return body as T
}

function unwrapRol(response: RolApi | { data: RolApi }): RolApi {
  return 'data' in response ? response.data : response
}

export const rolesApi = {
  listar(params: ListarRolesParams = {}): Promise<RolesListResponse> {
    const query = new URLSearchParams()
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    if (params.buscar?.trim()) query.set('buscar', params.buscar.trim())
    if (params.estado) query.set('estado', params.estado)

    return request<RolesListResponse>(`/roles?${query.toString()}`)
  },

  obtener(idRol: number): Promise<RolApi> {
    return request<RolApi>(`/roles/${idRol}`)
  },

  crear(payload: CrearRolPayload): Promise<RolApi> {
    return request<RolApi>('/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  actualizar(
    idRol: number,
    payload: Partial<CrearRolPayload>,
  ): Promise<RolApi> {
    return request<RolApi>(`/roles/${idRol}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async inactivar(idRol: number): Promise<RolApi> {
    const response = await request<RolApi | { data: RolApi }>(
      `/roles/${idRol}`,
      { method: 'DELETE' },
    )

    return unwrapRol(response)
  },
}
