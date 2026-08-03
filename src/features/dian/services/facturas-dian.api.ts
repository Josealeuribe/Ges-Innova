import {
  apiRequest,
  API_URL,
  getAccessToken,
} from '@/features/config/services/http-client'

export type EstadoDocumentoDian =
  | 'PENDIENTE'
  | 'ENVIANDO'
  | 'EN_PROCESO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'ERROR_TECNICO'

export interface ItemFacturaPayload {
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento?: number
  codigoImpuesto1?: string
  valorImpuesto1?: number
  codigoImpuesto2?: string
  valorImpuesto2?: number
  codigoImpuesto3?: string
  valorImpuesto3?: number
}

export interface FacturaElectronicaItemApi {
  idFacturaElectronicaItem: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  codigoImpuesto1: string
  valorImpuesto1: number
  codigoImpuesto2: string | null
  valorImpuesto2: number
  codigoImpuesto3: string | null
  valorImpuesto3: number
  total: number
}

export interface FacturaElectronicaApi {
  idFacturaElectronica: number
  idRazonSocial: number
  idClienteDian: number
  idUsuario: number
  idResolucionDian: number
  prefijo: string
  consecutivo: number
  fechaEmision: string
  cufe: string
  qrcodeData: string | null
  xmlContent: string
  nombreArchivoXml: string
  estadoDian: EstadoDocumentoDian
  trackId: string | null
  mensajeError: string | null
  subtotal: number
  iva: number
  incConsumo: number
  ica: number
  total: number
  items: FacturaElectronicaItemApi[]
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CrearFacturaElectronicaPayload {
  idRazonSocial: number
  idClienteDian: number
  entorno: string
  items: ItemFacturaPayload[]
}

export interface ListarFacturasElectronicasResponse {
  facturas: FacturaElectronicaApi[]
  total: number
}

export interface ResumenDianApi {
  porEstado: { estadoDian: EstadoDocumentoDian; cantidad: number }[]
  totalFacturado: number
  facturasDelMes: number
  ultimasFacturas: FacturaElectronicaApi[]
}

export const facturasDianApi = {
  listar(
    params: {
      idRazonSocial?: number
      estadoDian?: EstadoDocumentoDian
      page?: number
      limit?: number
    } = {},
  ): Promise<ListarFacturasElectronicasResponse> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 50),
    })

    if (params.idRazonSocial !== undefined) {
      query.set('idRazonSocial', String(params.idRazonSocial))
    }

    if (params.estadoDian) {
      query.set('estadoDian', params.estadoDian)
    }

    return apiRequest<ListarFacturasElectronicasResponse>(
      `/dian/facturas?${query.toString()}`,
    )
  },

  crear(
    payload: CrearFacturaElectronicaPayload,
  ): Promise<FacturaElectronicaApi> {
    return apiRequest<FacturaElectronicaApi>('/dian/facturas', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  obtener(idFacturaElectronica: number): Promise<FacturaElectronicaApi> {
    return apiRequest<FacturaElectronicaApi>(
      `/dian/facturas/${idFacturaElectronica}`,
    )
  },

  resumen(idRazonSocial?: number): Promise<ResumenDianApi> {
    const query =
      idRazonSocial !== undefined ? `?idRazonSocial=${idRazonSocial}` : ''

    return apiRequest<ResumenDianApi>(`/dian/resumen${query}`)
  },

  async descargarXml(
    idFacturaElectronica: number,
    nombreArchivo: string,
  ): Promise<void> {
    const token = getAccessToken()

    const response = await fetch(
      `${API_URL}/dian/facturas/${idFacturaElectronica}/xml`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )

    if (!response.ok) {
      throw new Error('No se pudo descargar el XML de la factura.')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}
