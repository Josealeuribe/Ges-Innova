import { useEffect, useState } from 'react'
import { Loader2, Clock, Send, CheckCircle2, XCircle, AlertOctagon, AlertTriangle, FileText } from 'lucide-react'

import {
  documentosRecibidosApi,
  type EstadoCausacionRecibido,
  type ResumenRecepcionApi,
} from './services/documentos-recibidos.api'

const ESTADO_META: Record<EstadoCausacionRecibido, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDIENTE: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={13} /> },
  CONCILIADO: { label: 'Conciliado', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Send size={13} /> },
  CAUSADO: { label: 'Causado', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={13} /> },
  EXPORTADO: { label: 'Exportado', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={13} /> },
  RECHAZADO: { label: 'Rechazado', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={13} /> },
  ERROR_XML: { label: 'Error XML', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <AlertOctagon size={13} /> },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function PanelControlPage() {
  const [resumen, setResumen] = useState<ResumenRecepcionApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    documentosRecibidosApi
      .resumen()
      .then((data) => { if (activo) setResumen(data) })
      .catch((err) => { if (activo) setError(getErrorMessage(err, 'No se pudo cargar el panel de control.')) })
      .finally(() => { if (activo) setLoading(false) })
    return () => { activo = false }
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 p-12">
        <Loader2 className="animate-spin" size={18} style={{ color: 'var(--gold)' }} />
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando panel de control...</span>
      </div>
    )
  }

  if (error || !resumen) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-xs" style={{ color: '#f87171' }}>{error ?? 'Sin datos disponibles.'}</p>
      </div>
    )
  }

  const conteoPorEstado = new Map(resumen.porEstado.map((item) => [item.estadoCausacion, item.cantidad]))
  const totalDocumentos = resumen.porEstado.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div>
        <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          Panel de Control — Recepción
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Documentos recibidos de proveedores (XML manual + Excel del portal DIAN).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Total Documentos</p>
          <p className="font-mono-data text-2xl font-bold" style={{ color: 'var(--gold)' }}>{totalDocumentos}</p>
        </div>
        <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Documentos del Mes</p>
          <p className="font-mono-data text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{resumen.documentosDelMes}</p>
        </div>
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--card)', border: `1px solid ${resumen.requierenRevision > 0 ? 'rgba(245,158,11,0.4)' : 'var(--border)'}` }}
        >
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Requieren Revisión</p>
          <p className="font-mono-data text-2xl font-bold" style={{ color: resumen.requierenRevision > 0 ? '#f59e0b' : 'var(--foreground)' }}>
            {resumen.requierenRevision}
          </p>
          {resumen.requierenRevision > 0 && (
            <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#f59e0b' }}>
              <AlertTriangle size={11} /> Ambigüedad de conciliación
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(ESTADO_META) as EstadoCausacionRecibido[]).map((estado) => {
          const meta = ESTADO_META[estado]
          return (
            <div key={estado} className="rounded-lg p-4 flex flex-col items-center gap-2 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                {meta.icon}
              </span>
              <p className="font-mono-data text-lg font-bold" style={{ color: 'var(--foreground)' }}>{conteoPorEstado.get(estado) ?? 0}</p>
              <p className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>{meta.label}</p>
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Últimos documentos recibidos
        </h3>
        <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Documento', 'Emisor', 'Fecha', 'Total', 'Estado'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase" style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resumen.ultimosDocumentos.map((doc) => {
                const meta = ESTADO_META[doc.estadoCausacion]
                return (
                  <tr key={doc.idDocumentoRecibido} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{doc.numeroDocumentoCompleto}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{doc.nombreEmisor}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{doc.fechaEmision.slice(0, 10)}</td>
                    <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>{fmt(doc.totalPagar)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium" style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {resumen.ultimosDocumentos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    <FileText size={20} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
                    Todavía no se ha recibido ningún documento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
