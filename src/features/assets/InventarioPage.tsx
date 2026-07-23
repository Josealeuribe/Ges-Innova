import { useState } from 'react'
import { Search, Plus, Download, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, X, Image as ImageIcon } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'

const CLASIFICACIONES = ['Máquina', 'Equipo tecnológico', 'Mueble', 'Herramienta', 'Equipo de seguridad', 'Elemento locativo', 'Otro']
const ESTADOS_ACTIVO = ['Nuevo', 'Bueno', 'Regular', 'Malo', 'En mantenimiento', 'Fuera de servicio', 'Dado de baja']

interface Activo {
  id: string
  codigo: string
  nombre: string
  referencia: string
  clasificacion: string
  estado: string
  valor: number
  casino: string
  responsable: string
  fechaAdquisicion: string
  observaciones: string
  activo: boolean
  creado: string
}

const ACTIVOS_INIT: Activo[] = [
  { id: 'A-001', codigo: 'ACT-0001', nombre: 'Slot Machine IGT S2000', referencia: 'SN-IGT-20045', clasificacion: 'Máquina', estado: 'Bueno', valor: 45000000, casino: 'CAS-001', responsable: 'Carlos Medina', fechaAdquisicion: '2022-03-10', observaciones: 'Máquina importada de EE.UU.', activo: true, creado: '2022-03-10' },
  { id: 'A-002', codigo: 'ACT-0002', nombre: 'Ruleta Electrónica TCS', referencia: 'SN-TCS-00891', clasificacion: 'Máquina', estado: 'Nuevo', valor: 120000000, casino: 'CAS-001', responsable: 'Valentina Rincón', fechaAdquisicion: '2023-07-15', observaciones: 'Ruleta con pantalla táctil 55"', activo: true, creado: '2023-07-15' },
  { id: 'A-003', codigo: 'ACT-0003', nombre: 'Cámara PTZ Dahua 4K', referencia: 'SN-DHW-44231', clasificacion: 'Equipo de seguridad', estado: 'Bueno', valor: 3500000, casino: 'CAS-002', responsable: 'Andrés Torres', fechaAdquisicion: '2021-11-20', observaciones: 'Cámara domo de alta resolución', activo: true, creado: '2021-11-20' },
  { id: 'A-004', codigo: 'ACT-0004', nombre: 'Silla Ergonómica Steelcase', referencia: 'SN-STL-77821', clasificacion: 'Mueble', estado: 'Regular', valor: 1800000, casino: 'CAS-001', responsable: 'Luisa Fernández', fechaAdquisicion: '2020-05-01', observaciones: 'Silla para supervisores', activo: true, creado: '2020-05-01' },
  { id: 'A-005', codigo: 'ACT-0005', nombre: 'UPS APC Smart 3000VA', referencia: 'SN-APC-33109', clasificacion: 'Equipo tecnológico', estado: 'En mantenimiento', valor: 5200000, casino: 'CAS-002', responsable: 'Carlos Medina', fechaAdquisicion: '2022-09-08', observaciones: 'En revisión por técnico externo', activo: false, creado: '2022-09-08' },
]

const EMPTY = { codigo: '', nombre: '', referencia: '', clasificacion: 'Máquina', estado: 'Bueno', valor: '', casino: '', responsable: '', fechaAdquisicion: '', observaciones: '' }

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function InventarioPage() {
  const { razonesSociales, razonSocialActiva } = useApp()
  const [activos, setActivos] = useState<Activo[]>(ACTIVOS_INIT)
  const [search, setSearch] = useState('')
  const [filterClasif, setFilterClasif] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterActivo, setFilterActivo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [previewSerial, setPreviewSerial] = useState<string | null>(null)
  const [previewEstado, setPreviewEstado] = useState<string | null>(null)

  const handleFile = (field: 'serial' | 'estado', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (field === 'serial') setPreviewSerial(url)
    else setPreviewEstado(url)
  }

  const filtered = activos.filter((a) => {
    const q = search.toLowerCase()
    const matchQ = !q || a.codigo.toLowerCase().includes(q) || a.nombre.toLowerCase().includes(q) ||
      a.referencia.toLowerCase().includes(q) || a.responsable.toLowerCase().includes(q)
    const matchClasif = !filterClasif || a.clasificacion === filterClasif
    const matchEstado = !filterEstado || a.estado === filterEstado
    const matchActivo = !filterActivo || (filterActivo === 'activo' ? a.activo : !a.activo)
    return matchQ && matchClasif && matchEstado && matchActivo
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.codigo.trim()) e.codigo = 'Requerido'
    else if (activos.some((a) => a.codigo === form.codigo.trim())) e.codigo = 'Código ya registrado'
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.casino) e.casino = 'Requerido'
    if (!form.responsable.trim()) e.responsable = 'Requerido'
    if (!form.fechaAdquisicion) e.fechaAdquisicion = 'Requerido'
    else if (form.fechaAdquisicion > new Date().toISOString().split('T')[0]) e.fechaAdquisicion = 'No puede ser fecha futura'
    if (form.valor !== '' && Number(form.valor) < 0) e.valor = 'No puede ser negativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const nuevo: Activo = {
      id: `A-${String(activos.length + 1).padStart(3, '0')}`,
      codigo: form.codigo, nombre: form.nombre, referencia: form.referencia,
      clasificacion: form.clasificacion, estado: form.estado,
      valor: form.valor ? Number(form.valor) : 0,
      casino: form.casino, responsable: form.responsable,
      fechaAdquisicion: form.fechaAdquisicion, observaciones: form.observaciones,
      activo: true, creado: new Date().toISOString().split('T')[0],
    }
    setActivos([nuevo, ...activos])
    setModalOpen(false)
    setForm({ ...EMPTY })
    setErrors({})
    setPreviewSerial(null)
    setPreviewEstado(null)
    setToast({ message: `Activo "${nuevo.nombre}" registrado exitosamente.`, type: 'success' })
  }

  const clearFilters = () => { setSearch(''); setFilterClasif(''); setFilterEstado(''); setFilterActivo('') }
  const hasFilters = search || filterClasif || filterEstado || filterActivo

  const ESTADO_COLOR: Record<string, string> = {
    Nuevo: '#4ade80', Bueno: '#60a5fa', Regular: '#f59e0b', Malo: '#f87171',
    'En mantenimiento': '#c084fc', 'Fuera de servicio': '#f97316', 'Dado de baja': '#6b7280',
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Activos', value: activos.length, color: 'var(--gold)' },
          { label: 'Activos', value: activos.filter(a => a.activo).length, color: '#4ade80' },
          { label: 'En Mantenimiento', value: activos.filter(a => a.estado === 'En mantenimiento').length, color: '#c084fc' },
          { label: 'Fuera de Servicio', value: activos.filter(a => a.estado === 'Fuera de servicio').length, color: '#f87171' },
        ].map(c => (
          <div key={c.label} className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-mono-data text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] tracking-wide mt-1" style={{ color: 'var(--muted-foreground)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Código, nombre, serial, responsable..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <select value={filterClasif} onChange={e => setFilterClasif(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Clasificación</option>
          {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Estado</option>
          {ESTADOS_ACTIVO.map(e => <option key={e}>{e}</option>)}
        </select>
        <select value={filterActivo} onChange={e => setFilterActivo(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            <Download size={13} /> Exportar
          </button>
          <button onClick={() => { setForm({ ...EMPTY }); setErrors({}); setPreviewSerial(null); setPreviewEstado(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            <Plus size={13} /> Nuevo Activo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Código', 'Activo', 'Clasificación', 'Estado', 'Valor', 'Responsable', 'Adquisición', 'Fotos', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const estadoColor = ESTADO_COLOR[a.estado] || 'var(--muted-foreground)'
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: a.activo ? 1 : 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{a.codigo}</td>
                  <td className="px-4 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{a.nombre}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{a.referencia}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded text-[10px]"
                      style={{ background: 'rgba(200,168,75,0.08)', color: 'var(--gold-dim)' }}>
                      {a.clasificacion}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: estadoColor }} />
                      <span style={{ color: estadoColor }}>{a.estado}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono-data" style={{ color: 'var(--foreground)' }}>{fmt(a.valor)}</td>
                  <td className="px-4 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{a.responsable}</td>
                  <td className="px-4 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{a.fechaAdquisicion}</td>
                  <td className="px-4 py-3.5">
                    <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <ImageIcon size={13} />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button title="Ver" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Eye size={13} />
                      </button>
                      <button title="Editar" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Edit2 size={13} />
                      </button>
                      <button title={a.activo ? 'Desactivar' : 'Activar'}
                        onClick={() => setActivos(activos.map(x => x.id === a.id ? { ...x, activo: !x.activo } : x))}
                        style={{ color: a.activo ? '#4ade80' : '#f87171' }}>
                        {a.activo ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button title="Eliminar" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Sin activos para los filtros aplicados.
              </td></tr>
            )}
          </tbody>
        </table>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} activo(s) encontrado(s)</p>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Activo" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Photo uploads */}
          <Field label="Foto del serial">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-[10px] transition-all"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                <ImageIcon size={12} /> Adjuntar
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFile('serial', e)} />
              </label>
              {previewSerial && <img src={previewSerial} alt="Serial" className="w-10 h-10 object-cover rounded" />}
            </div>
          </Field>
          <Field label="Foto del estado actual">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-[10px] transition-all"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                <ImageIcon size={12} /> Adjuntar
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFile('estado', e)} />
              </label>
              {previewEstado && <img src={previewEstado} alt="Estado" className="w-10 h-10 object-cover rounded" />}
            </div>
          </Field>

          <Field label="Código" required>
            <Input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="ACT-0006" />
            {errors.codigo && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.codigo}</p>}
          </Field>
          <Field label="Nombre" required>
            <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del activo" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>
          <Field label="Referencia / Serial">
            <Input value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} placeholder="Serial del fabricante" />
          </Field>
          <Field label="Clasificación">
            <Select value={form.clasificacion} onChange={e => setForm({ ...form, clasificacion: e.target.value })}>
              {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Estado del activo">
            <Select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              {ESTADOS_ACTIVO.map(e => <option key={e}>{e}</option>)}
            </Select>
          </Field>
          <Field label="Valor (COP)">
            <Input type="number" min="0" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0" />
            {errors.valor && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.valor}</p>}
          </Field>
          <Field label="Casino" required>
            <Input value={form.casino} onChange={e => setForm({ ...form, casino: e.target.value })} placeholder="Ej: CAS-001" />
            {errors.casino && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.casino}</p>}
          </Field>
          <Field label="Responsable" required>
            <Input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre del responsable" />
            {errors.responsable && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.responsable}</p>}
          </Field>
          <Field label="Fecha de adquisición" required>
            <Input type="date" value={form.fechaAdquisicion} max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, fechaAdquisicion: e.target.value })} />
            {errors.fechaAdquisicion && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.fechaAdquisicion}</p>}
          </Field>
          <Field label="Observaciones">
            <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Estado físico, ubicación, garantía..." rows={2}
              className="w-full px-3 py-2.5 rounded text-xs outline-none resize-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Registrar Activo
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
