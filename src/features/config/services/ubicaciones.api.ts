import {
  apiRequest,
} from './http-client';

export interface Pais {
  idPais: number;
  nombre: string;
}

export interface Departamento {
  idDepartamento: number;
  nombre: string;
  idPais: number;
}

export type EstadoCiudad =
  | 'ACTIVO'
  | 'INACTIVO';

export interface Ciudad {
  idCiudad: number;
  nombreCiudad: string;
  idDepartamento: number;
}

interface ListarCiudadesParams {
  idPais?: number;
  idDepartamento?: number;
  estado?: EstadoCiudad;
  buscar?: string;
}

function buildQuery(
  params: Record<
    string,
    string | number | undefined
  >,
): string {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === ''
      ) {
        return;
      }

      searchParams.set(
        key,
        String(value),
      );
    },
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : '';
}

export function listarPaises(
  buscar?: string,
): Promise<Pais[]> {
  return apiRequest<Pais[]>(
    `/paises${buildQuery({
      buscar,
    })}`,
  );
}

export function listarDepartamentos(
  idPais?: number,
  buscar?: string,
): Promise<Departamento[]> {
  return apiRequest<Departamento[]>(
    `/departamentos${buildQuery({
      idPais,
      buscar,
    })}`,
  );
}

export function listarCiudades(
  params:
    ListarCiudadesParams = {},
): Promise<Ciudad[]> {
  return apiRequest<Ciudad[]>(
    `/ciudades${buildQuery({
      idPais: params.idPais,
      idDepartamento:
        params.idDepartamento,
      estado: params.estado,
      buscar: params.buscar,
    })}`,
  );
}

export function listarCiudadesActivas(
  params: Omit<
    ListarCiudadesParams,
    'estado'
  > = {},
): Promise<Ciudad[]> {
  return listarCiudades({
    ...params,
    estado: 'ACTIVO',
  });
}