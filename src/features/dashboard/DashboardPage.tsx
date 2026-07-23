import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, Ban, Download, Filter } from 'lucide-react'

const revenueData = [
  { mes: 'Ene', neto: 28400000, bruto: 31200000 },
  { mes: 'Feb', neto: 31500000, bruto: 35000000 },
  { mes: 'Mar', neto: 29800000, bruto: 33100000 },
  { mes: 'Abr', neto: 34200000, bruto: 37800000 },
  { mes: 'May', neto: 37100000, bruto: 41000000 },
  { mes: 'Jun', neto: 33600000, bruto: 37200000 },
  { mes: 'Jul', neto: 41200000, bruto: 45500000 },
]

const marketMix = [
  { name: 'Slots', value: 58, color: '#c8a84b' },
  { name: 'Ruleta', value: 22, color: '#e2c47a' },
  { name: 'Poker', value: 12, color: '#7a6530' },
  { name: 'Bingo', value: 8, color: '#4a3d1f' },
]

const topMachines = [
  { id: 'SLT-012', sala: 'Sala VIP', ubicacion: 'Zona A-3', neto_mes: 4250000, rendimiento: 94 },
  { id: 'SLT-045', sala: 'Sala Principal', ubicacion: 'Zona B-1', neto_mes: 3980000, rendimiento: 88 },
  { id: 'SLT-091', sala: 'Sala VIP', ubicacion: 'Zona A-1', neto_mes: 3750000, rendimiento: 85 },
  { id: 'SLT-033', sala: 'Sala Principal', ubicacion: 'Zona C-2', neto_mes: 3620000, rendimiento: 82 },
  { id: 'SLT-077', sala: 'Sala Lounge', ubicacion: 'Zona D-4', neto_mes: 3480000, rendimiento: 79 },
]

const lowPerformers = [
  { id: 'SLT-019', sala: 'Sala Principal', ubicacion: 'Zona B-7', neto_mes: 520000, rendimiento: 18, falla: 'Sensor roto' },
  { id: 'SLT-056', sala: 'Sala Lounge', ubicacion: 'Zona D-2', neto_mes: 680000, rendimiento: 24, falla: 'Calibración' },
  { id: 'SLT-102', sala: 'Sala Principal', ubicacion: 'Zona C-9', neto_mes: 710000, rendimiento: 27, falla: 'Software' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accent?: string
}

function StatCard({ label, value, sub, icon, trend, trendValue, accent }: StatCardProps) {
  return (
    <div
      className="rounded-lg p-5 relative overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5"
        style={{ background: accent || 'var(--gold)' }}
      />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </p>
        <span style={{ color: accent || 'var(--gold)', opacity: 0.8 }}>{icon}</span>
      </div>
      <p className="font-mono-data text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      {trendValue && (
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <TrendingUp size={11} style={{ color: '#4ade80' }} />
          ) : trend === 'down' ? (
            <TrendingDown size={11} style={{ color: '#f87171' }} />
          ) : null}
          <span
            className="text-[10px] font-medium"
            style={{ color: trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : 'var(--muted-foreground)' }}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded px-3 py-2 text-xs"
        style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--gold)' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto" style={{ minHeight: 0 }}>
      {/* Filters bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg flex-wrap"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Filter size={13} />
          <span className="font-medium tracking-wider uppercase" style={{ color: 'var(--gold)' }}>Filtros</span>
        </div>
        {['TODAS LAS SALAS', 'DÍA', 'SEM', '15D', '1MES', 'AÑO'].map((f, i) => (
          <button
            key={f}
            className="text-[10px] px-3 py-1.5 rounded tracking-wider transition-all"
            style={{
              background: i === 0 ? 'var(--gold)' : 'var(--muted)',
              color: i === 0 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              border: '1px solid var(--border)',
            }}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="date"
            defaultValue="2024-01-01"
            className="text-[10px] px-2 py-1.5 rounded outline-none"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>—</span>
          <input
            type="date"
            defaultValue="2024-07-19"
            className="text-[10px] px-2 py-1.5 rounded outline-none"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          />
          <button
            className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded tracking-wider"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            <Download size={11} /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="NET APR Total"
          value={fmt(41200000)}
          sub="Julio 2026"
          icon={<DollarSign size={16} />}
          trend="up"
          trendValue="+12.3% vs mes anterior"
        />
        <StatCard
          label="Ingr's al Mes"
          value="8.74%"
          sub="Margen neto"
          icon={<Percent size={16} />}
          trend="up"
          trendValue="+1.2 pp"
        />
        <StatCard
          label="Ajuste Pendiente"
          value={fmt(1850000)}
          sub="3 transacciones"
          icon={<DollarSign size={16} />}
          trend="down"
          trendValue="Requiere revisión"
          accent="#f59e0b"
        />
        <StatCard
          label="Soporte Técnico"
          value="7"
          sub="Tickets abiertos"
          icon={<AlertTriangle size={16} />}
          trend="neutral"
          trendValue="2 críticos"
          accent="#f87171"
        />
        <StatCard
          label="Anulables"
          value="12"
          sub="Pendientes de aprobación"
          icon={<Ban size={16} />}
          trend="down"
          trendValue="-3 vs ayer"
          accent="#a78bfa"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div
          className="lg:col-span-2 rounded-lg p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                Tendencia de Ingresos
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Millones COP · Ene – Jul 2026
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8a84b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c8a84b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBruto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e2c47a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#e2c47a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#8b8a9a' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 10, fill: '#8b8a9a' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="neto"
                name="Neto"
                stroke="#c8a84b"
                strokeWidth={2}
                fill="url(#colorNeto)"
              />
              <Area
                type="monotone"
                dataKey="bruto"
                name="Bruto"
                stroke="#e2c47a"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                fill="url(#colorBruto)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Market mix */}
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--gold)' }}>
            Mix de Mercado
          </p>
          <p className="text-[10px] mb-5" style={{ color: 'var(--muted-foreground)' }}>
            Participación por modalidad
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={marketMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {marketMix.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value}%`, '']}
                contentStyle={{ background: 'var(--secondary)', border: '1px solid var(--border)', fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {marketMix.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.name}</span>
                </div>
                <span className="font-mono-data text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 machines */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
              Top Máquinas
            </p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Mayor rendimiento del mes</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Cajero / Sal.', 'Ubicación', 'Net. Mes', '%'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 font-medium tracking-wider"
                    style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topMachines.map((m, i) => (
                <tr
                  key={m.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center font-mono-data text-[10px] font-bold"
                        style={{ background: i < 3 ? 'rgba(200,168,75,0.15)' : 'var(--muted)', color: i < 3 ? 'var(--gold)' : 'var(--muted-foreground)' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-mono-data" style={{ color: 'var(--foreground)' }}>{m.id}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{m.sala}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{m.ubicacion}</td>
                  <td className="px-5 py-3 font-mono-data" style={{ color: 'var(--foreground)' }}>
                    {fmt(m.neto_mes)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${m.rendimiento}%`, background: 'var(--gold)' }}
                        />
                      </div>
                      <span className="font-mono-data text-[10px]" style={{ color: 'var(--gold)' }}>
                        {m.rendimiento}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low performers */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#f87171' }}>
              Rendimiento Bajo
            </p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              Máquinas con bajo rendimiento — acción requerida
            </p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Cajero / Sal.', 'Ubicación', 'Net. Mes', 'Falla'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 font-medium tracking-wider"
                    style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowPerformers.map((m) => (
                <tr
                  key={m.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3">
                    <p className="font-mono-data" style={{ color: 'var(--foreground)' }}>{m.id}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{m.sala}</p>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{m.ubicacion}</td>
                  <td className="px-5 py-3 font-mono-data" style={{ color: '#f87171' }}>
                    {fmt(m.neto_mes)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-1 rounded text-[10px] font-medium"
                      style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}
                    >
                      {m.falla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 flex justify-end">
            <button
              className="text-[10px] px-3 py-1.5 rounded tracking-wider transition-colors"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              Ver todas las alertas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
