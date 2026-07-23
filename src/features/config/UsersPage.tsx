import { useState } from 'react'
import { Search, Plus, Download, Upload, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'

interface User {
  id: string
  nombre: string
  cedula: string
  correo: string
  telefono: string
  cargo: string
  ciudad: string
  rol: string
  estado: 'Activo' | 'Inactivo'
}

const ROLES = ['Super Admin', 'Administrador', 'Supervisor', 'Técnico', 'Cajero', 'Soporte']
const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga']

const INITIAL_USERS: User[] = [
  { id: 'USR-001', nombre: 'Valentina Rincón', cedula: '1023456789', correo: 'vrincón@innovaclub.co', telefono: '315-2345678', cargo: 'Supervisora de Sala', ciudad: 'Bogotá', rol: 'Supervisor', estado: 'Activo' },
  { id: 'USR-002', nombre: 'Carlos Medina', cedula: '10198765432', correo: 'cmedina@innovaclub.co', telefono: '314-8765432', cargo: 'Técnico', ciudad: 'Bogotá', rol: 'Técnico', estado: 'Activo' },
  { id: 'USR-003', nombre: 'Luisa Fernández', cedula: '52345678', correo: 'lfernandez@innovaclub.co', telefono: '312-3456789', cargo: 'Cajera', ciudad: 'Medellín', rol: 'Cajero', estado: 'Inactivo' },
  { id: 'USR-004', nombre: 'Andrés Torres', cedula: '80123456', correo: 'atorres@innovaclub.co', telefono: '318-1234567', cargo: 'Vigilancia', ciudad: 'Bogotá', rol: 'Soporte', estado: 'Activo' },
  { id: 'USR-005', nombre: 'Marcela Ospina', cedula: '41234567', correo: 'mospina@innovaclub.co', telefono: '310-9876543', cargo: 'Contadora', ciudad: 'Cali', rol: 'Administrador', estado: 'Activo' },
]

const EMPTY_FORM = { nombre: '', cedula: '', correo: '', telefono: '', cargo: '', ciudad: 'Bogotá', rol: 'Cajero', password: '', confirmPassword: '', estado: 'Activo' as 'Activo' | 'Inactivo' }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchQ = !q || u.nombre.toLowerCase().includes(q) || u.cedula.includes(q) || u.correo.toLowerCase().includes(q) || u.cargo.toLowerCase().includes(q)
    const matchRol = !filterRol || u.rol === filterRol
    const matchEstado = !filterEstado || u.estado === filterEstado
    return matchQ && matchRol && matchEstado
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.cedula.trim()) e.cedula = 'Requerido'
    else if (users.some((u) => u.cedula === form.cedula.trim())) e.cedula = 'Cédula ya registrada'
    if (!form.correo.trim()) e.correo = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Formato inválido'
    else if (users.some((u) => u.correo === form.correo.trim())) e.correo = 'Correo ya registrado'
    if (!form.password) e.password = 'Requerido'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    if (!form.cargo.trim()) e.cargo = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      nombre: form.nombre,
      cedula: form.cedula,
      correo: form.correo,
      telefono: form.telefono,
      cargo: form.cargo,
      ciudad: form.ciudad,
      rol: form.rol,
      estado: form.estado,
    }
    setUsers([newUser, ...users])
    setModalOpen(false)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setToast({ message: `Usuario "${newUser.nombre}" creado exitosamente.`, type: 'success' })
  }

  const toggleEstado = (id: string) => {
    setUsers(users.map((u) => u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u))
  }

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    setToast({ message: 'Usuario eliminado.', type: 'success' })
  }

  const clearFilters = () => { setSearch(''); setFilterRol(''); setFilterEstado('') }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Nombre, cédula, correo, cargo..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <select value={filterRol} onChange={(e) => setFilterRol(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
        {(search || filterRol || filterEstado) && (
          <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-2.5 rounded text-xs transition-all"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            <Upload size={13} /> Importar
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2.5 rounded text-xs transition-all"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            <Download size={13} /> Exportar
          </button>
          <button onClick={() => { setForm({ ...EMPTY_FORM }); setErrors({}); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            <Plus size={13} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Usuario', 'Cédula', 'Correo', 'Cargo / Ciudad', 'Rol', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-display flex-shrink-0"
                      style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--gold)' }}>
                      {u.nombre.charAt(0)}
                    </div>
                    <div>
                      <p style={{ color: 'var(--foreground)' }}>{u.nombre}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{u.cedula}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--foreground)' }}>{u.correo}</td>
                <td className="px-5 py-3.5">
                  <p style={{ color: 'var(--foreground)' }}>{u.cargo}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{u.ciudad}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-1 rounded text-[10px]"
                    style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--gold)' }}>{u.rol}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                    style={{
                      background: u.estado === 'Activo' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: u.estado === 'Activo' ? '#4ade80' : '#f87171',
                    }}>
                    {u.estado}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button title="Editar" className="p-1.5 rounded transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Edit2 size={13} />
                    </button>
                    <button title={u.estado === 'Activo' ? 'Desactivar' : 'Activar'} onClick={() => toggleEstado(u.id)}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: u.estado === 'Activo' ? '#4ade80' : '#f87171' }}>
                      {u.estado === 'Activo' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button title="Eliminar" onClick={() => deleteUser(u.id)} className="p-1.5 rounded transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Sin resultados para los filtros aplicados.
              </td></tr>
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} usuario(s) encontrado(s)</p>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Usuario" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" required>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Ana María Pérez" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>
          <Field label="Cédula" required>
            <Input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} placeholder="Ej: 1023456789" />
            {errors.cedula && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.cedula}</p>}
          </Field>
          <Field label="Correo electrónico" required>
            <Input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="usuario@dominio.com" />
            {errors.correo && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.correo}</p>}
          </Field>
          <Field label="Teléfono">
            <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 315-1234567" />
          </Field>
          <Field label="Cargo" required>
            <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Ej: Supervisor de Sala" />
            {errors.cargo && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.cargo}</p>}
          </Field>
          <Field label="Ciudad">
            <Select value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })}>
              {CIUDADES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Rol" required>
            <Select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as 'Activo' | 'Inactivo' })}>
              <option>Activo</option><option>Inactivo</option>
            </Select>
          </Field>
          <Field label="Contraseña" required>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" />
            {errors.password && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.password}</p>}
          </Field>
          <Field label="Confirmar contraseña" required>
            <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repite la contraseña" />
            {errors.confirmPassword && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.confirmPassword}</p>}
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Crear Usuario
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
