const API_URL = (
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api'
).replace(/\/$/, '');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('accessToken');

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

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

export interface ListaCasinosResponse {
  casinos: Casino[];
  total: number;
}

export interface EliminarCasinoResponse {
  message: string;
  casino: Casino;
}

interface ListaConMetaResponse {
  data: Casino[];
  meta?: {
    total?: number;
  };
}

function normalizeListResponse(
  response:
    | ListaCasinosResponse
    | ListaConMetaResponse
    | Casino[],
): ListaCasinosResponse {
  if (Array.isArray(response)) {
    return {
      casinos: response,
      total: response.length,
    };
  }

  if (
    'casinos' in response &&
    Array.isArray(response.casinos)
  ) {
    return {
      casinos: response.casinos,
      total:
        typeof response.total === 'number'
          ? response.total
          : response.casinos.length,
    };
  }

  return {
    casinos: response.data,
    total:
      response.meta?.total ??
      response.data.length,
  };
}

export async function listar(
  page = 1,
  limit = 20,
  buscar?: string,
  estado?: EstadoRegistro,
  idCiudad?: number,
  idCentroCosto?: number,
  idRazonSocial?: number,
): Promise<ListaCasinosResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (buscar?.trim()) {
    params.append(
      'buscar',
      buscar.trim(),
    );
  }

  if (estado) {
    params.append('estado', estado);
  }

  if (idCiudad) {
    params.append(
      'idCiudad',
      idCiudad.toString(),
    );
  }

  if (idCentroCosto) {
    params.append(
      'idCentroCosto',
      idCentroCosto.toString(),
    );
  }

  if (idRazonSocial) {
    params.append(
      'idRazonSocial',
      idRazonSocial.toString(),
    );
  }

  const response = await fetch(
    `${API_URL}/casinos?${params.toString()}`,
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
        'Error al listar casinos.',
      ),
    );
  }

  const body = (await response.json()) as
    | ListaCasinosResponse
    | ListaConMetaResponse
    | Casino[];

  return normalizeListResponse(body);
}

export async function crear(
  data: CasinoPayload,
): Promise<Casino> {
  const response = await fetch(
    `${API_URL}/casinos`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
        Accept: 'application/json',
        ...getAuthHeader(),
      },

      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'Error al crear el casino.',
      ),
    );
  }

  return (await response.json()) as Casino;
}

export async function actualizar(
  idCasino: number,
  data: Partial<CasinoPayload>,
): Promise<Casino> {
  const response = await fetch(
    `${API_URL}/casinos/${idCasino}`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type':
          'application/json',
        Accept: 'application/json',
        ...getAuthHeader(),
      },

      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'Error al actualizar el casino.',
      ),
    );
  }

  return (await response.json()) as Casino;
}

export async function eliminar(
  idCasino: number,
): Promise<EliminarCasinoResponse> {
  const response = await fetch(
    `${API_URL}/casinos/${idCasino}`,
    {
      method: 'DELETE',

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
        'Error al desactivar el casino.',
      ),
    );
  }

  const body = (await response.json()) as
    | EliminarCasinoResponse
    | Casino;

  if (
    typeof body === 'object' &&
    body !== null &&
    'casino' in body
  ) {
    return body;
  }

  return {
    message:
      'Casino desactivado correctamente.',
    casino: body,
  };
}