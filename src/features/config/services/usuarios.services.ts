export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

export interface UsuarioApi {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  cargo: string;
  fechaNacimiento: string;
  telefono: string;
  codigoHelisa: string | null;
  cuentaPuc: string | null;
  imgUrl: string | null;
  estado: EstadoUsuario;

  tipoDocumento: {
    idTipoDoc: number;
    nombreDoc: string;
  };

  genero: {
    idGenero: number;
    nombreGenero: string;
  };

  rol: {
    idRol: number;
    nombreRol: string;
  };

  ciudad: {
    idCiudad: number;
    nombreCiudad: string;
    idDepartamento: number;
    departamento: {
      idDepartamento: number;
      nombre: string;
    };
  };

  casino: {
    idCasino: number;
    nombreCasino: string;
  };

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface UsuariosMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListarUsuariosResponse {
  data: UsuarioApi[];
  meta: UsuariosMeta;
}

export interface ListarUsuariosParams {
  page?: number;
  limit?: number;
  buscar?: string;
  estado?: EstadoUsuario;
  idRol?: number;
  idGenero?: number;
  idTipoDoc?: number;
  idCiudad?: number;
  idCasino?: number;
}

export interface UsuarioCatalogos {
  roles: Array<{
    idRol: number;
    nombreRol: string;
  }>;

  generos: Array<{
    idGenero: number;
    nombreGenero: string;
  }>;

  tiposDocumento: Array<{
    idTipoDoc: number;
    nombreDoc: string;
  }>;

  departamentos: Array<{
    idDepartamento: number;
    nombre: string;
    idPais: number;
  }>;

  ciudades: Array<{
    idCiudad: number;
    nombreCiudad: string;
    idDepartamento: number;
  }>;

  casinos: Array<{
    idCasino: number;
    nombreCasino: string;
    idCiudad: number;
  }>;
}

export interface CrearUsuarioPayload {
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  contrasena: string;

  cargo: string;
  fechaNacimiento: string;
  telefono: string;

  codigoHelisa?: string | null;
  cuentaPuc?: string | null;
  imgUrl?: string | null;

  estado?: EstadoUsuario;

  idTipoDoc: number;
  idGenero: number;
  idRol: number;
  idCiudad: number;
  idCasino: number;
}

export type ActualizarUsuarioPayload =
  Partial<CrearUsuarioPayload>;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api'
).replace(/\/+$/, '');

function readTokenFromStorage(
  storage: Storage,
): string | null {
  const directKeys = [
    'accessToken',
    'access_token',
    'token',
    'authToken',
  ];

  for (const key of directKeys) {
    const value = storage.getItem(key);

    if (value && value.trim()) {
      return value.trim();
    }
  }

  const objectKeys = [
    'auth',
    'session',
    'user',
  ];

  for (const key of objectKeys) {
    const value = storage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      const parsed = JSON.parse(value) as Record<
        string,
        unknown
      >;

      const token =
        parsed.accessToken ??
        parsed.access_token ??
        parsed.token;

      if (
        typeof token === 'string' &&
        token.trim()
      ) {
        return token.trim();
      }
    } catch {
      // El valor no era JSON. Se ignora.
    }
  }

  return null;
}

function getAccessToken(): string | null {
  return (
    readTokenFromStorage(localStorage) ??
    readTokenFromStorage(sessionStorage)
  );
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get('content-type') ?? '';

  if (
    contentType.includes('application/json')
  ) {
    return response.json();
  }

  const text = await response.text();

  return text || null;
}

function extractErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    body &&
    typeof body === 'object' &&
    'message' in body
  ) {
    const message = (
      body as { message?: unknown }
    ).message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  return fallback;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json');

  if (
    init.body !== undefined &&
    !(init.body instanceof FormData)
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...init,
        headers,
      },
    );
  } catch {
    throw new ApiError(
      'No fue posible conectar con el backend.',
      0,
    );
  }

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(
        body,
        `Error HTTP ${response.status}`,
      ),
      response.status,
      body,
    );
  }

  return body as T;
}

function buildQuery(
  params: ListarUsuariosParams,
): string {
  const searchParams = new URLSearchParams();

  for (
    const [key, value] of Object.entries(params)
  ) {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export const usuariosService = {
  listarUsuarios(
    params: ListarUsuariosParams = {},
  ): Promise<ListarUsuariosResponse> {
    return request<ListarUsuariosResponse>(
      `/usuarios${buildQuery(params)}`,
    );
  },

  obtenerUsuario(
    id: number,
  ): Promise<UsuarioApi> {
    return request<UsuarioApi>(
      `/usuarios/${id}`,
    );
  },

  obtenerCatalogos(): Promise<UsuarioCatalogos> {
    return request<UsuarioCatalogos>(
      '/usuarios/catalogos',
    );
  },

  crearUsuario(
    payload: CrearUsuarioPayload,
  ): Promise<UsuarioApi> {
    return request<UsuarioApi>(
      '/usuarios',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  actualizarUsuario(
    id: number,
    payload: ActualizarUsuarioPayload,
  ): Promise<UsuarioApi> {
    return request<UsuarioApi>(
      `/usuarios/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
  },

  desactivarUsuario(
    id: number,
  ): Promise<{
    message: string;
    usuario: UsuarioApi;
  }> {
    return request<{
      message: string;
      usuario: UsuarioApi;
    }>(
      `/usuarios/${id}`,
      {
        method: 'DELETE',
      },
    );
  },
};
