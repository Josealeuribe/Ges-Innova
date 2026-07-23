import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'

interface Casino {
  id: string
  nombre: string
  direccion: string
  codigoDane: string
  razonSocialId: string
  codigoEstablecimiento: string
  estado: 'Activo' | 'Inactivo'
}

const INITIAL_CASINOS: Casino[] = [
  { id: 'CAS-001', nombre: 'Innova Club — Sede Norte', direccion: 'Av. 19 #123-45, Bogotá', codigoDane: '11001', razonSocialId: 'RS-001', codigoEstablecimiento: 'EST-0901', estado: 'Activo' },
  { id: 'CAS-002', nombre: 'Innova Club — Sede Sur', direccion: 'Cll 40 Sur #72-30, Bogotá', codigoDane: '11001', razonSocialId: 'RS-001', codigoEstablecimiento: 'EST-0902', estado: 'Activo' },
  { id: 'CAS-003', nombre: 'Casino Norte Centro', direccion: 'Av. 68 #12-10, Bogotá', codigoDane: '11001', razonSocialId: 'RS-002', codigoEstablecimiento: 'EST-0441', estado: 'Activo' },
  { id: 'CAS-004', nombre: 'Operadora Sur — Medellín', direccion: 'Cll 80 #22-45, Medellín', codigoDane: '05001', razonSocialId: 'RS-003', codigoEstablecimiento: 'EST-1102', estado: 'Inactivo' },
]

const EMPTY = { nombre: '', direccion: '', codigoDane: '', razonSocialId: '', codigoEstablecimiento: '' }

export default function CasinosPage() {
  const { razonesSociales } = useApp()
  const [casinos, setCasinos] = useState<Casino[]>(INITIAL_CASINOS)
  const [search, setSearch] = useState('')
  const [filterRS, setFilterRS] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = casinos.filter((c) => {
    const q = search.toLowerCase()
    const matchQ = !q || c.nombre.toLowerCase().includes(q) || c.direccion.toLowerCase().includes(q) || c.codigoEstablecimiento.toLowerCase().includes(q) || c.codigoDane.includes(q)
    const matchRS = !filterRS || c.razonSocialId === filterRS
    return matchQ && matchRS
  })

  const getRazonNombre = (id: string) => razonesSociales.find((r) => r.id === id)?.nombre || id

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.direccion.trim()) e.direccion = 'Requerido'
    if (!form.codigoDane.trim()) e.codigoDane = 'Requerido'
    if (!form.razonSocialId) e.razonSocialId = 'Selecciona una razón social'
    if (!form.codigoEstablecimiento.trim()) e.codigoEstablecimiento = 'Requerido'
    else if (casinos.some((c) => c.codigoEstablecimiento === form.codigoEstablecimiento.trim()))
      e.codigoEstablecimiento = 'Código ya registrado'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const nuevo: Casino = {
      id: `CAS-${String(casinos.length + 1).padStart(3, '0')}`,
      nombre: form.nombre,
      direccion: form.direccion,
      codigoDane: form.codigoDane,
      razonSocialId: form.razonSocialId,
      codigoEstablecimiento: form.codigoEstablecimiento,
      estado: 'Activo',
    }
    setCasinos([nuevo, ...casinos])
    setModalOpen(false)
    setForm({ ...EMPTY })
    setErrors({})
    setToast({ message: `Casino "${nuevo.nombre}" registrado exitosamente.`, type: 'success' })
  }

  const toggleEstado = (id: string) =>
    setCasinos(casinos.map((c) => c.id === id ? { ...c, estado: c.estado === 'Activo' ? 'Inactivo' : 'Activo' } : c))

  const deleteCasino = (id: string) => {
    setCasinos(casinos.filter((c) => c.id !== id))
    setToast({ message: 'Casino eliminado.', type: 'success' })
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Nombre, dirección, código DANE, establecimiento..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <select value={filterRS} onChange={(e) => setFilterRS(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Todas las razones sociales</option>
          {razonesSociales.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        {(search || filterRS) && (
          <button onClick={() => { setSearch(''); setFilterRS('') }} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <button onClick={() => { setForm({ ...EMPTY }); setErrors({}); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Plus size={13} /> Nuevo Casino
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Casino', 'Dirección', 'Cód. DANE', 'Razón Social', 'Cód. Estab.', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td className="px-5 py-4">
                  <p style={{ color: 'var(--foreground)' }}>{c.nombre}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{c.id}</p>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{c.direccion}</td>
                <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{c.codigoDane}</td>
                <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>{getRazonNombre(c.razonSocialId)}</td>
                <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--gold)' }}>{c.codigoEstablecimiento}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                    style={{
                      background: c.estado === 'Activo' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: c.estado === 'Activo' ? '#4ade80' : '#f87171',
                    }}>{c.estado}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => toggleEstado(c.id)}
                      style={{ color: c.estado === 'Activo' ? '#4ade80' : '#f87171' }}>
                      {c.estado === 'Activo' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => deleteCasino(c.id)} className="p-1.5 rounded"
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
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} casino(s) encontrado(s)</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Casino">
        <div className="space-y-4">
          <Field label="Nombre del Casino" required>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Innova Club — Sede Centro" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>
          <Field label="Dirección" required>
            <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Cra 15 #48-32, Bogotá" />
            {errors.direccion && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.direccion}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código DANE" required>
              <Input value={form.codigoDane} onChange={(e) => setForm({ ...form, codigoDane: e.target.value })} placeholder="Ej: 11001" />
              {errors.codigoDane && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.codigoDane}</p>}
            </Field>
            <Field label="Código Establecimiento" required>
              <Input value={form.codigoEstablecimiento} onChange={(e) => setForm({ ...form, codigoEstablecimiento: e.target.value })} placeholder="Ej: EST-1201" />
              {errors.codigoEstablecimiento && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.codigoEstablecimiento}</p>}
            </Field>
          </div>
          <Field label="Razón Social" required>
            <Select value={form.razonSocialId} onChange={(e) => setForm({ ...form, razonSocialId: e.target.value })}>
              <option value="">— Seleccionar —</option>
              {razonesSociales.filter((r) => r.estado === 'Activa').map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </Select>
            {errors.razonSocialId && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.razonSocialId}</p>}
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Registrar Casino
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
