import { useState } from 'react'
import {
  FileSpreadsheet, RefreshCw, Download, CheckCircle2, XCircle,
  AlertCircle, Clock, Send, Link, ChevronDown, Info,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Toast } from '@/components/Modal'

type AuthStep = 1 | 2 | 3
type SyncStatus = 'idle' | 'loading' | 'success' | 'error'

interface DianDoc {
  id: string
  numero: string
  emisor: string
  nit: string
  fecha: string
  monto: number
  tipo: string
  estado: 'Recibido' | 'Procesado' | 'Error' | 'Pendiente'
}

const DOCS: DianDoc[] = [
  { id: 'D-001', numero: 'FE-20240118-001', emisor: 'Proveedor Tecnología S.A.S', nit: '900123456-1', fecha: '2026-07-18', monto: 4800000, tipo: 'Factura Electrónica', estado: 'Procesado' },
  { id: 'D-002', numero: 'FE-20240117-089', emisor: 'Distribuciones Norte Ltda.', nit: '800456789-0', fecha: '2026-07-17', monto: 1250000, tipo: 'Factura Electrónica', estado: 'Recibido' },
  { id: 'D-003', numero: 'NC-20240115-003', emisor: 'Equipos Casino S.A.', nit: '900987654-2', fecha: '2026-07-15', monto: 650000, tipo: 'Nota Crédito', estado: 'Pendiente' },
  { id: 'D-004', numero: 'FE-20240114-221', emisor: 'Servicios Técnicos S.A.S', nit: '830654321-9', fecha: '2026-07-14', monto: 2100000, tipo: 'Factura Electrónica', estado: 'Error' },
  { id: 'D-005', numero: 'FE-20240112-018', emisor: 'Mantenimiento Industrial', nit: '811222333-1', fecha: '2026-07-12', monto: 3400000, tipo: 'Factura Electrónica', estado: 'Procesado' },
]

const DOC_STATUS: Record<DianDoc['estado'], { color: string; bg: string; icon: React.ReactNode }> = {
  Procesado: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={11} /> },
  Recibido: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Download size={11} /> },
  Pendiente: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={11} /> },
  Error: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={11} /> },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function PortalDIANPage() {
  const { razonSocialActiva } = useApp()
  const [tokenInput, setTokenInput] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>(1)
  const [authenticated, setAuthenticated] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [docs, setDocs] = useState<DianDoc[]>(DOCS)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterEstado, setFilterEstado] = useState('')

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

  const handleSync = () => {
    setSyncStatus('loading')
    setTimeout(() => {
      setSyncStatus('success')
      setToast({ message: 'Sincronización completada: 5 documentos recibidos.', type: 'success' })
    }, 2200)
  }

  const handleCargarExcel = () => {
    setToast({ message: 'Función de carga Excel disponible próximamente.', type: 'success' })
  }

  const filtered = docs.filter((d) => !filterEstado || d.estado === filterEstado)

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
        </div>
        <button
          onClick={handleCargarExcel}
          className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold flex-shrink-0 transition-all"
          style={{ background: '#4ade80', color: '#07070f' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <FileSpreadsheet size={13} /> Cargar Excel DIAN
        </button>
      </div>

      {/* Portal card */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {/* Card header — danger */}
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
              Descarga automática de facturas desde catalogo-vpfe.dian.gov.co
            </p>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Status row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'NIT EMPRESA', value: razonSocialActiva.nombre, sub: 'No configurado', warn: true },
              { label: 'AMBIENTE', value: 'Producción', sub: 'Servidor activo' },
              { label: 'SESIÓN', value: authenticated ? 'Autenticado' : 'No autenticado', sub: authenticated ? razonSocialActiva.correo : 'Pendiente', warn: !authenticated },
            ].map((s) => (
              <div key={s.label} className="rounded p-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                <p className="text-xs font-semibold" style={{ color: s.warn ? '#f59e0b' : 'var(--foreground)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Auth steps */}
          <div>
            <p className="text-xs font-semibold tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(200,168,75,0.15)' }}>≡</span>
              Autenticación en 3 pasos
            </p>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className={`rounded-lg p-4 transition-all ${authStep >= 1 ? '' : 'opacity-40'}`}
                style={{ background: 'var(--secondary)', border: `1px solid ${authStep === 1 ? 'var(--gold-dim)' : 'var(--border)'}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: authStep > 1 ? '#4ade80' : 'var(--gold)', color: 'var(--primary-foreground)' }}>
                    {authStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Solicitar Correo de Acceso</p>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      La DIAN enviará un enlace de acceso al correo registrado en el RUT del NIT. Puedes hacerlo desde aquí o directamente en el portal DIAN.
                    </p>
                    <button
                      onClick={handleSolicitarCorreo}
                      disabled={authStep > 1}
                      className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all"
                      style={{
                        background: authStep > 1 ? 'var(--muted)' : 'var(--gold)',
                        color: authStep > 1 ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                      }}
                    >
                      <Send size={12} /> Solicitar Correo
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`rounded-lg p-4 transition-all ${authStep >= 2 ? '' : 'opacity-40'}`}
                style={{ background: 'var(--secondary)', border: `1px solid ${authStep === 2 ? 'var(--gold-dim)' : 'var(--border)'}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: authStep > 2 ? '#4ade80' : authStep === 2 ? 'var(--gold)' : 'var(--muted)', color: authStep >= 2 ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
                    {authStep > 2 ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Pega el enlace o token del correo</p>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Copia el enlace de "Acceder" o el código alfanumérico que recibes y pégalo aquí.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded"
                        style={{ background: 'var(--muted)', border: `1px solid ${authStep === 2 ? 'var(--gold-dim)' : 'var(--border)'}` }}>
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
                        style={{
                          background: authStep === 2 ? 'var(--gold)' : 'var(--muted)',
                          color: authStep === 2 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                        }}
                      >
                        Validar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`rounded-lg p-4 transition-all ${authStep >= 3 ? '' : 'opacity-40'}`}
                style={{ background: 'var(--secondary)', border: `1px solid ${authStep === 3 ? 'var(--gold-dim)' : 'var(--border)'}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: authStep >= 3 ? 'var(--gold)' : 'var(--muted)', color: authStep >= 3 ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Sincronizar Documentos</p>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--muted-foreground)' }}>
                      Descarga automáticamente todas las facturas recibidas de los últimos 30 días desde el portal DIAN.
                    </p>
                    <button
                      onClick={handleSync}
                      disabled={!authenticated || syncStatus === 'loading'}
                      className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all"
                      style={{
                        background: authenticated ? 'var(--gold)' : 'var(--muted)',
                        color: authenticated ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      }}
                    >
                      <RefreshCw size={12} className={syncStatus === 'loading' ? 'animate-spin' : ''} />
                      {syncStatus === 'loading' ? 'Sincronizando...' : 'Sincronizar Documentos'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>Documentos Recibidos</p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Últimos 30 días · {razonSocialActiva.nombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 rounded text-xs outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="">Todos los estados</option>
              {['Recibido', 'Procesado', 'Pendiente', 'Error'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded text-xs"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
              <Download size={12} /> Descargar
            </button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['N° Documento', 'Emisor', 'NIT', 'Fecha', 'Monto', 'Tipo', 'Estado', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const s = DOC_STATUS[d.estado]
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{d.numero}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{d.emisor}</td>
                  <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{d.nit}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{d.fecha}</td>
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>{fmt(d.monto)}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{d.tipo}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{ background: s.bg, color: s.color }}>
                      {s.icon} {d.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button style={{ color: 'var(--muted-foreground)' }} title="Descargar XML">
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} documento(s)</p>
          <div className="flex gap-3">
            {(['Recibido', 'Procesado', 'Pendiente', 'Error'] as DianDoc['estado'][]).map((st) => {
              const count = docs.filter((d) => d.estado === st).length
              const s = DOC_STATUS[st]
              return (
                <span key={st} className="flex items-center gap-1 text-[10px]" style={{ color: s.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  {st}: {count}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
