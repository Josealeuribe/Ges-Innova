import { useEffect, useMemo, useState } from 'react'
import {
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  Send,
} from 'lucide-react'

import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { razonesSocialesApi, type RazonSocialApi } from '@/features/config/services/razones-sociales.api'
import {
  documentosRecibidosApi,
  type DocumentoRecibidoApi,
  type EstadoCausacionRecibido,
  type NaturalezaContable,
} from './services/documentos-recibidos.api'
import { reglasPucApi, type ReglaPucApi } from './services/reglas-puc.api'

const ESTADO_META: Record<EstadoCausacionRecibido, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDIENTE: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={11} /> },
  CONCILIADO: { label: 'Conciliado', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Send size={11} /> },
  CAUSADO: { label: 'Causado', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={11} /> },
  EXPORTADO: { label: 'Exportado', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={11} /> },
  RECHAZADO: { label: 'Rechazado', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={11} /> },
  ERROR_XML: { label: 'Error XML', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <AlertOctagon size={11} /> },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function CargarXmlPage() {
  const [documentos, setDocumentos] = useState<DocumentoRecibidoApi[]>([])
  const [razonesSociales, setRazonesSociales] = useState<RazonSocialApi[]>([])
  const [reglas, setReglas] = useState<ReglaPucApi[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [modalCargarOpen, setModalCargarOpen] = useState(false)
  const [idRazonSocialCarga, setIdRazonSocialCarga] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)

  const [documentoDetalle, setDocumentoDetalle] = useState<DocumentoRecibidoApi | null>(null)
  const [asignaciones, setAsignaciones] = useState<Record<number, { idReglaMapeoPuc: string; cuentaPuc: string; naturaleza: NaturalezaContable }>>({})
  const [guardandoItem, setGuardandoItem] = useState<number | null>(null)
  const [causando, setCausando] = useState(false)

  const razonSocialPorId = useMemo(() => {
    const map = new Map<number, RazonSocialApi>()
    razonesSociales.forEach((rs) => map.set(rs.idRazonSocial, rs))
    return map
  }, [razonesSociales])

  const cargar = async () => {
    setLoading(true)
    try {
      const [documentosResp, razonesResp, reglasResp] = await Promise.all([
        documentosRecibidosApi.listar(),
        razonesSocialesApi.listar(),
        reglasPucApi.listar(),
      ])
      setDocumentos(documentosResp.documentos)
      setRazonesSociales(razonesResp.data)
      setReglas(reglasResp.reglas)
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudieron cargar los documentos recibidos.'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const handleCargarXml = async () => {
    if (!idRazonSocialCarga || !archivo) {
      setToast({ message: 'Selecciona la razón social y el archivo XML.', type: 'error' })
      return
    }

    setCargando(true)
    try {
      const documento = await documentosRecibidosApi.cargarXml(archivo, Number(idRazonSocialCarga))
      setDocumentos((current) => [documento, ...current])
      setModalCargarOpen(false)
      setArchivo(null)
      setToast({
        message: `Documento ${documento.numeroDocumentoCompleto} cargado (${fmt(documento.totalPagar)}).`,
        type: 'success',
      })
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo procesar el XML.'), type: 'error' })
    } finally {
      setCargando(false)
    }
  }

  const abrirDetalle = (documento: DocumentoRecibidoApi) => {
    setDocumentoDetalle(documento)
    const iniciales: typeof asignaciones = {}
    documento.items.forEach((item) => {
      iniciales[item.idItemCompraRecibido] = {
        idReglaMapeoPuc: '',
        cuentaPuc: item.cuentaPuc ?? '',
        naturaleza: item.naturaleza ?? 'D',
      }
    })
    setAsignaciones(iniciales)
  }

  const guardarAsignacion = async (idItemCompraRecibido: number) => {
    if (!documentoDetalle) return
    const asignacion = asignaciones[idItemCompraRecibido]

    setGuardandoItem(idItemCompraRecibido)
    try {
      const actualizado = asignacion.idReglaMapeoPuc
        ? await documentosRecibidosApi.asignarPuc(documentoDetalle.idDocumentoRecibido, idItemCompraRecibido, {
            idReglaMapeoPuc: Number(asignacion.idReglaMapeoPuc),
          })
        : await documentosRecibidosApi.asignarPuc(documentoDetalle.idDocumentoRecibido, idItemCompraRecibido, {
            cuentaPuc: asignacion.cuentaPuc,
            naturaleza: asignacion.naturaleza,
          })

      setDocumentoDetalle(actualizado)
      setDocumentos((current) =>
        current.map((doc) => (doc.idDocumentoRecibido === actualizado.idDocumentoRecibido ? actualizado : doc)),
      )
      setToast({ message: 'Cuenta PUC asignada.', type: 'success' })
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo asignar la cuenta PUC.'), type: 'error' })
    } finally {
      setGuardandoItem(null)
    }
  }

  const marcarCausado = async () => {
    if (!documentoDetalle) return
    setCausando(true)
    try {
      const actualizado = await documentosRecibidosApi.causar(documentoDetalle.idDocumentoRecibido)
      setDocumentoDetalle(actualizado)
      setDocumentos((current) =>
        current.map((doc) => (doc.idDocumentoRecibido === actualizado.idDocumentoRecibido ? actualizado : doc)),
      )
      setToast({ message: 'Documento causado exitosamente.', type: 'success' })
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo causar el documento.'), type: 'error' })
    } finally {
      setCausando(false)
    }
  }

  const reglasDeLaRazonSocial = documentoDetalle
    ? reglas.filter((r) => r.idRazonSocial === documentoDetalle.idRazonSocial && r.activa)
    : []

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Cargar XML
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Sube el XML UBL de una factura, nota crédito o nota débito recibida de un proveedor.
          </p>
        </div>

        <button
          onClick={() => setModalCargarOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
        >
          <Upload size={13} /> Cargar XML
        </button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando documentos...</span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Documento', 'Emisor', 'Razón Social', 'Fecha', 'Total', 'Origen', 'Estado', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                    style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => {
                const meta = ESTADO_META[doc.estadoCausacion]
                return (
                  <tr
                    key={doc.idDocumentoRecibido}
                    className="cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onClick={() => abrirDetalle(doc)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>
                      {doc.numeroDocumentoCompleto}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{doc.nombreEmisor}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>
                      {razonSocialPorId.get(doc.idRazonSocial)?.nombreRazonSocial ?? `#${doc.idRazonSocial}`}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{doc.fechaEmision.slice(0, 10)}</td>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>
                      {fmt(doc.totalPagar)}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>
                      {doc.origen === 'MANUAL' ? 'XML manual' : 'Excel portal'}
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
                      {doc.requiereRevisionConciliacion && (
                        <span className="text-[10px]" style={{ color: '#f59e0b' }}>Revisar</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {documentos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    <FileText size={20} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
                    Todavía no se ha cargado ningún documento recibido.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalCargarOpen} onClose={() => (cargando ? null : setModalCargarOpen(false))} title="Cargar XML de documento recibido">
        <div className="space-y-4">
          <Field label="Razón Social" required>
            <Select value={idRazonSocialCarga} onChange={(e) => setIdRazonSocialCarga(e.target.value)}>
              <option value="">Selecciona...</option>
              {razonesSociales.map((rs) => (
                <option key={rs.idRazonSocial} value={rs.idRazonSocial}>{rs.nombreRazonSocial}</option>
              ))}
            </Select>
          </Field>

          <Field label="Archivo XML" required>
            <input
              type="file"
              accept=".xml,text/xml"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="w-full text-xs"
              style={{ color: 'var(--foreground)' }}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setModalCargarOpen(false)}
            disabled={cargando}
            className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleCargarXml()}
            disabled={cargando}
            className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
          >
            {cargando && <Loader2 size={13} className="animate-spin" />}
            Procesar XML
          </button>
        </div>
      </Modal>

      <Modal
        open={documentoDetalle !== null}
        onClose={() => setDocumentoDetalle(null)}
        title={documentoDetalle ? `Documento ${documentoDetalle.numeroDocumentoCompleto}` : ''}
        size="lg"
      >
        {documentoDetalle && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded p-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Emisor</p>
                <p style={{ color: 'var(--foreground)' }}>{documentoDetalle.nombreEmisor}</p>
                <p className="font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{documentoDetalle.nitEmisor}</p>
              </div>
              <div className="rounded p-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Total a pagar</p>
                <p className="font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{fmt(documentoDetalle.totalPagar)}</p>
              </div>
              <div className="rounded p-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Estado</p>
                <p style={{ color: ESTADO_META[documentoDetalle.estadoCausacion].color }}>
                  {ESTADO_META[documentoDetalle.estadoCausacion].label}
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {documentoDetalle.items.map((item) => {
                const asignacion = asignaciones[item.idItemCompraRecibido]
                return (
                  <div key={item.idItemCompraRecibido} className="rounded p-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs" style={{ color: 'var(--foreground)' }}>{item.descripcion}</p>
                      <p className="font-mono-data text-xs" style={{ color: 'var(--foreground)' }}>{fmt(item.total)}</p>
                    </div>

                    {item.estadoMapeo === 'MAPEADO' ? (
                      <p className="text-[10px]" style={{ color: '#4ade80' }}>
                        PUC asignado: <span className="font-mono-data">{item.cuentaPuc}</span> ({item.naturaleza})
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={asignacion?.idReglaMapeoPuc ?? ''}
                          onChange={(e) =>
                            setAsignaciones((current) => ({
                              ...current,
                              [item.idItemCompraRecibido]: { ...current[item.idItemCompraRecibido], idReglaMapeoPuc: e.target.value },
                            }))
                          }
                          style={{ maxWidth: 220 }}
                        >
                          <option value="">Asignar manualmente...</option>
                          {reglasDeLaRazonSocial.map((r) => (
                            <option key={r.idReglaMapeoPuc} value={r.idReglaMapeoPuc}>{r.nombre} ({r.cuentaPuc})</option>
                          ))}
                        </Select>

                        {!asignacion?.idReglaMapeoPuc && (
                          <>
                            <Input
                              placeholder="Cuenta PUC"
                              value={asignacion?.cuentaPuc ?? ''}
                              onChange={(e) =>
                                setAsignaciones((current) => ({
                                  ...current,
                                  [item.idItemCompraRecibido]: { ...current[item.idItemCompraRecibido], cuentaPuc: e.target.value },
                                }))
                              }
                              style={{ maxWidth: 140 }}
                            />
                            <Select
                              value={asignacion?.naturaleza ?? 'D'}
                              onChange={(e) =>
                                setAsignaciones((current) => ({
                                  ...current,
                                  [item.idItemCompraRecibido]: {
                                    ...current[item.idItemCompraRecibido],
                                    naturaleza: e.target.value as NaturalezaContable,
                                  },
                                }))
                              }
                              style={{ maxWidth: 100 }}
                            >
                              <option value="D">Débito</option>
                              <option value="C">Crédito</option>
                            </Select>
                          </>
                        )}

                        <button
                          onClick={() => void guardarAsignacion(item.idItemCompraRecibido)}
                          disabled={guardandoItem === item.idItemCompraRecibido}
                          className="px-3 py-2 rounded text-xs font-semibold"
                          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
                        >
                          Asignar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => void marcarCausado()}
                disabled={causando || documentoDetalle.estadoCausacion === 'CAUSADO'}
                className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
                style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
              >
                {causando && <Loader2 size={13} className="animate-spin" />}
                {documentoDetalle.estadoCausacion === 'CAUSADO' ? 'Ya causado' : 'Marcar Causado'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
