import { apiRequest } from '@/features/config/services/http-client'

export type TipoDocumentoRecibido = 'FACTURA' | 'NOTA_CREDITO' | 'NOTA_DEBITO'
export type OrigenDocumentoRecibido = 'MANUAL' | 'EXCEL_PORTAL'
export type EstadoCausacionRecibido =
  | 'PENDIENTE'
  | 'CONCILIADO'
  | 'CAUSADO'
  | 'EXPORTADO'
  | 'RECHAZADO'
  | 'ERROR_XML'
export type NaturalezaContable = 'D' | 'C'
export type EstadoMapeoPuc = 'SIN_MAPEAR' | 'MAPEADO'

export interface ItemCompraRecibidoApi {
  idItemCompraRecibido: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  codigoImpuesto1: string
  valorImpuesto1: number
  codigoImpuesto2: string | null
  valorImpuesto2: number
  codigoImpuesto3: string | null
  valorImpuesto3: number
  total: number
  cuentaPuc: string | null
  nombreCuentaPuc: string | null
  centroCostos: string | null
  nombreCentroCostos: string | null
  naturaleza: NaturalezaContable | null
  estadoMapeo: EstadoMapeoPuc
  idReglaAplicada: number | null
}

export interface DocumentoRecibidoApi {
  idDocumentoRecibido: number
  idRazonSocial: number
  idCasino: number | null
  cufe: string | null
  tipoDocumento: TipoDocumentoRecibido
  prefijo: string | null
  consecutivo: string | null
  numeroDocumentoCompleto: string
  nitEmisor: string
  nombreEmisor: string
  fechaEmision: string
  subtotal: number
  iva: number
  ica: number
  retencionFuente: number
  reteIva: number
  reteIca: number
  totalPagar: number
  xmlOriginal: string | null
  qrUrl: string | null
  origen: OrigenDocumentoRecibido
  estadoCausacion: EstadoCausacionRecibido
  pucPreliminar: string | null
  requiereRevisionConciliacion: boolean
  items: ItemCompraRecibidoApi[]
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ListarDocumentosRecibidosResponse {
  documentos: DocumentoRecibidoApi[]
  total: number
}

export interface ImportarExcelResultado {
  totalFilas: number
  creados: number
  yaExistian: number
  requierenRevision: number
}

export interface AsignarPucItemPayload {
  idReglaMapeoPuc?: number
  cuentaPuc?: string
  nombreCuentaPuc?: string
  centroCostos?: string
  nombreCentroCostos?: string
  naturaleza?: NaturalezaContable
}

export interface ResumenRecepcionApi {
  porEstado: { estadoCausacion: EstadoCausacionRecibido; cantidad: number }[]
  documentosDelMes: number
  requierenRevision: number
  ultimosDocumentos: DocumentoRecibidoApi[]
}

export const documentosRecibidosApi = {
  cargarXml(
    file: File,
    idRazonSocial: number,
    idCasino?: number,
  ): Promise<DocumentoRecibidoApi> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('idRazonSocial', String(idRazonSocial))
    if (idCasino !== undefined) formData.append('idCasino', String(idCasino))

    return apiRequest<DocumentoRecibidoApi>('/recepcion/documentos/cargar-xml', {
      method: 'POST',
      body: formData,
    })
  },

  importarExcel(
    file: File,
    idRazonSocial: number,
    idCasino?: number,
  ): Promise<ImportarExcelResultado> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('idRazonSocial', String(idRazonSocial))
    if (idCasino !== undefined) formData.append('idCasino', String(idCasino))

    return apiRequest<ImportarExcelResultado>(
      '/recepcion/documentos/importar-excel',
      {
        method: 'POST',
        body: formData,
      },
    )
  },

  listar(
    params: {
      idRazonSocial?: number
      estadoCausacion?: EstadoCausacionRecibido
      requiereRevisionConciliacion?: boolean
      buscar?: string
      page?: number
      limit?: number
    } = {},
  ): Promise<ListarDocumentosRecibidosResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 50),
    })

    if (params.idRazonSocial !== undefined) {
      query.set('idRazonSocial', String(params.idRazonSocial))
    }
    if (params.estadoCausacion) query.set('estadoCausacion', params.estadoCausacion)
    if (params.requiereRevisionConciliacion !== undefined) {
      query.set(
        'requiereRevisionConciliacion',
        String(params.requiereRevisionConciliacion),
      )
    }
    if (params.buscar?.trim()) query.set('buscar', params.buscar.trim())

    return apiRequest<ListarDocumentosRecibidosResponse>(
      `/recepcion/documentos?${query.toString()}`,
    )
  },

  obtener(idDocumentoRecibido: number): Promise<DocumentoRecibidoApi> {
    return apiRequest<DocumentoRecibidoApi>(
      `/recepcion/documentos/${idDocumentoRecibido}`,
    )
  },

  asignarPuc(
    idDocumentoRecibido: number,
    idItemCompraRecibido: number,
    payload: AsignarPucItemPayload,
  ): Promise<DocumentoRecibidoApi> {
    return apiRequest<DocumentoRecibidoApi>(
      `/recepcion/documentos/${idDocumentoRecibido}/items/${idItemCompraRecibido}/puc`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    )
  },

  causar(idDocumentoRecibido: number): Promise<DocumentoRecibidoApi> {
    return apiRequest<DocumentoRecibidoApi>(
      `/recepcion/documentos/${idDocumentoRecibido}/causar`,
      { method: 'PATCH' },
    )
  },

  eliminar(idDocumentoRecibido: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      `/recepcion/documentos/${idDocumentoRecibido}`,
      { method: 'DELETE' },
    )
  },

  resumen(idRazonSocial?: number): Promise<ResumenRecepcionApi> {
    const query = idRazonSocial !== undefined ? `?idRazonSocial=${idRazonSocial}` : ''
    return apiRequest<ResumenRecepcionApi>(`/recepcion/documentos/resumen${query}`)
  },
}
