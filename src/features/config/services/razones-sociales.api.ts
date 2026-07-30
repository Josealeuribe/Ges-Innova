export type EstadoRegistro = 'ACTIVO' | 'INACTIVO'

export interface RazonSocialApi {
  idRazonSocial: number
  nit: string
  nombreRazonSocial: string
  telefono: string
  direccion: string
  codigoPostal: string | null
  correo: string

  idPais: number
  idDepartamento: number
  idCiudad: number
  idTipoPersona: number
  idAmbienteDian: number
  idRegimen: number

  responsabilidadFiscal: string
  codigoHelisa: string | null
  estado: EstadoRegistro

  contratoColjuegos?: string | null
  fechaInicioContrato?: string | null
  fechaFinContrato?: string | null

  softwareId?: string | null
  softwarePin?: string | null
  testSetId?: string | null
  claveTecnica?: string | null

  numeroResolucion?: string | null
  prefijoResolucion?: string | null
  rangoInicio?: string | null
  rangoFin?: string | null
  fechaInicioResolucion?: string | null
  fechaFinResolucion?: string | null
}

export interface CrearRazonSocialPayload {
  nit: string
  nombreRazonSocial: string
  telefono: string
  direccion: string
  codigoPostal?: string | null
  correo: string

  idPais: number
  idDepartamento: number
  idCiudad: number
  idTipoPersona: number
  idAmbienteDian: number
  idRegimen: number

  responsabilidadFiscal: string
  codigoHelisa?: string | null
  estado?: EstadoRegistro

  contratoColjuegos?: string | null
  fechaInicioContrato?: string | null
  fechaFinContrato?: string | null

  softwareId?: string | null
  softwarePin?: string | null
  testSetId?: string | null
  claveTecnica?: string | null

  numeroResolucion?: string | null
  prefijoResolucion?: string | null
  rangoInicio?: string | null
  rangoFin?: string | null
  fechaInicioResolucion?: string | null
  fechaFinResolucion?: string | null
}

export interface RazonesSocialesListResponse {
  data: RazonSocialApi[]
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
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token')

  if (directToken) return directToken

  const authRaw =
    localStorage.getItem('auth') ||
    sessionStorage.getItem('auth')

  if (!authRaw) return null

  try {
    const auth = JSON.parse(authRaw) as {
      accessToken?: string
      token?: string
    }

    return auth.accessToken || auth.token || null
  } catch {
    return null
  }
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

  const response = await fetch(
    `${API_URL}${path}`,
    {
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
    },
  )

  const contentType =
    response.headers.get('content-type')

  const body = contentType?.includes(
    'application/json',
  )
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const defaultMessage =
      response.status === 401
        ? 'Tu sesión no es válida o expiró.'
        : `Error ${response.status} al consultar el servidor.`

    throw new Error(
      getBackendMessage(body, defaultMessage),
    )
  }

  return body as T
}

function unwrapRazonSocial(
  response:
    | RazonSocialApi
    | {
        data: RazonSocialApi
      },
): RazonSocialApi {
  return 'data' in response
    ? response.data
    : response
}

export const razonesSocialesApi = {
  listar(): Promise<RazonesSocialesListResponse> {
    return request<RazonesSocialesListResponse>(
      '/razones-sociales?page=1&limit=100',
    )
  },

  crear(
    payload: CrearRazonSocialPayload,
  ): Promise<RazonSocialApi> {
    return request<RazonSocialApi>(
      '/razones-sociales',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },

  actualizar(
    idRazonSocial: number,
    payload: Partial<CrearRazonSocialPayload>,
  ): Promise<RazonSocialApi> {
    return request<RazonSocialApi>(
      `/razones-sociales/${idRazonSocial}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    )
  },

  async inactivar(
    idRazonSocial: number,
  ): Promise<RazonSocialApi> {
    const response = await request<
      | RazonSocialApi
      | {
          data: RazonSocialApi
        }
    >(`/razones-sociales/${idRazonSocial}`, {
      method: 'DELETE',
    })

    return unwrapRazonSocial(response)
  },
}
