import { apiRequest } from '@/features/config/services/http-client'
import type {
  NaturalezaContable,
  TipoDocumentoRecibido,
} from './documentos-recibidos.api'

export interface ReglaPucApi {
  idReglaMapeoPuc: number
  idRazonSocial: number
  nombre: string
  concepto: string
  nitEmisor: string | null
  nombreEmisor: string | null
  tipoDocumento: TipoDocumentoRecibido | null
  cuentaPuc: string
  nombreCuentaPuc: string | null
  centroCostos: string | null
  naturaleza: NaturalezaContable
  prioridad: number
  activa: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CrearReglaPucPayload {
  idRazonSocial: number
  nombre: string
  concepto: string
  nitEmisor?: string
  nombreEmisor?: string
  tipoDocumento?: TipoDocumentoRecibido
  cuentaPuc: string
  nombreCuentaPuc?: string
  centroCostos?: string
  naturaleza: NaturalezaContable
  prioridad?: number
}

export type ActualizarReglaPucPayload = Partial<
  Omit<CrearReglaPucPayload, 'idRazonSocial'>
> & { activa?: boolean }

export interface ListarReglasPucResponse {
  reglas: ReglaPucApi[]
  total: number
}

export const reglasPucApi = {
  listar(
    params: {
      idRazonSocial?: number
      buscar?: string
      activa?: boolean
      page?: number
      limit?: number
    } = {},
  ): Promise<ListarReglasPucResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 100),
    })

    if (params.idRazonSocial !== undefined) {
      query.set('idRazonSocial', String(params.idRazonSocial))
    }
    if (params.buscar?.trim()) query.set('buscar', params.buscar.trim())
    if (params.activa !== undefined) query.set('activa', String(params.activa))

    return apiRequest<ListarReglasPucResponse>(
      `/recepcion/reglas-puc?${query.toString()}`,
    )
  },

  crear(payload: CrearReglaPucPayload): Promise<ReglaPucApi> {
    return apiRequest<ReglaPucApi>('/recepcion/reglas-puc', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  actualizar(
    idReglaMapeoPuc: number,
    payload: ActualizarReglaPucPayload,
  ): Promise<ReglaPucApi> {
    return apiRequest<ReglaPucApi>(`/recepcion/reglas-puc/${idReglaMapeoPuc}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  eliminar(idReglaMapeoPuc: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      `/recepcion/reglas-puc/${idReglaMapeoPuc}`,
      { method: 'DELETE' },
    )
  },
}
