import { apiRequest } from '@/features/config/services/http-client'

export interface ClienteDianApi {
  idClienteDian: number
  nombre: string
  tipoDocumento: string
  numeroDocumento: string
  direccion: string | null
  ciudad: string | null
  departamento: string | null
  telefono: string | null
  email: string | null
  tipoPersona: string
  responsabilidadFiscal: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CrearClienteDianPayload {
  nombre: string
  tipoDocumento?: string
  numeroDocumento: string
  direccion?: string
  ciudad?: string
  departamento?: string
  telefono?: string
  email?: string
  tipoPersona?: string
  responsabilidadFiscal?: string
}

export type ActualizarClienteDianPayload = Partial<
  Omit<CrearClienteDianPayload, 'numeroDocumento'>
>

export interface ListarClientesDianResponse {
  clientes: ClienteDianApi[]
  total: number
}

export const clientesDianApi = {
  listar(
    params: { buscar?: string; page?: number; limit?: number } = {},
  ): Promise<ListarClientesDianResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 50),
    })

    if (params.buscar?.trim()) {
      query.set('buscar', params.buscar.trim())
    }

    return apiRequest<ListarClientesDianResponse>(
      `/dian/clientes?${query.toString()}`,
    )
  },

  crear(payload: CrearClienteDianPayload): Promise<ClienteDianApi> {
    return apiRequest<ClienteDianApi>('/dian/clientes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  actualizar(
    idClienteDian: number,
    payload: ActualizarClienteDianPayload,
  ): Promise<ClienteDianApi> {
    return apiRequest<ClienteDianApi>(`/dian/clientes/${idClienteDian}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
