import { useState } from 'react'
import { Search, Plus, UserCircle } from 'lucide-react'

const employees = [
  { id: 'EMP-001', nombre: 'Valentina Rincón', cargo: 'Supervisora de Sala', area: 'Operaciones', turno: 'Nocturno', estado: 'Activo', salario: 3200000, ingreso: '2022-03-15' },
  { id: 'EMP-002', nombre: 'Carlos Medina', cargo: 'Técnico de Máquinas', area: 'Taller', turno: 'Diurno', estado: 'Activo', salario: 2800000, ingreso: '2021-07-01' },
  { id: 'EMP-003', nombre: 'Luisa Fernández', cargo: 'Cajera', area: 'Recepción', turno: 'Diurno', estado: 'Vacaciones', salario: 2100000, ingreso: '2023-01-10' },
  { id: 'EMP-004', nombre: 'Andrés Torres', cargo: 'Seguridad', area: 'Vigilancia', turno: 'Rotativo', estado: 'Activo', salario: 2400000, ingreso: '2020-11-20' },
  { id: 'EMP-005', nombre: 'Marcela Ospina', cargo: 'Contadora', area: 'Financiero', turno: 'Diurno', estado: 'Activo', salario: 4500000, ingreso: '2019-05-05' },
  { id: 'EMP-006', nombre: 'Juan Gómez', cargo: 'Técnico de Redes', area: 'Taller', turno: 'Diurno', estado: 'Licencia', salario: 3100000, ingreso: '2022-08-12' },
]

const ESTADO_STYLE: Record<string, { color: string; bg: string }> = {
  Activo: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  Vacaciones: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  Licencia: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Inactivo: { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function EmployeesPage() {
  const [search, setSearch] = useState('')

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    return e.nombre.toLowerCase().includes(q) || e.cargo.toLowerCase().includes(q) || e.area.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Empleados', value: employees.length, color: 'var(--gold)' },
          { label: 'Activos', value: employees.filter((e) => e.estado === 'Activo').length, color: '#4ade80' },
          { label: 'En Vacaciones', value: employees.filter((e) => e.estado === 'Vacaciones').length, color: '#60a5fa' },
          { label: 'En Licencia', value: employees.filter((e) => e.estado === 'Licencia').length, color: '#f59e0b' },
        ].map((c) => (
          <div key={c.label} className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-mono-data text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] tracking-wide mt-1" style={{ color: 'var(--muted-foreground)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo, área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={13} /> Nuevo Empleado
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Empleado', 'Cargo', 'Área', 'Turno', 'Estado', 'Salario', 'Ingreso'].map((h) => (
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
            {filtered.map((e) => {
              const s = ESTADO_STYLE[e.estado] || ESTADO_STYLE['Inactivo']
              return (
                <tr
                  key={e.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-display flex-shrink-0"
                        style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--gold)' }}
                      >
                        {e.nombre.charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: 'var(--foreground)' }}>{e.nombre}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{e.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{e.cargo}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{e.area}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{e.turno}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded text-[10px] font-medium" style={{ background: s.bg, color: s.color }}>
                      {e.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--foreground)' }}>
                    {fmt(e.salario)}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{e.ingreso}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
