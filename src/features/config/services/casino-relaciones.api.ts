import type {
  EstadoRegistro,
} from './casinos.api';

const API_URL = (
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api'
).replace(/\/$/, '');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(
    'accessToken',
  );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  );
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body =
      (await response.json()) as ApiErrorResponse;

    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }

    return (
      body.message ??
      body.error ??
      fallback
    );
  } catch {
    return fallback;
  }
}

function extractArray<T>(
  payload: unknown,
  possibleKeys: string[],
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of possibleKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  if (Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  return [];
}

async function requestList<T>(
  path: string,
  possibleKeys: string[],
): Promise<T[]> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...getAuthHeader(),
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible cargar los datos relacionados.',
      ),
    );
  }

  const payload: unknown =
    await response.json();

  return extractArray<T>(
    payload,
    possibleKeys,
  );
}

export interface Ciudad {
  idCiudad: number;
  nombreCiudad: string;
  estado: EstadoRegistro;
}

export interface CentroCosto {
  idCentroCosto: number;
  codigoCentroCosto: string;
  nombreCentroCosto: string;
  estado: EstadoRegistro;
}

export interface RazonSocial {
  idRazonSocial: number;
  nit: string;
  nombreRazonSocial: string;
  estado: EstadoRegistro;
}

export async function listarCiudadesActivas(): Promise<
  Ciudad[]
> {
  return requestList<Ciudad>(
    '/ciudades?page=1&limit=100&estado=ACTIVO',
    ['ciudades', 'items'],
  );
}

export async function listarCentrosCostosActivos(): Promise<
  CentroCosto[]
> {
  return requestList<CentroCosto>(
    '/centros-costos?page=1&limit=100&estado=ACTIVO',
    [
      'centrosCostos',
      'centros_costos',
      'items',
    ],
  );
}

export async function listarRazonesSocialesActivas(): Promise<
  RazonSocial[]
> {
  return requestList<RazonSocial>(
    '/razones-sociales?page=1&limit=100&estado=ACTIVO',
    [
      'razonesSociales',
      'razones_sociales',
      'items',
    ],
  );
}