import { useEffect, useRef, useState } from 'react'
import {
  FileSpreadsheet, RefreshCw, Download, CheckCircle2, XCircle,
  AlertCircle, Clock, Send, Link, Info, Loader2, AlertOctagon,
} from 'lucide-react'
import { Toast } from '@/components/Modal'
import { razonesSocialesApi, type RazonSocialApi } from '@/features/config/services/razones-sociales.api'
import {
  documentosRecibidosApi,
  type DocumentoRecibidoApi,
  type EstadoCausacionRecibido,
} from './services/documentos-recibidos.api'

type AuthStep = 1 | 2 | 3

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

export default function PortalDIANPage() {
  const [razonesSociales, setRazonesSociales] = useState<RazonSocialApi[]>([])
  const [idRazonSocial, setIdRazonSocial] = useState('')
  const [documentos, setDocumentos] = useState<DocumentoRecibidoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [importando, setImportando] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>(1)
  const [authenticated, setAuthenticated] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterEstado, setFilterEstado] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const [documentosResp, razonesResp] = await Promise.all([
        documentosRecibidosApi.listar(),
        razonesSocialesApi.listar(),
      ])
      setDocumentos(documentosResp.documentos)
      setRazonesSociales(razonesResp.data)
      if (razonesResp.data.length > 0) setIdRazonSocial(String(razonesResp.data[0].idRazonSocial))
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudieron cargar los documentos recibidos.'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const handleSolicitarCorreo = () => {
    setToast({ message: 'Solicitud enviada. Revisa el correo registrado en el RUT del NIT.', type: 'success' })
    setAuthStep(2)
  }

  const handleValidarToken = () => {
    if (!tokenInput.trim()) {
      setToast({ message: 'Pega el enlace o token antes de validar.', type: 'error' })
      return
    }
    setAuthStep(3)
    setAuthenticated(true)
    setToast({ message: 'Sesión autenticada exitosamente con el Portal DIAN.', type: 'success' })
  }

  const handleCargarExcelClick = () => {
    if (!idRazonSocial) {
      setToast({ message: 'Selecciona primero la razón social.', type: 'error' })
      return
    }
    fileInputRef.current?.click()
  }

  const handleArchivoExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0]
    event.target.value = ''
    if (!archivo || !idRazonSocial) return

    setImportando(true)
    try {
      const resultado = await documentosRecibidosApi.importarExcel(archivo, Number(idRazonSocial))
      setToast({
        message: `Excel procesado: ${resultado.creados} nuevos, ${resultado.yaExistian} ya existían${resultado.requierenRevision ? `, ${resultado.requierenRevision} requieren revisión` : ''}.`,
        type: 'success',
      })
      await cargar()
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo importar el Excel.'), type: 'error' })
    } finally {
      setImportando(false)
    }
  }

  const filtered = documentos.filter((d) => !filterEstado || d.estadoCausacion === filterEstado)

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Top recommendation banner */}
      <div
        className="flex items-start gap-3 px-4 py-4 rounded-lg"
        style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}
      >
        <Info size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1">
          <p className="text-xs font-semibold mb-0.5" style={{ color: '#4ade80' }}>Método recomendado: cargar el Excel de la DIAN</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            La DIAN cambió recientemente el portal y la sincronización automática por OTP (abajo) puede no funcionar. La forma confiable ahora es descargar el Excel de "Documentos Recibidos" desde el portal DIAN y cargarlo aquí.
          </p>
          <select
            value={idRazonSocial}
            onChange={(e) => setIdRazonSocial(e.target.value)}
            className="mt-2 px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            {razonesSociales.map((rs) => (
              <option key={rs.idRazonSocial} value={rs.idRazonSocial}>{rs.nombreRazonSocial}</option>
            ))}
          </select>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => void handleArchivoExcel(e)} />
        <button
          onClick={handleCargarExcelClick}
          disabled={importando}
          className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold flex-shrink-0 transition-all"
          style={{ background: '#4ade80', color: '#07070f' }}
        >
          {importando ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
          Cargar Excel DIAN
        </button>
      </div>

      {/* Portal card */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: 'rgba(248,113,113,0.08)', borderBottom: '1px solid rgba(248,113,113,0.2)' }}
        >
          <AlertCircle size={16} style={{ color: '#f87171' }} />
          <div>
            <p className="text-sm font-semibold font-display tracking-wider" style={{ color: '#f87171' }}>
              Portal DIAN — Documentos Recibidos
            </p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              Descarga automática de facturas desde catalogo-vpfe.dian.gov.co (referencial — usa el Excel arriba)
            </p>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'RAZÓN SOCIAL', value: razonesSociales.find((rs) => String(rs.idRazonSocial) === idRazonSocial)?.nombreRazonSocial ?? 'Sin selección', sub: 'Usada para cargar documentos' },
              { label: 'AMBIENTE', value: 'Producción', sub: 'Servidor activo' },
              { label: 'SESIÓN', value: authenticated ? 'Autenticado' : 'No autenticado', sub: authenticated ? 'Sesión OTP simulada' : 'Pendiente', warn: !authenticated },
            ].map((s) => (
              <div key={s.label} className="rounded p-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                <p className="text-xs font-semibold" style={{ color: s.warn ? '#f59e0b' : 'var(--foreground)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(200,168,75,0.15)' }}>≡</span>
              Autenticación en 3 pasos (referencial, no disponible actualmente)
            </p>

            <div className="space-y-4 opacity-60">
              <div className="rounded-lg p-4" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: authStep > 1 ? '#4ade80' : 'var(--gold)', color: 'var(--primary-foreground)' }}>
                    {authStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Solicitar Correo de Acceso</p>
                    <button
                      onClick={handleSolicitarCorreo}
                      disabled={authStep > 1}
                      className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all"
                      style={{ background: authStep > 1 ? 'var(--muted)' : 'var(--gold)', color: authStep > 1 ? 'var(--muted-foreground)' : 'var(--primary-foreground)' }}
                    >
                      <Send size={12} /> Solicitar Correo
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: authStep > 2 ? '#4ade80' : authStep === 2 ? 'var(--gold)' : 'var(--muted)', color: authStep >= 2 ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
                    {authStep > 2 ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Pega el enlace o token del correo</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded" style={{ background: 'var(--muted)', border: `1px solid ${authStep === 2 ? 'var(--gold-dim)' : 'var(--border)'}` }}>
                        <Link size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                        <input
                          type="text"
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          placeholder="Pega el enlace o token aquí..."
                          disabled={authStep !== 2}
                          className="bg-transparent outline-none text-xs w-full"
                          style={{ color: 'var(--foreground)' }}
                        />
                      </div>
                      <button
                        onClick={handleValidarToken}
                        disabled={authStep !== 2}
                        className="px-4 py-2.5 rounded text-xs font-semibold transition-all flex-shrink-0"
                        style={{ background: authStep === 2 ? 'var(--gold)' : 'var(--muted)', color: authStep === 2 ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
                      >
                        Validar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>Documentos Recibidos</p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Cargados por XML manual o Excel del portal</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 rounded text-xs outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando documentos...</span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                {['N° Documento', 'Emisor', 'NIT', 'Fecha', 'Monto', 'Tipo', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase" style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const meta = ESTADO_META[d.estadoCausacion]
                return (
                  <tr key={d.idDocumentoRecibido} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{d.numeroDocumentoCompleto}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{d.nombreEmisor}</td>
                    <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{d.nitEmisor}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{d.fechaEmision.slice(0, 10)}</td>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>{fmt(d.totalPagar)}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{d.tipoDocumento === 'FACTURA' ? 'Factura Electrónica' : d.tipoDocumento === 'NOTA_CREDITO' ? 'Nota Crédito' : 'Nota Débito'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium" style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {d.origen === 'MANUAL' && (
                        <button style={{ color: 'var(--muted-foreground)' }} title="XML disponible"><Download size={13} /></button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>No hay documentos para los filtros aplicados.</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} documento(s)</p>
          <button onClick={() => void cargar()} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            <RefreshCw size={11} /> Actualizar
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
