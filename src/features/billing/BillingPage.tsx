import { useState } from 'react'
import { Download, CheckCircle, Clock, XCircle, Search } from 'lucide-react'

const invoices = [
  { id: 'FAC-2026-0892', cliente: 'Mesa de Cambio S.A.S', concepto: 'Arriendo equipos — Julio', monto: 8500000, fecha: '2026-07-01', vence: '2026-07-31', estado: 'Pagada' },
  { id: 'FAC-2026-0891', cliente: 'Operadora Juegos S.A.', concepto: 'Mantenimiento preventivo', monto: 2300000, fecha: '2026-06-28', vence: '2026-07-28', estado: 'Pendiente' },
  { id: 'FAC-2026-0890', cliente: 'Distribuidora Azar Ltda.', concepto: 'Licencias software mes', monto: 1850000, fecha: '2026-06-25', vence: '2026-07-25', estado: 'Pendiente' },
  { id: 'FAC-2026-0889', cliente: 'Casino Norte S.A.S', concepto: 'Servicio técnico correctivo', monto: 950000, fecha: '2026-06-20', vence: '2026-07-05', estado: 'Vencida' },
  { id: 'FAC-2026-0888', cliente: 'Mesa de Cambio S.A.S', concepto: 'Arriendo equipos — Junio', monto: 8500000, fecha: '2026-06-01', vence: '2026-06-30', estado: 'Pagada' },
  { id: 'FAC-2026-0887', cliente: 'Operadora Juegos S.A.', concepto: 'Repuestos y suministros', monto: 4200000, fecha: '2026-05-28', vence: '2026-06-27', estado: 'Pagada' },
]

const ESTADO_STYLE: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Pagada: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle size={11} /> },
  Pendiente: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={11} /> },
  Vencida: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={11} /> },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function BillingPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'todas' | 'Pendiente' | 'Pagada' | 'Vencida'>('todas')

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.cliente.toLowerCase().includes(q)
    const matchTab = tab === 'todas' || inv.estado === tab
    return matchSearch && matchTab
  })

  const totales = {
    pendiente: invoices.filter((i) => i.estado === 'Pendiente').reduce((s, i) => s + i.monto, 0),
    pagada: invoices.filter((i) => i.estado === 'Pagada').reduce((s, i) => s + i.monto, 0),
    vencida: invoices.filter((i) => i.estado === 'Vencida').reduce((s, i) => s + i.monto, 0),
  }

  const tabs = ['todas', 'Pendiente', 'Pagada', 'Vencida'] as const

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Por Cobrar</p>
          <p className="font-mono-data text-2xl font-bold" style={{ color: '#f59e0b' }}>{fmt(totales.pendiente)}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{invoices.filter((i) => i.estado === 'Pendiente').length} facturas</p>
        </div>
        <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Cobrado Mes</p>
          <p className="font-mono-data text-2xl font-bold" style={{ color: '#4ade80' }}>{fmt(totales.pagada)}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{invoices.filter((i) => i.estado === 'Pagada').length} facturas</p>
        </div>
        <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Cartera Vencida</p>
          <p className="font-mono-data text-2xl font-bold" style={{ color: '#f87171' }}>{fmt(totales.vencida)}</p>
          <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>Acción requerida</p>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-[10px] tracking-widest uppercase transition-colors capitalize"
              style={{
                background: tab === t ? 'var(--gold)' : 'var(--card)',
                color: tab === t ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded flex-1 min-w-48"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Buscar factura o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['# Factura', 'Cliente', 'Concepto', 'Monto', 'Emisión', 'Vencimiento', 'Estado', ''].map((h) => (
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
            {filtered.map((inv) => {
              const s = ESTADO_STYLE[inv.estado]
              return (
                <tr
                  key={inv.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>
                    {inv.id}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{inv.cliente}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{inv.concepto}</td>
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>
                    {fmt(inv.monto)}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{inv.fecha}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{inv.vence}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.icon} {inv.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button style={{ color: 'var(--muted-foreground)' }} title="Descargar PDF">
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
