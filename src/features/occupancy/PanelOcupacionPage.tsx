import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { Users, TrendingUp, TrendingDown, Building2, Clock, BarChart2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const ocupacionPorHora = [
  { hora: '08:00', norte: 12, sur: 8, centro: 5 },
  { hora: '10:00', norte: 28, sur: 18, centro: 12 },
  { hora: '12:00', norte: 45, sur: 32, centro: 24 },
  { hora: '14:00', norte: 62, sur: 41, centro: 35 },
  { hora: '16:00', norte: 88, sur: 64, centro: 50 },
  { hora: '18:00', norte: 124, sur: 87, centro: 71 },
  { hora: '20:00', norte: 192, sur: 118, centro: 98 },
  { hora: '22:00', norte: 148, sur: 98, centro: 84 },
  { hora: '00:00', norte: 94, sur: 62, centro: 45 },
]

const tendenciaSemanal = [
  { dia: 'Lun', jugadores: 842 }, { dia: 'Mar', jugadores: 924 },
  { dia: 'Mié', jugadores: 798 }, { dia: 'Jue', jugadores: 1102 },
  { dia: 'Vie', jugadores: 1456 }, { dia: 'Sáb', jugadores: 1891 },
  { dia: 'Dom', jugadores: 1643 },
]

const resumenCasinos = [
  { casino: 'Sede Norte', tomas: 14, total: 1240, promedio: 88, maximo: 192, minimo: 12, horaPico: '20:00' },
  { casino: 'Sede Sur', tomas: 10, total: 732, promedio: 73, maximo: 118, minimo: 8, horaPico: '20:00' },
  { casino: 'Casino Norte Centro', tomas: 8, total: 524, promedio: 65, maximo: 98, minimo: 5, horaPico: '22:00' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded px-3 py-2 text-xs shadow-xl"
        style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--gold)' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-mono-data font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}
function KpiCard({ label, value, sub, icon, trend, trendValue }: KpiCardProps) {
  return (
    <div className="rounded-lg p-5 relative overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-5" style={{ background: 'var(--gold)' }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <span style={{ color: 'var(--gold)', opacity: 0.7 }}>{icon}</span>
      </div>
      <p className="font-mono-data text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      {trendValue && (
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? <TrendingUp size={11} style={{ color: '#4ade80' }} /> : trend === 'down' ? <TrendingDown size={11} style={{ color: '#f87171' }} /> : null}
          <span className="text-[10px] font-medium"
            style={{ color: trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : 'var(--muted-foreground)' }}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )
}

export default function PanelOcupacionPage() {
  const { razonSocialActiva } = useApp()

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-lg"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>Filtros</span>
        {['HOY', 'SEMANA', 'MES', 'PERSONALIZADO'].map((f, i) => (
          <button key={f} className="text-[10px] px-3 py-1.5 rounded tracking-wider transition-all"
            style={{
              background: i === 0 ? 'var(--gold)' : 'var(--muted)',
              color: i === 0 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              border: '1px solid var(--border)',
            }}>{f}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <select className="px-3 py-1.5 rounded text-[10px] outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <option>Todos los casinos</option>
            {resumenCasinos.map(c => <option key={c.casino}>{c.casino}</option>)}
          </select>
          <select className="px-3 py-1.5 rounded text-[10px] outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <option>Todas las zonas</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Jugadores Hoy" value="1,240" sub="Suma total" icon={<Users size={16} />} trend="up" trendValue="+8.3% vs ayer" />
        <KpiCard label="Promedio Diario" value="88" sub="Por toma registrada" icon={<BarChart2 size={16} />} trend="up" trendValue="+5 vs semana ant." />
        <KpiCard label="Casino Mayor Ocup." value="Sede Norte" sub="192 jugadores" icon={<Building2 size={16} />} />
        <KpiCard label="Hora Pico" value="20:00" sub="Prom. 192 jugadores" icon={<Clock size={16} />} trend="neutral" trendValue="Viernes y sábados" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ocupación por hora — by casino */}
        <div className="lg:col-span-2 rounded-lg p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--gold)' }}>
            Ocupación por Hora
          </p>
          <p className="text-[10px] mb-5" style={{ color: 'var(--muted-foreground)' }}>
            Jugadores registrados por casino · hoy
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ocupacionPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#8b8a9a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8b8a9a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#8b8a9a' }} />
              <Line type="monotone" dataKey="norte" name="Sede Norte" stroke="#c8a84b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sur" name="Sede Sur" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="centro" name="Casino Norte" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tendencia semanal */}
        <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--gold)' }}>
            Tendencia Semanal
          </p>
          <p className="text-[10px] mb-5" style={{ color: 'var(--muted-foreground)' }}>
            Total jugadores por día
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tendenciaSemanal} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#8b8a9a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8b8a9a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="jugadores" name="Jugadores" fill="#c8a84b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen por casino */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
            Resumen por Casino
          </p>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            Indicadores de ocupación · {razonSocialActiva.nombre}
          </p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Casino', 'Tomas', 'Total Jug.', 'Promedio', 'Máximo', 'Mínimo', 'Hora Pico'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resumenCasinos.map((c, i) => (
              <tr key={c.casino} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: i === 0 ? '#c8a84b' : i === 1 ? '#60a5fa' : '#4ade80' }} />
                    <span style={{ color: 'var(--foreground)' }}>{c.casino}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{c.tomas}</td>
                <td className="px-5 py-3.5 font-mono-data font-bold" style={{ color: 'var(--foreground)' }}>{c.total.toLocaleString()}</td>
                <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--foreground)' }}>{c.promedio}</td>
                <td className="px-5 py-3.5 font-mono-data font-bold" style={{ color: '#4ade80' }}>{c.maximo}</td>
                <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{c.minimo}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-1 rounded text-[10px] font-mono-data font-semibold"
                    style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--gold)' }}>{c.horaPico}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
