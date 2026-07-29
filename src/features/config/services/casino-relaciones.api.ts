import { apiRequest } from './http-client';


export interface Ciudad {
  idCiudad: number;
  nombreCiudad: string;
}

export interface CentroCosto {
  idCentroCosto: number;
  codigoCentroCosto: string;
  nombreCentroCosto: string;
}

export interface RazonSocial {
  idRazonSocial: number;
  nit: string;
  nombreRazonSocial: string;
}

interface ListEnvelope<T> {
  data?: T[];
  items?: T[];
  meta?: {
    page?: number;
    totalPages?: number;
  };
}

interface NormalizedPage<T> {
  data: T[];
  page: number;
  totalPages: number;
}

function normalizePage<T>(
  response: T[] | ListEnvelope<T>,
): NormalizedPage<T> {
  if (Array.isArray(response)) {
    return {
      data: response,
      page: 1,
      totalPages: 1,
    };
  }

  const fallbackArray = Object.values(
    response,
  ).find(Array.isArray) as T[] | undefined;

  const data =
    response.data ??
    response.items ??
    fallbackArray ??
    [];

  return {
    data,
    page: response.meta?.page ?? 1,
    totalPages:
      response.meta?.totalPages ?? 1,
  };
}

async function listarTodosActivos<T>(
  endpoint: string,
): Promise<T[]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const result: T[] = [];

  do {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      estado: 'ACTIVO',
    });

    const response = await apiRequest<
      T[] | ListEnvelope<T>
    >(`${endpoint}?${params.toString()}`);

    const normalized =
      normalizePage(response);

    result.push(...normalized.data);
    totalPages = normalized.totalPages;
    page += 1;
  } while (page <= totalPages);

  return result;
}

export function listarCiudadesActivas(): Promise<
  Ciudad[]
> {
  return listarTodosActivos<Ciudad>(
    '/ciudades',
  );
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
