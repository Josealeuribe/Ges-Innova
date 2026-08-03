import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  Download,
  FileCheck,
  Clock,
  XCircle,
  AlertOctagon,
  Send,
  UserPlus,
  CheckCircle2,
} from 'lucide-react'

import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { razonesSocialesApi, type RazonSocialApi } from '@/features/config/services/razones-sociales.api'
import { clientesDianApi, type ClienteDianApi } from './services/clientes-dian.api'
import {
  facturasDianApi,
  type EstadoDocumentoDian,
  type FacturaElectronicaApi,
  type ItemFacturaPayload,
} from './services/facturas-dian.api'

interface ItemFormRow {
  descripcion: string
  cantidad: string
  precioUnitario: string
  valorImpuesto1: string
}

const NUEVA_FILA: ItemFormRow = { descripcion: '', cantidad: '1', precioUnitario: '0', valorImpuesto1: '0' }

const ESTADO_META: Record<EstadoDocumentoDian, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDIENTE: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={11} /> },
  ENVIANDO: { label: 'Enviando', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Send size={11} /> },
  EN_PROCESO: { label: 'En Proceso', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Loader2 size={11} /> },
  ACEPTADO: { label: 'Aceptado', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <FileCheck size={11} /> },
  RECHAZADO: { label: 'Rechazado', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={11} /> },
  ERROR_TECNICO: { label: 'Error Técnico', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <AlertOctagon size={11} /> },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(n)

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function NuevaFacturaPage() {
  const [facturas, setFacturas] = useState<FacturaElectronicaApi[]>([])
  const [razonesSociales, setRazonesSociales] = useState<RazonSocialApi[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [idRazonSocial, setIdRazonSocial] = useState('')
  const [entorno, setEntorno] = useState<'1' | '2'>('2')
  const [items, setItems] = useState<ItemFormRow[]>([{ ...NUEVA_FILA }])

  const [documentoCliente, setDocumentoCliente] = useState('')
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteDianApi | null>(null)
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false)
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState('')
  const [nuevoClienteEmail, setNuevoClienteEmail] = useState('')
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState('')
  const [nuevoClienteDireccion, setNuevoClienteDireccion] = useState('')
  const [creandoCliente, setCreandoCliente] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const [facturasResp, razonesResp] = await Promise.all([
        facturasDianApi.listar(),
        razonesSocialesApi.listar(),
      ])
      setFacturas(facturasResp.facturas)
      setRazonesSociales(razonesResp.data)
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudieron cargar las facturas.'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const razonSocialPorId = useMemo(() => {
    const map = new Map<number, RazonSocialApi>()
    razonesSociales.forEach((rs) => map.set(rs.idRazonSocial, rs))
    return map
  }, [razonesSociales])

  const totales = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const cantidad = Number(item.cantidad) || 0
        const precio = Number(item.precioUnitario) || 0
        const iva = Number(item.valorImpuesto1) || 0
        const subtotalLinea = cantidad * precio

        return {
          subtotal: acc.subtotal + subtotalLinea,
          iva: acc.iva + iva,
          total: acc.total + subtotalLinea + iva,
        }
      },
      { subtotal: 0, iva: 0, total: 0 },
    )
  }, [items])

  const resetForm = () => {
    setIdRazonSocial('')
    setEntorno('2')
    setItems([{ ...NUEVA_FILA }])
    setDocumentoCliente('')
    setClienteSeleccionado(null)
    setMostrarFormCliente(false)
    setNuevoClienteNombre('')
    setNuevoClienteEmail('')
    setNuevoClienteTelefono('')
    setNuevoClienteDireccion('')
  }

  const openCreate = () => {
    resetForm()
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
  }

  const buscarCliente = async () => {
    if (!documentoCliente.trim()) return

    setBuscandoCliente(true)
    setClienteSeleccionado(null)

    try {
      const { clientes } = await clientesDianApi.listar({ buscar: documentoCliente.trim() })
      const encontrado = clientes.find((c) => c.numeroDocumento === documentoCliente.trim()) ?? clientes[0]

      if (encontrado) {
        setClienteSeleccionado(encontrado)
        setMostrarFormCliente(false)
      } else {
        setMostrarFormCliente(true)
      }
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo buscar el cliente.'), type: 'error' })
    } finally {
      setBuscandoCliente(false)
    }
  }

  const crearCliente = async () => {
    if (!nuevoClienteNombre.trim() || !documentoCliente.trim()) {
      setToast({ message: 'Nombre y número de documento son obligatorios.', type: 'error' })
      return
    }

    setCreandoCliente(true)

    try {
      const cliente = await clientesDianApi.crear({
        nombre: nuevoClienteNombre.trim(),
        numeroDocumento: documentoCliente.trim(),
        email: nuevoClienteEmail.trim() || undefined,
        telefono: nuevoClienteTelefono.trim() || undefined,
        direccion: nuevoClienteDireccion.trim() || undefined,
      })

      setClienteSeleccionado(cliente)
      setMostrarFormCliente(false)
      setToast({ message: `Cliente "${cliente.nombre}" registrado.`, type: 'success' })
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo crear el cliente.'), type: 'error' })
    } finally {
      setCreandoCliente(false)
    }
  }

  const setItemField = (index: number, field: keyof ItemFormRow, value: string) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const agregarFila = () => setItems((current) => [...current, { ...NUEVA_FILA }])
  const eliminarFila = (index: number) =>
    setItems((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current))

  const handleSubmit = async () => {
    if (!idRazonSocial) {
      setToast({ message: 'Selecciona la razón social emisora.', type: 'error' })
      return
    }

    if (!clienteSeleccionado) {
      setToast({ message: 'Busca o registra el cliente antes de continuar.', type: 'error' })
      return
    }

    const itemsPayload: ItemFacturaPayload[] = items
      .filter((item) => item.descripcion.trim() && Number(item.cantidad) > 0)
      .map((item) => ({
        descripcion: item.descripcion.trim(),
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
        valorImpuesto1: Number(item.valorImpuesto1) || 0,
      }))

    if (itemsPayload.length === 0) {
      setToast({ message: 'Agrega al menos un ítem válido.', type: 'error' })
      return
    }

    setSaving(true)

    try {
      const factura = await facturasDianApi.crear({
        idRazonSocial: Number(idRazonSocial),
        idClienteDian: clienteSeleccionado.idClienteDian,
        entorno,
        items: itemsPayload,
      })

      setFacturas((current) => [factura, ...current])
      setModalOpen(false)

      setToast({
        message: `Factura ${factura.prefijo}${factura.consecutivo} creada. CUFE: ${factura.cufe.slice(0, 20)}...`,
        type: 'success',
      })
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo crear la factura.'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const descargarXml = async (factura: FacturaElectronicaApi) => {
    try {
      await facturasDianApi.descargarXml(factura.idFacturaElectronica, factura.nombreArchivoXml)
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo descargar el XML.'), type: 'error' })
    }
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Nueva Factura Electrónica
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Fase 1: calcula CUFE y genera el XML UBL 2.1 — queda Pendiente, sin envío a la DIAN todavía.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={13} />
          Nueva Factura
        </button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando facturas...</span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Documento', 'Razón Social', 'CUFE', 'Emisión', 'Total', 'Estado', ''].map((header) => (
                  <th
                    key={header}
                    className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                    style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {facturas.map((factura) => {
                const meta = ESTADO_META[factura.estadoDian]
                return (
                  <tr key={factura.idFacturaElectronica} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>
                      {factura.prefijo}{factura.consecutivo}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>
                      {razonSocialPorId.get(factura.idRazonSocial)?.nombreRazonSocial ?? `#${factura.idRazonSocial}`}
                    </td>
                    <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>
                      {factura.cufe.slice(0, 16)}...
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>
                      {factura.fechaEmision.slice(0, 10)}
                    </td>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>
                      {fmt(factura.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => void descargarXml(factura)}
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Descargar XML"
                      >
                        <Download size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {facturas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    Todavía no se ha generado ninguna factura electrónica.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Nueva Factura Electrónica" size="lg">
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Razón Social emisora" required>
              <Select value={idRazonSocial} onChange={(e) => setIdRazonSocial(e.target.value)}>
                <option value="">Selecciona...</option>
                {razonesSociales.map((rs) => (
                  <option key={rs.idRazonSocial} value={rs.idRazonSocial}>
                    {rs.nombreRazonSocial}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Entorno" required>
              <Select value={entorno} onChange={(e) => setEntorno(e.target.value as '1' | '2')}>
                <option value="2">Habilitación (pruebas)</option>
                <option value="1">Producción</option>
              </Select>
            </Field>
          </div>

          <div className="rounded-lg p-4 space-y-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
              Cliente (adquirente)
            </p>

            {clienteSeleccionado ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                  <div>
                    <p style={{ color: 'var(--foreground)' }}>{clienteSeleccionado.nombre}</p>
                    <p className="text-[10px] font-mono-data" style={{ color: 'var(--muted-foreground)' }}>
                      {clienteSeleccionado.numeroDocumento}
                    </p>
                  </div>
                </div>
                <button
                  className="text-[10px] underline"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => {
                    setClienteSeleccionado(null)
                    setDocumentoCliente('')
                  }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Número de documento del cliente"
                    value={documentoCliente}
                    onChange={(e) => setDocumentoCliente(e.target.value)}
                  />
                  <button
                    onClick={() => void buscarCliente()}
                    disabled={buscandoCliente || !documentoCliente.trim()}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded text-xs whitespace-nowrap"
                    style={{ background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                  >
                    {buscandoCliente ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                    Buscar
                  </button>
                </div>

                {mostrarFormCliente && (
                  <div className="rounded p-3 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-1.5">
                      <UserPlus size={12} style={{ color: 'var(--gold)' }} />
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                        No se encontró el cliente — regístralo:
                      </p>
                    </div>

                    <Input
                      placeholder="Nombre completo"
                      value={nuevoClienteNombre}
                      onChange={(e) => setNuevoClienteNombre(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Correo (opcional)"
                        value={nuevoClienteEmail}
                        onChange={(e) => setNuevoClienteEmail(e.target.value)}
                      />
                      <Input
                        placeholder="Teléfono (opcional)"
                        value={nuevoClienteTelefono}
                        onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Dirección (opcional)"
                      value={nuevoClienteDireccion}
                      onChange={(e) => setNuevoClienteDireccion(e.target.value)}
                    />

                    <button
                      onClick={() => void crearCliente()}
                      disabled={creandoCliente}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold"
                      style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
                    >
                      {creandoCliente && <Loader2 size={13} className="animate-spin" />}
                      Crear cliente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
                Ítems
              </p>
              <button
                onClick={agregarFila}
                className="flex items-center gap-1.5 text-[10px]"
                style={{ color: 'var(--gold)' }}
              >
                <Plus size={12} /> Agregar ítem
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  <Input
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) => setItemField(index, 'descripcion', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Cant."
                    value={item.cantidad}
                    onChange={(e) => setItemField(index, 'cantidad', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Precio unit."
                    value={item.precioUnitario}
                    onChange={(e) => setItemField(index, 'precioUnitario', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="IVA"
                    value={item.valorImpuesto1}
                    onChange={(e) => setItemField(index, 'valorImpuesto1', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center pt-2.5">
                  <button onClick={() => eliminarFila(index)} style={{ color: 'var(--muted-foreground)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg p-4 space-y-1.5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
              <span className="font-mono-data" style={{ color: 'var(--foreground)' }}>{fmt(totales.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>IVA</span>
              <span className="font-mono-data" style={{ color: 'var(--foreground)' }}>{fmt(totales.iva)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gold)' }}>Total</span>
              <span className="font-mono-data" style={{ color: 'var(--gold)' }}>{fmt(totales.total)}</span>
            </div>
            <p className="text-[9px] pt-1" style={{ color: 'var(--muted-foreground)' }}>
              Valores de referencia — el servidor recalcula los totales definitivos antes de firmar el CUFE.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={closeModal}
            disabled={saving}
            className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            Cancelar
          </button>

          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Crear Factura
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
