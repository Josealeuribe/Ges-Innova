import { apiRequest } from '@/features/config/services/http-client'

export type TipoDocumentoDian = 'FACTURA' | 'DOC_SOPORTE'

export interface ResolucionDianApi {
  idResolucionDian: number
  idRazonSocial: number
  tipoDocumento: TipoDocumentoDian
  entorno: string
  prefijo: string
  numeroResolucion: string
  rangoDesde: number
  rangoHasta: number
  consecutivoActual: number
  fechaVigenciaDesde: string
  fechaVigenciaHasta: string
  claveTecnica: string
  activa: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CrearResolucionDianPayload {
  idRazonSocial: number
  tipoDocumento: TipoDocumentoDian
  entorno: string
  prefijo: string
  numeroResolucion: string
  rangoDesde: number
  rangoHasta: number
  fechaVigenciaDesde: string
  fechaVigenciaHasta: string
  claveTecnica: string
  activa?: boolean
}

export type ActualizarResolucionDianPayload = Partial<
  Pick<
    CrearResolucionDianPayload,
    | 'prefijo'
    | 'numeroResolucion'
    | 'rangoDesde'
    | 'rangoHasta'
    | 'fechaVigenciaDesde'
    | 'fechaVigenciaHasta'
    | 'claveTecnica'
  >
>

export interface ListarResolucionesDianParams {
  idRazonSocial?: number
  tipoDocumento?: TipoDocumentoDian
  activa?: boolean
  page?: number
  limit?: number
}

export interface ListarResolucionesDianResponse {
  resoluciones: ResolucionDianApi[]
  total: number
}

export const resolucionesDianApi = {
  listar(
    params: ListarResolucionesDianParams = {},
  ): Promise<ListarResolucionesDianResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 100),
    })

    if (params.idRazonSocial !== undefined) {
      query.set('idRazonSocial', String(params.idRazonSocial))
    }

    if (params.tipoDocumento) {
      query.set('tipoDocumento', params.tipoDocumento)
    }

    if (params.activa !== undefined) {
      query.set('activa', String(params.activa))
    }

    return apiRequest<ListarResolucionesDianResponse>(
      `/dian/resoluciones?${query.toString()}`,
    )
  },

  crear(payload: CrearResolucionDianPayload): Promise<ResolucionDianApi> {
    return apiRequest<ResolucionDianApi>('/dian/resoluciones', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  actualizar(
    idResolucionDian: number,
    payload: ActualizarResolucionDianPayload,
  ): Promise<ResolucionDianApi> {
    return apiRequest<ResolucionDianApi>(
      `/dian/resoluciones/${idResolucionDian}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    )
  },

  cambiarEstado(
    idResolucionDian: number,
    activa: boolean,
  ): Promise<ResolucionDianApi> {
    return apiRequest<ResolucionDianApi>(
      `/dian/resoluciones/${idResolucionDian}/estado`,
      {
        method: 'PATCH',
        body: JSON.stringify({ activa }),
      },
    )
  },
}
