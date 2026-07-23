import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Modal, { Field, Input, Toast } from '@/components/Modal'

interface Role {
  id: string
  nombre: string
  descripcion: string
  usuarios: number
  estado: 'Activo' | 'Inactivo'
  creado: string
}

const INITIAL_ROLES: Role[] = [
  { id: 'ROL-001', nombre: 'Super Admin', descripcion: 'Acceso completo al sistema', usuarios: 1, estado: 'Activo', creado: '2024-01-01' },
  { id: 'ROL-002', nombre: 'Administrador', descripcion: 'Gestión general del casino', usuarios: 3, estado: 'Activo', creado: '2024-01-01' },
  { id: 'ROL-003', nombre: 'Supervisor', descripcion: 'Supervisión de salas y turnos', usuarios: 7, estado: 'Activo', creado: '2024-02-15' },
  { id: 'ROL-004', nombre: 'Técnico', descripcion: 'Mantenimiento y reparación de equipos', usuarios: 4, estado: 'Activo', creado: '2024-02-15' },
  { id: 'ROL-005', nombre: 'Cajero', descripcion: 'Manejo de caja y transacciones', usuarios: 12, estado: 'Activo', creado: '2024-03-01' },
  { id: 'ROL-006', nombre: 'Soporte', descripcion: 'Atención a clientes y reportes', usuarios: 5, estado: 'Inactivo', creado: '2024-04-10' },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = roles.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.nombre.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q)
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    else if (roles.some((r) => r.nombre.toLowerCase() === form.nombre.trim().toLowerCase())) e.nombre = 'Nombre ya existe'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const newRole: Role = {
      id: `ROL-${String(roles.length + 1).padStart(3, '0')}`,
      nombre: form.nombre,
      descripcion: form.descripcion,
      usuarios: 0,
      estado: 'Activo',
      creado: new Date().toISOString().split('T')[0],
    }
    setRoles([...roles, newRole])
    setModalOpen(false)
    setForm({ nombre: '', descripcion: '' })
    setErrors({})
    setToast({ message: `Rol "${newRole.nombre}" creado exitosamente.`, type: 'success' })
  }

  const toggleEstado = (id: string) => {
    setRoles(roles.map((r) => r.id === id ? { ...r, estado: r.estado === 'Activo' ? 'Inactivo' : 'Activo' } : r))
  }

  const deleteRole = (r: Role) => {
    if (r.usuarios > 0) {
      setToast({ message: `No se puede eliminar: tiene ${r.usuarios} usuario(s) asignado(s).`, type: 'error' })
      return
    }
    setRoles(roles.filter((x) => x.id !== r.id))
    setToast({ message: 'Rol eliminado.', type: 'success' })
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Roles', value: roles.length, color: 'var(--gold)' },
          { label: 'Activos', value: roles.filter((r) => r.estado === 'Activo').length, color: '#4ade80' },
          { label: 'Usuarios Asignados', value: roles.reduce((s, r) => s + r.usuarios, 0), color: '#60a5fa' },
        ].map((c) => (
          <div key={c.label} className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-mono-data text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] tracking-wide mt-1" style={{ color: 'var(--muted-foreground)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Buscar por nombre o descripción..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <button onClick={() => { setForm({ nombre: '', descripcion: '' }); setErrors({}); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Plus size={13} /> Nuevo Rol
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Rol', 'Descripción', 'Usuarios', 'Creado', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--gold)' }}>
                      {r.nombre.charAt(0)}
                    </div>
                    <div>
                      <p style={{ color: 'var(--foreground)' }}>{r.nombre}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{r.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{r.descripcion}</td>
                <td className="px-5 py-4">
                  <span className="font-mono-data font-bold text-sm" style={{ color: r.usuarios > 0 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                    {r.usuarios}
                  </span>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{r.creado}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                    style={{
                      background: r.estado === 'Activo' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: r.estado === 'Activo' ? '#4ade80' : '#f87171',
                    }}>{r.estado}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button title="Editar" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Edit2 size={13} />
                    </button>
                    <button title={r.estado === 'Activo' ? 'Desactivar' : 'Activar'} onClick={() => toggleEstado(r.id)}
                      style={{ color: r.estado === 'Activo' ? '#4ade80' : '#f87171' }}>
                      {r.estado === 'Activo' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button title="Eliminar" onClick={() => deleteRole(r)} className="p-1.5 rounded"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} rol(es) encontrado(s)</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Rol" size="sm">
        <div className="space-y-4">
          <Field label="Nombre del rol" required>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Auditor" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>
          <Field label="Descripción">
            <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Breve descripción del rol" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Crear Rol
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
