import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, AlertTriangle } from 'lucide-react'
import Modal, { Field, Input, Toast } from '@/components/Modal'
import { useApp, type RazonSocial } from '@/context/AppContext'

export default function RazonesSocialesPage() {
  const { razonesSociales, setRazonesSociales, razonSocialActiva } = useApp()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', direccion: '', correo: '', telefono: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = razonesSociales.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.nombre.toLowerCase().includes(q) || r.direccion.toLowerCase().includes(q) || r.correo.toLowerCase().includes(q)
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.direccion.trim()) e.direccion = 'Requerido'
    if (!form.correo.trim()) e.correo = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Formato inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const nueva: RazonSocial = {
      id: `RS-${String(razonesSociales.length + 1).padStart(3, '0')}`,
      nombre: form.nombre,
      direccion: form.direccion,
      correo: form.correo,
      telefono: form.telefono,
      estado: 'Activa',
    }
    setRazonesSociales([...razonesSociales, nueva])
    setModalOpen(false)
    setForm({ nombre: '', direccion: '', correo: '', telefono: '' })
    setErrors({})
    setToast({ message: `Razón social "${nueva.nombre}" registrada exitosamente.`, type: 'success' })
  }

  const toggleEstado = (id: string) => {
    if (razonSocialActiva.id === id) {
      setToast({ message: 'No puedes desactivar la razón social actualmente activa.', type: 'error' })
      return
    }
    setRazonesSociales(razonesSociales.map((r) =>
      r.id === id ? { ...r, estado: r.estado === 'Activa' ? 'Inactiva' : 'Activa' } : r
    ))
  }

  const deleteRS = (r: RazonSocial) => {
    if (razonSocialActiva.id === r.id) {
      setToast({ message: 'No puedes eliminar la razón social activa. Cambia primero la selección.', type: 'error' })
      return
    }
    setRazonesSociales(razonesSociales.filter((x) => x.id !== r.id))
    setToast({ message: 'Razón social eliminada.', type: 'success' })
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Info activa */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg"
        style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid var(--gold-dim)' }}>
        <AlertTriangle size={14} style={{ color: 'var(--gold)', marginTop: 1, flexShrink: 0 }} />
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Razón social activa en el sistema:{' '}
          <span className="font-semibold" style={{ color: 'var(--gold)' }}>{razonSocialActiva.nombre}</span>.
          Para cambiar, usa el selector en la barra superior.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Buscar por nombre, dirección, correo..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <button onClick={() => { setForm({ nombre: '', direccion: '', correo: '', telefono: '' }); setErrors({}); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Plus size={13} /> Nueva Razón Social
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Razón Social', 'Dirección', 'Correo', 'Teléfono', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isActiva = razonSocialActiva.id === r.id
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isActiva ? 'rgba(200,168,75,0.04)' : 'transparent' }}
                  onMouseEnter={(e) => { if (!isActiva) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isActiva ? 'rgba(200,168,75,0.04)' : 'transparent' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p style={{ color: 'var(--foreground)' }}>{r.nombre}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{r.id}</p>
                      </div>
                      {isActiva && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wider"
                          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
                          ACTIVA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{r.direccion}</td>
                  <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>{r.correo}</td>
                  <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{r.telefono}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{
                        background: r.estado === 'Activa' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        color: r.estado === 'Activa' ? '#4ade80' : '#f87171',
                      }}>{r.estado}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => toggleEstado(r.id)}
                        style={{ color: r.estado === 'Activa' ? '#4ade80' : '#f87171' }}>
                        {r.estado === 'Activa' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => deleteRS(r)} className="p-1.5 rounded"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} razón(es) social(es)</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Razón Social">
        <div className="space-y-4">
          <Field label="Nombre / Razón Social" required>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Operadora Nacional S.A.S" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>
          <Field label="Dirección" required>
            <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Ej: Cra 7 #32-15, Bogotá" />
            {errors.direccion && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.direccion}</p>}
          </Field>
          <Field label="Correo electrónico" required>
            <Input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="contacto@empresa.co" />
            {errors.correo && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.correo}</p>}
          </Field>
          <Field label="Teléfono">
            <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 601-1234567" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Registrar
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
