import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Eye } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'

interface ReglaPUC {
  id: string
  nombre: string
  concepto: string
  cuentaContable: string
  tipoDocumento: string
  proveedor: string
  nit: string
  razonSocialId: string
  estado: 'Activa' | 'Inactiva'
  creado: string
}

const TIPOS_DOC = ['Factura Electrónica', 'Nota Crédito', 'Nota Débito', 'Recibo de Caja', 'Egreso']

const INITIAL_REGLAS: ReglaPUC[] = [
  { id: 'PUC-001', nombre: 'Compras de suministros TI', concepto: 'Gasto TI', cuentaContable: '5135-01', tipoDocumento: 'Factura Electrónica', proveedor: 'Proveedor Tecnología S.A.S', nit: '900123456-1', razonSocialId: 'RS-001', estado: 'Activa', creado: '2024-02-01' },
  { id: 'PUC-002', nombre: 'Mantenimiento equipos casino', concepto: 'Mantenimiento', cuentaContable: '5140-02', tipoDocumento: 'Factura Electrónica', proveedor: 'Equipos Casino S.A.', nit: '900987654-2', razonSocialId: 'RS-001', estado: 'Activa', creado: '2024-03-10' },
  { id: 'PUC-003', nombre: 'Servicios públicos sede norte', concepto: 'Servicios Públicos', cuentaContable: '5160-01', tipoDocumento: 'Factura Electrónica', proveedor: 'Empresa de Energía', nit: '899999254-0', razonSocialId: 'RS-002', estado: 'Activa', creado: '2024-01-15' },
  { id: 'PUC-004', nombre: 'Devolución compra suministros', concepto: 'Devolución', cuentaContable: '4175-01', tipoDocumento: 'Nota Crédito', proveedor: 'Distribuciones Norte Ltda.', nit: '800456789-0', razonSocialId: 'RS-001', estado: 'Inactiva', creado: '2024-04-20' },
]

const EMPTY = { nombre: '', concepto: '', cuentaContable: '', tipoDocumento: 'Factura Electrónica', proveedor: '', nit: '', razonSocialId: '' }

export default function ReglasPUCPage() {
  const { razonesSociales, razonSocialActiva } = useApp()
  const [reglas, setReglas] = useState<ReglaPUC[]>(INITIAL_REGLAS)
  const [search, setSearch] = useState('')
  const [filterRS, setFilterRS] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = reglas.filter((r) => {
    const q = search.toLowerCase()
    const matchQ = !q || r.nombre.toLowerCase().includes(q) || r.concepto.toLowerCase().includes(q) || r.cuentaContable.includes(q) || r.proveedor.toLowerCase().includes(q) || r.nit.includes(q)
    const matchRS = !filterRS || r.razonSocialId === filterRS
    const matchEstado = !filterEstado || r.estado === filterEstado
    return matchQ && matchRS && matchEstado
  })

  const getRazonNombre = (id: string) => razonesSociales.find((r) => r.id === id)?.nombre || id

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.concepto.trim()) e.concepto = 'Requerido'
    if (!form.cuentaContable.trim()) e.cuentaContable = 'Requerido'
    if (!form.proveedor.trim()) e.proveedor = 'Requerido'
    if (!form.nit.trim()) e.nit = 'Requerido'
    if (!form.razonSocialId) e.razonSocialId = 'Selecciona una razón social'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const nueva: ReglaPUC = {
      id: `PUC-${String(reglas.length + 1).padStart(3, '0')}`,
      ...form,
      estado: 'Activa',
      creado: new Date().toISOString().split('T')[0],
    }
    setReglas([nueva, ...reglas])
    setModalOpen(false)
    setForm({ ...EMPTY })
    setErrors({})
    setToast({ message: `Regla PUC "${nueva.nombre}" creada exitosamente.`, type: 'success' })
  }

  const toggleEstado = (id: string) =>
    setReglas(reglas.map((r) => r.id === id ? { ...r, estado: r.estado === 'Activa' ? 'Inactiva' : 'Activa' } : r))

  const deleteRegla = (id: string) => {
    setReglas(reglas.filter((r) => r.id !== id))
    setToast({ message: 'Regla PUC eliminada.', type: 'success' })
  }

  const clearFilters = () => { setSearch(''); setFilterRS(''); setFilterEstado('') }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Nombre, concepto, cuenta, proveedor, NIT..." value={search}
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
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Todos los estados</option>
          <option>Activa</option>
          <option>Inactiva</option>
        </select>
        {(search || filterRS || filterEstado) && (
          <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <button onClick={() => { setForm({ ...EMPTY, razonSocialId: razonSocialActiva.id }); setErrors({}); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Plus size={13} /> Nueva Regla PUC
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Nombre / Concepto', 'Cuenta Contable', 'Tipo Doc.', 'Proveedor / NIT', 'Razón Social', 'Estado', 'Acciones'].map((h) => (
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
                <td className="px-5 py-3.5">
                  <p style={{ color: 'var(--foreground)' }}>{r.nombre}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{r.concepto} · {r.id}</p>
                </td>
                <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{r.cuentaContable}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{r.tipoDocumento}</td>
                <td className="px-5 py-3.5">
                  <p style={{ color: 'var(--foreground)' }}>{r.proveedor}</p>
                  <p className="font-mono-data" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{r.nit}</p>
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{getRazonNombre(r.razonSocialId)}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                    style={{
                      background: r.estado === 'Activa' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: r.estado === 'Activa' ? '#4ade80' : '#f87171',
                    }}>{r.estado}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button title="Ver detalle" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Eye size={13} />
                    </button>
                    <button title="Editar" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => toggleEstado(r.id)}
                      style={{ color: r.estado === 'Activa' ? '#4ade80' : '#f87171' }}>
                      {r.estado === 'Activa' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => deleteRegla(r.id)} className="p-1.5 rounded"
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
                Sin reglas PUC para los filtros aplicados.
              </td></tr>
            )}
          </tbody>
        </table>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} regla(s) PUC encontrada(s)</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Regla PUC" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la regla" required>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Compra materiales de oficina" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>
          <Field label="Concepto contable" required>
            <Input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Ej: Gastos de papelería" />
            {errors.concepto && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.concepto}</p>}
          </Field>
          <Field label="Cuenta Contable (PUC)" required>
            <Input value={form.cuentaContable} onChange={(e) => setForm({ ...form, cuentaContable: e.target.value })} placeholder="Ej: 5135-01" />
            {errors.cuentaContable && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.cuentaContable}</p>}
          </Field>
          <Field label="Tipo de documento" required>
            <Select value={form.tipoDocumento} onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}>
              {TIPOS_DOC.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Proveedor" required>
            <Input value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} placeholder="Nombre del proveedor" />
            {errors.proveedor && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.proveedor}</p>}
          </Field>
          <Field label="NIT del proveedor" required>
            <Input value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} placeholder="Ej: 900123456-1" />
            {errors.nit && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nit}</p>}
          </Field>
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
            Crear Regla PUC
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
