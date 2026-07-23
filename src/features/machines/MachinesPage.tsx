import { useState } from 'react'
import { Search, Plus, AlertTriangle, CheckCircle, Clock, WifiOff } from 'lucide-react'

const STATUS = {
  activa: { label: 'Activa', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  mantenimiento: { label: 'Mantenimiento', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  inactiva: { label: 'Inactiva', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  offline: { label: 'Sin señal', color: '#8b8a9a', bg: 'rgba(139,138,154,0.1)' },
} as const

type StatusKey = keyof typeof STATUS

const machines = [
  { id: 'SLT-012', modelo: 'IGT S2000', sala: 'Sala VIP', zona: 'A-3', tipo: 'Slots', status: 'activa' as StatusKey, neto: 4250000, horas: 312, ultima: '2026-07-18' },
  { id: 'SLT-045', modelo: 'Aristocrat Mark IV', sala: 'Sala Principal', zona: 'B-1', tipo: 'Slots', status: 'activa' as StatusKey, neto: 3980000, horas: 298, ultima: '2026-07-19' },
  { id: 'SLT-019', modelo: 'Novomatic Gaminator', sala: 'Sala Principal', zona: 'B-7', tipo: 'Slots', status: 'mantenimiento' as StatusKey, neto: 520000, horas: 41, ultima: '2026-07-10' },
  { id: 'RUL-003', modelo: 'TCSJohnHuxley', sala: 'Sala VIP', zona: 'A-1', tipo: 'Ruleta', status: 'activa' as StatusKey, neto: 6100000, horas: 280, ultima: '2026-07-19' },
  { id: 'SLT-056', modelo: 'WMS Blade Cabinet', sala: 'Sala Lounge', zona: 'D-2', tipo: 'Slots', status: 'mantenimiento' as StatusKey, neto: 680000, horas: 52, ultima: '2026-07-08' },
  { id: 'SLT-091', modelo: 'IGT S2000', sala: 'Sala VIP', zona: 'A-5', tipo: 'Slots', status: 'activa' as StatusKey, neto: 3750000, horas: 305, ultima: '2026-07-19' },
  { id: 'SLT-102', modelo: 'Bally Alpha 2 Pro', sala: 'Sala Principal', zona: 'C-9', tipo: 'Slots', status: 'inactiva' as StatusKey, neto: 710000, horas: 60, ultima: '2026-07-05' },
  { id: 'SLT-077', modelo: 'Ainsworth A600', sala: 'Sala Lounge', zona: 'D-4', tipo: 'Slots', status: 'offline' as StatusKey, neto: 3480000, horas: 270, ultima: '2026-07-17' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function MachinesPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusKey | 'todas'>('todas')

  const filtered = machines.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = m.id.toLowerCase().includes(q) || m.sala.toLowerCase().includes(q) || m.modelo.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'todas' || m.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    activa: machines.filter((m) => m.status === 'activa').length,
    mantenimiento: machines.filter((m) => m.status === 'mantenimiento').length,
    inactiva: machines.filter((m) => m.status === 'inactiva').length,
    offline: machines.filter((m) => m.status === 'offline').length,
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(STATUS) as [StatusKey, typeof STATUS[StatusKey]][]).map(([key, s]) => (
          <div
            key={key}
            className="rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all"
            style={{
              background: filterStatus === key ? s.bg : 'var(--card)',
              border: `1px solid ${filterStatus === key ? s.color : 'var(--border)'}`,
            }}
            onClick={() => setFilterStatus(filterStatus === key ? 'todas' : key)}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <div>
              <p className="font-mono-data text-xl font-semibold" style={{ color: s.color }}>
                {counts[key]}
              </p>
              <p className="text-[10px] tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-48"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Buscar por ID, modelo, sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold tracking-wider transition-all"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={13} /> Registrar Activo
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['ID Cajero', 'Modelo', 'Sala / Zona', 'Tipo', 'Estado', 'Neto Mes', 'Hrs. Uso', 'Última Act.'].map((h) => (
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
            {filtered.map((m) => {
              const s = STATUS[m.status]
              return (
                <tr
                  key={m.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>
                    {m.id}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{m.modelo}</td>
                  <td className="px-5 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{m.sala}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>Zona {m.zona}</p>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{m.tipo}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--foreground)' }}>
                    {fmt(m.neto)}
                  </td>
                  <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>
                    {m.horas}h
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{m.ultima}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            {filtered.length} activos encontrados
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded text-[10px] font-mono-data transition-colors"
                style={{
                  background: p === 1 ? 'var(--gold)' : 'var(--muted)',
                  color: p === 1 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
