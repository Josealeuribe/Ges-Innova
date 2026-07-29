import { apiRequest } from './http-client';

export type EstadoRegistro =
  | 'ACTIVO'
  | 'INACTIVO';

export interface Casino {
  idCasino: number;
  nombreCasino: string;
  codigoDane: string;
  codigoEstablecimiento: string;
  telefono: string;
  direccion: string;
  estado: EstadoRegistro;

  ciudad: {
    idCiudad: number;
    nombreCiudad: string;
  };

  centroCosto: {
    idCentroCosto: number;
    codigoCentroCosto: string;
    nombreCentroCosto: string;
  };

  razonSocial: {
    idRazonSocial: number;
    nit: string;
    nombreRazonSocial: string;
  };

  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CasinoPayload {
  nombreCasino: string;
  codigoDane: string;
  codigoEstablecimiento: string;
  telefono: string;
  direccion: string;
  idCiudad: number;
  idCentroCosto: number;
  idRazonSocial: number;
  estado?: EstadoRegistro;
}

export type ActualizarCasinoPayload =
  Partial<CasinoPayload>;

interface BackendCasinoListResponse {
  data: Casino[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CasinosListResponse {
  casinos: Casino[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EliminarCasinoResponse {
  message: string;
  casino: Casino;
}

export async function listar(
  page = 1,
  limit = 20,
  buscar?: string,
  estado?: EstadoRegistro,
  idCiudad?: number,
  idCentroCosto?: number,
  idRazonSocial?: number,
): Promise<CasinosListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (buscar?.trim()) {
    params.set('buscar', buscar.trim());
  }

  if (estado) {
    params.set('estado', estado);
  }

  if (idCiudad !== undefined) {
    params.set(
      'idCiudad',
      String(idCiudad),
    );
  }

  if (idCentroCosto !== undefined) {
    params.set(
      'idCentroCosto',
      String(idCentroCosto),
    );
  }

  if (idRazonSocial !== undefined) {
    params.set(
      'idRazonSocial',
      String(idRazonSocial),
    );
  }

  const response =
    await apiRequest<BackendCasinoListResponse>(
      `/casinos?${params.toString()}`,
    );

  return {
    casinos: response.data,
    page: response.meta.page,
    limit: response.meta.limit,
    total: response.meta.total,
    totalPages: response.meta.totalPages,
  };
}

export function obtener(
  idCasino: number,
): Promise<Casino> {
  return apiRequest<Casino>(
    `/casinos/${idCasino}`,
  );
}

export function crear(
  payload: CasinoPayload,
): Promise<Casino> {
  return apiRequest<Casino>('/casinos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizar(
  idCasino: number,
  payload: ActualizarCasinoPayload,
): Promise<Casino> {
  return apiRequest<Casino>(
    `/casinos/${idCasino}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function eliminar(
  idCasino: number,
): Promise<EliminarCasinoResponse> {
  return apiRequest<EliminarCasinoResponse>(
    `/casinos/${idCasino}`,
    {
      method: 'DELETE',
    },
  );
}
