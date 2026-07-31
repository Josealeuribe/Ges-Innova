export type EstadoInventario =
  | 'DISPONIBLE'
  | 'EN_USO'
  | 'EN_MANTENIMIENTO'
  | 'DANADO'
  | 'DADO_DE_BAJA'

export type EstadoRegistro =
  | 'ACTIVO'
  | 'INACTIVO'

export interface InventarioCasino {
  idCasino: number
  nombreCasino: string
}

export interface InventarioResponsable {
  id: number
  nombre: string
  apellido: string
  correo: string
}

export interface InventarioItem {
  idInventario: number
  fotoSerial: string | null
  fotoEstado: string | null
  codigo: string
  nombre: string
  serial: string | null
  clasificacion: string
  estado: EstadoInventario
  estadoRegistro: EstadoRegistro
  cantidad: number
  valor: number
  idCasino: number
  idResponsable: number | null
  ubicacionLocal: string | null
  fechaAdquisicion: string | null
  observaciones: string | null
  casino: InventarioCasino
  responsable: InventarioResponsable | null
  fechaCreacion: string
  fechaActualizacion: string
}

export interface InventarioPayload {
  fotoSerial?: string | null
  fotoEstado?: string | null
  codigo: string
  nombre: string
  serial?: string | null
  clasificacion: string
  estado?: EstadoInventario
  estadoRegistro?: EstadoRegistro
  cantidad?: number
  valor?: number
  idCasino: number
  idResponsable?: number | null
  ubicacionLocal?: string | null
  fechaAdquisicion?: string | null
  observaciones?: string | null
}

export interface CasinoOption {
  idCasino: number
  nombreCasino: string
  codigoEstablecimiento?: string
  estado: EstadoRegistro
}

export interface UsuarioOption {
  id: number
  nombre: string
  apellido: string
  correo: string
  estado: EstadoRegistro
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api'
).replace(/\/$/, '')

function getToken(): string | null {
  const directToken =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('authToken')

  if (directToken) {
    return directToken
  }

  for (const key of ['auth', 'session', 'user']) {
    const raw =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key)

    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as {
        accessToken?: string
        token?: string
      }

      if (parsed.accessToken) return parsed.accessToken
      if (parsed.token) return parsed.token
    } catch {
      // El valor no era JSON.
    }
  }

  return null
}

function getBackendMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body
  ) {
    const message = (
      body as {
        message?: string | string[]
      }
    ).message

    if (Array.isArray(message)) {
      return message.join(' ')
    }

    if (typeof message === 'string') {
      return message
    }
  }

  return fallback
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...init.headers,
    },
  })

  const contentType =
    response.headers.get('content-type')

  const body = contentType?.includes(
    'application/json',
  )
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const fallback =
      response.status === 401
        ? 'Tu sesión no es válida o expiró.'
        : `Error ${response.status} al consultar el servidor.`

    throw new Error(
      getBackendMessage(body, fallback),
    )
  }

  return body as T
}

function unwrapData<T>(
  response: T | { data: T },
): T {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  )
    ? (response as { data: T }).data
    : (response as T)
}

function normalizeList<T>(
  response: T[] | PaginatedResponse<T>,
): T[] {
  return Array.isArray(response)
    ? response
    : response.data
}

export const inventarioApi = {
  listar(params: {
    page?: number
    limit?: number
    buscar?: string
    estado?: EstadoInventario
    estadoRegistro?: EstadoRegistro
    clasificacion?: string
    idCasino?: number
    idResponsable?: number
  } = {}): Promise<PaginatedResponse<InventarioItem>> {
    const query = new URLSearchParams()

    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 100))

    if (params.buscar?.trim()) {
      query.set('buscar', params.buscar.trim())
    }

    if (params.estado) {
      query.set('estado', params.estado)
    }

    if (params.estadoRegistro) {
      query.set(
        'estadoRegistro',
        params.estadoRegistro,
      )
    }

    if (params.clasificacion) {
      query.set(
        'clasificacion',
        params.clasificacion,
      )
    }

    if (params.idCasino) {
      query.set(
        'idCasino',
        String(params.idCasino),
      )
    }

    if (params.idResponsable) {
      query.set(
        'idResponsable',
        String(params.idResponsable),
      )
    }

    return request<
      PaginatedResponse<InventarioItem>
    >(`/inventario?${query.toString()}`)
  },

  obtener(
    idInventario: number,
  ): Promise<InventarioItem> {
    return request<InventarioItem>(
      `/inventario/${idInventario}`,
    )
  },

  crear(
    payload: InventarioPayload,
  ): Promise<InventarioItem> {
    return request<InventarioItem>(
      '/inventario',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },

  actualizar(
    idInventario: number,
    payload: Partial<InventarioPayload>,
  ): Promise<InventarioItem> {
    return request<InventarioItem>(
      `/inventario/${idInventario}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    )
  },

  async inactivar(
    idInventario: number,
  ): Promise<InventarioItem> {
    const response = await request<
      InventarioItem | { data: InventarioItem }
    >(`/inventario/${idInventario}`, {
      method: 'DELETE',
    })

    return unwrapData(response)
  },

  async listarCasinos(): Promise<CasinoOption[]> {
    const response = await request<
      CasinoOption[] |
      PaginatedResponse<CasinoOption>
    >('/casinos?page=1&limit=100&estado=ACTIVO')

    return normalizeList(response).filter(
      (casino) => casino.estado === 'ACTIVO',
    )
  },

  async listarResponsables(): Promise<UsuarioOption[]> {
    const response = await request<
      UsuarioOption[] |
      PaginatedResponse<UsuarioOption>
    >('/usuarios?page=1&limit=100&estado=ACTIVO')

    return normalizeList(response).filter(
      (usuario) => usuario.estado === 'ACTIVO',
    )
  },
}