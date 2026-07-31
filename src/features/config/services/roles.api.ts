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

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type RolesListResponse =
  PaginatedResponse<RolApi>

export interface AccionMatriz {
  idAccion: number
  codigo: string
  nombre: string
}

export interface PermisoMatriz {
  idPermiso: number
  idAccion: number
  codigoAccion: string
  permitido: boolean
}

export interface ModuloMatriz {
  idModulo: number
  codigo: string
  nombre: string
  descripcion: string | null
  orden: number
  permisos: PermisoMatriz[]
}

export interface MatrizPermisos {
  acciones: AccionMatriz[]
  modulos: ModuloMatriz[]
}

export interface MatrizPermisosRol
  extends MatrizPermisos {
  rol: {
    idRol: number
    nombreRol: string
    estado: EstadoRol
  }
}

export interface GuardarPermisoPayload {
  idPermiso: number
  permitido: boolean
}

interface ModuloCatalogoApi {
  idModulo: number
  codigo: string
  nombre: string
  descripcion: string | null
  orden: number
  estado: EstadoRol
}

interface AccionCatalogoApi {
  idAccion: number
  codigo: string
  nombre: string
  estado: EstadoRol
}

interface PermisoCatalogoApi {
  idPermiso: number
  idModulo: number
  idAccion: number
  estado: EstadoRol
}

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api'
).replace(/\/$/, '')

const ACTION_ORDER = [
  'VER',
  'CREAR',
  'EDITAR',
  'ELIMINAR',
  'EXPORTAR',
  'APROBAR',
  'RECHAZAR',
  'CONCILIAR',
  'CAUSAR',
  'CONFIGURAR',
  'DESCARGAR',
]

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

    if (!raw) {
      continue
    }

    try {
      const parsed = JSON.parse(raw) as {
        accessToken?: string
        token?: string
      }

      if (parsed.accessToken) {
        return parsed.accessToken
      }

      if (parsed.token) {
        return parsed.token
      }
    } catch {
      // Se ignoran valores que no sean JSON.
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

function unwrapRol(
  response:
    | RolApi
    | {
        data: RolApi
      },
): RolApi {
  return 'data' in response
    ? response.data
    : response
}

async function getAllPages<T>(
  path: string,
): Promise<T[]> {
  const separator = path.includes('?')
    ? '&'
    : '?'

  const firstPage =
    await request<PaginatedResponse<T>>(
      `${path}${separator}page=1&limit=100`,
    )

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data
  }

  const pendingPages = Array.from(
    {
      length: firstPage.meta.totalPages - 1,
    },
    (_, index) => index + 2,
  )

  const remainingPages = await Promise.all(
    pendingPages.map((page) =>
      request<PaginatedResponse<T>>(
        `${path}${separator}page=${page}&limit=100`,
      ),
    ),
  )

  return [
    ...firstPage.data,
    ...remainingPages.flatMap(
      (response) => response.data,
    ),
  ]
}

function actionPosition(code: string): number {
  const index = ACTION_ORDER.indexOf(code)

  return index === -1
    ? ACTION_ORDER.length
    : index
}

export const rolesApi = {
  listar(
    params: ListarRolesParams = {},
  ): Promise<RolesListResponse> {
    const query = new URLSearchParams()

    query.set(
      'page',
      String(params.page ?? 1),
    )
    query.set(
      'limit',
      String(params.limit ?? 20),
    )

    if (params.buscar?.trim()) {
      query.set(
        'buscar',
        params.buscar.trim(),
      )
    }

    if (params.estado) {
      query.set(
        'estado',
        params.estado,
      )
    }

    return request<RolesListResponse>(
      `/roles?${query.toString()}`,
    )
  },

  obtener(idRol: number): Promise<RolApi> {
    return request<RolApi>(
      `/roles/${idRol}`,
    )
  },

  crear(
    payload: CrearRolPayload,
  ): Promise<RolApi> {
    return request<RolApi>('/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  actualizar(
    idRol: number,
    payload: Partial<CrearRolPayload>,
  ): Promise<RolApi> {
    return request<RolApi>(
      `/roles/${idRol}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    )
  },

  async inactivar(
    idRol: number,
  ): Promise<RolApi> {
    const response = await request<
      | RolApi
      | {
          data: RolApi
        }
    >(`/roles/${idRol}`, {
      method: 'DELETE',
    })

    return unwrapRol(response)
  },

  obtenerMatrizPermisos(
    idRol: number,
  ): Promise<MatrizPermisosRol> {
    return request<MatrizPermisosRol>(
      `/roles/${idRol}/permisos`,
    )
  },

  guardarMatrizPermisos(
    idRol: number,
    permisos: GuardarPermisoPayload[],
  ): Promise<MatrizPermisosRol> {
    return request<MatrizPermisosRol>(
      `/roles/${idRol}/permisos`,
      {
        method: 'PUT',
        body: JSON.stringify({
          permisos,
        }),
      },
    )
  },

  async obtenerCatalogoPermisos(): Promise<MatrizPermisos> {
    const [
      modulosResponse,
      accionesResponse,
      permisosResponse,
    ] = await Promise.all([
      getAllPages<ModuloCatalogoApi>(
        '/modulos?estado=ACTIVO',
      ),
      getAllPages<AccionCatalogoApi>(
        '/acciones?estado=ACTIVO',
      ),
      getAllPages<PermisoCatalogoApi>(
        '/permisos?estado=ACTIVO',
      ),
    ])

    const modulos = modulosResponse
      .filter(
        (modulo) =>
          modulo.estado === 'ACTIVO',
      )
      .sort(
        (first, second) =>
          first.orden - second.orden ||
          first.nombre.localeCompare(
            second.nombre,
          ),
      )

    const acciones = accionesResponse
      .filter(
        (accion) =>
          accion.estado === 'ACTIVO',
      )
      .sort(
        (first, second) =>
          actionPosition(first.codigo) -
            actionPosition(second.codigo) ||
          first.nombre.localeCompare(
            second.nombre,
          ),
      )
      .map((accion) => ({
        idAccion: accion.idAccion,
        codigo: accion.codigo,
        nombre: accion.nombre,
      }))

    const permisoByRelation = new Map<
      string,
      PermisoCatalogoApi
    >()

    for (const permiso of permisosResponse) {
      if (permiso.estado !== 'ACTIVO') {
        continue
      }

      permisoByRelation.set(
        `${permiso.idModulo}:${permiso.idAccion}`,
        permiso,
      )
    }

    return {
      acciones,
      modulos: modulos.map((modulo) => ({
        idModulo: modulo.idModulo,
        codigo: modulo.codigo,
        nombre: modulo.nombre,
        descripcion: modulo.descripcion,
        orden: modulo.orden,
        permisos: acciones.flatMap(
          (accion) => {
            const permiso =
              permisoByRelation.get(
                `${modulo.idModulo}:${accion.idAccion}`,
              )

            if (!permiso) {
              return []
            }

            return [
              {
                idPermiso:
                  permiso.idPermiso,
                idAccion:
                  accion.idAccion,
                codigoAccion:
                  accion.codigo,
                permitido: false,
              },
            ]
          },
        ),
      })),
    }
  },
}