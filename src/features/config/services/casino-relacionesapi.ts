import {
  apiRequest,
} from './http-client';

export type EstadoRegistro =
  | 'ACTIVO'
  | 'INACTIVO';

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

interface BackendListResponse<T> {
  data: T[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function extractData<T>(
  response:
    | BackendListResponse<T>
    | T[],
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data;
}

async function listarTodosActivos<T>(
  path: string,
): Promise<T[]> {
  const response = await apiRequest<
    BackendListResponse<T> | T[]
  >(
    `${path}?page=1&limit=100&estado=ACTIVO`,
  );

  return extractData(response);
}

export function listarCentrosCostosActivos(): Promise<
  CentroCosto[]
> {
  return listarTodosActivos<CentroCosto>(
    '/centros-costos',
  );
}

export function listarRazonesSocialesActivas(): Promise<
  RazonSocial[]
> {
  return listarTodosActivos<RazonSocial>(
    '/razones-sociales',
  );
}