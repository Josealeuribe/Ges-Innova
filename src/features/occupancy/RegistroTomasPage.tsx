import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, Clock } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'

const TIPOS_TOMA = ['Manual', 'Automática', 'Apertura', 'Control periódico', 'Cierre', 'Extraordinaria']
const ZONAS = ['Sala Principal', 'Sala VIP', 'Sala Lounge', 'Zona de Ruletas', 'Zona de Póker', 'Bar / Lounge', 'Acceso / Entrada']

interface Toma {
  id: string
  razonSocial: string
  casino: string
  fecha: string
  hora: string
  jugadores: number
  zona: string
  tipo: string
  responsable: string
  observaciones: string
  estado: 'Activa' | 'Anulada'
  creado: string
}

const TOMAS_INIT: Toma[] = [
  { id: 'TOM-001', razonSocial: 'Innova Club S.A.S', casino: 'Sede Norte', fecha: '2026-07-22', hora: '22:00', jugadores: 148, zona: 'Sala Principal', tipo: 'Control periódico', responsable: 'Valentina Rincón', observaciones: 'Toma nocturna de rutina', estado: 'Activa', creado: '2026-07-22 22:01' },
  { id: 'TOM-002', razonSocial: 'Innova Club S.A.S', casino: 'Sede Norte', fecha: '2026-07-22', hora: '20:00', jugadores: 192, zona: 'Sala Principal', tipo: 'Control periódico', responsable: 'Valentina Rincón', observaciones: '', estado: 'Activa', creado: '2026-07-22 20:01' },
  { id: 'TOM-003', razonSocial: 'Innova Club S.A.S', casino: 'Sede Norte', fecha: '2026-07-22', hora: '18:00', jugadores: 87, zona: 'Sala VIP', tipo: 'Control periódico', responsable: 'Valentina Rincón', observaciones: '', estado: 'Activa', creado: '2026-07-22 18:02' },
  { id: 'TOM-004', razonSocial: 'Innova Club S.A.S', casino: 'Sede Sur', fecha: '2026-07-22', hora: '21:00', jugadores: 63, zona: 'Sala Principal', tipo: 'Manual', responsable: 'Carlos Medina', observaciones: 'Conteo manual solicitado por gerencia', estado: 'Activa', creado: '2026-07-22 21:03' },
  { id: 'TOM-005', razonSocial: 'Innova Club S.A.S', casino: 'Sede Norte', fecha: '2026-07-21', hora: '23:00', jugadores: 221, zona: 'Sala Principal', tipo: 'Cierre', responsable: 'Valentina Rincón', observaciones: 'Máxima ocupación del día', estado: 'Activa', creado: '2026-07-21 23:01' },
  { id: 'TOM-006', razonSocial: 'Casino Norte Ltda.', casino: 'Casino Norte Centro', fecha: '2026-07-22', hora: '19:30', jugadores: 44, zona: 'Zona de Ruletas', tipo: 'Control periódico', responsable: 'Andrés Torres', observaciones: '', estado: 'Anulada', creado: '2026-07-22 19:31' },
]

const EMPTY = { razonSocial: '', casino: '', fecha: '', hora: '', jugadores: '', zona: 'Sala Principal', tipo: 'Control periódico', responsable: '', observaciones: '' }

export default function RegistroTomasPage() {
  const { razonesSociales, razonSocialActiva } = useApp()
  const [tomas, setTomas] = useState<Toma[]>(TOMAS_INIT)
  const [search, setSearch] = useState('')
  const [filterZona, setFilterZona] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY, razonSocial: razonSocialActiva.nombre })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = tomas.filter((t) => {
    const q = search.toLowerCase()
    const matchQ = !q || t.casino.toLowerCase().includes(q) || t.zona.toLowerCase().includes(q) || t.responsable.toLowerCase().includes(q)
    const matchZona = !filterZona || t.zona === filterZona
    const matchTipo = !filterTipo || t.tipo === filterTipo
    const matchEstado = !filterEstado || t.estado === filterEstado
    return matchQ && matchZona && matchTipo && matchEstado
  })

  const now = new Date()
  const maxDateTime = `${now.toISOString().split('T')[0]}T${now.toTimeString().slice(0, 5)}`

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.casino.trim()) e.casino = 'Requerido'
    if (!form.fecha) e.fecha = 'Requerido'
    if (!form.hora) e.hora = 'Requerido'
    if (!form.jugadores) e.jugadores = 'Requerido'
    else if (Number(form.jugadores) < 0) e.jugadores = 'No puede ser negativo'
    if (!form.responsable.trim()) e.responsable = 'Requerido'
    // Check future datetime
    if (form.fecha && form.hora) {
      const dt = new Date(`${form.fecha}T${form.hora}`)
      if (dt > now) e.hora = 'No puede ser una fecha/hora futura'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const nueva: Toma = {
      id: `TOM-${String(tomas.length + 1).padStart(3, '0')}`,
      razonSocial: form.razonSocial || razonSocialActiva.nombre,
      casino: form.casino, fecha: form.fecha, hora: form.hora,
      jugadores: Number(form.jugadores), zona: form.zona, tipo: form.tipo,
      responsable: form.responsable, observaciones: form.observaciones,
      estado: 'Activa', creado: new Date().toLocaleString('es-CO'),
    }
    setTomas([nueva, ...tomas])
    setModalOpen(false)
    setForm({ ...EMPTY, razonSocial: razonSocialActiva.nombre })
    setErrors({})
    setToast({ message: `Toma registrada: ${nueva.jugadores} jugadores en ${nueva.zona}.`, type: 'success' })
  }

  const clearFilters = () => { setSearch(''); setFilterZona(''); setFilterTipo(''); setFilterEstado('') }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tomas Hoy', value: tomas.filter(t => t.fecha === now.toISOString().split('T')[0] && t.estado === 'Activa').length, color: 'var(--gold)' },
          { label: 'Jugadores Ahora', value: tomas.find(t => t.fecha === now.toISOString().split('T')[0] && t.estado === 'Activa')?.jugadores || 0, color: '#4ade80' },
          { label: 'Máx. del Día', value: Math.max(...tomas.filter(t => t.fecha === now.toISOString().split('T')[0] && t.estado === 'Activa').map(t => t.jugadores), 0), color: '#60a5fa' },
          { label: 'Tomas Anuladas', value: tomas.filter(t => t.estado === 'Anulada').length, color: '#f87171' },
        ].map(c => (
          <div key={c.label} className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-mono-data text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Casino, zona, responsable..." value={search}
            onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <select value={filterZona} onChange={e => setFilterZona(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Zona</option>
          {ZONAS.map(z => <option key={z}>{z}</option>)}
        </select>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Tipo</option>
          {TIPOS_TOMA.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Estado</option>
          <option>Activa</option><option>Anulada</option>
        </select>
        {(search || filterZona || filterTipo || filterEstado) && (
          <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <button onClick={() => { setForm({ ...EMPTY, razonSocial: razonSocialActiva.nombre }); setErrors({}); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Plus size={13} /> Nueva Toma
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Casino', 'Fecha / Hora', 'Zona', 'Tipo', 'Jugadores', 'Responsable', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: t.estado === 'Anulada' ? 0.5 : 1 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="px-5 py-3.5">
                  <p style={{ color: 'var(--foreground)' }}>{t.casino}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{t.razonSocial}</p>
                </td>
                <td className="px-5 py-3.5">
                  <p style={{ color: 'var(--foreground)' }}>{t.fecha}</p>
                  <p className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    <Clock size={10} /> {t.hora}
                  </p>
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{t.zona}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-1 rounded text-[10px]"
                    style={{ background: 'rgba(200,168,75,0.08)', color: 'var(--gold-dim)' }}>{t.tipo}</span>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-mono-data text-base font-bold" style={{ color: 'var(--gold)' }}>{t.jugadores}</p>
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{t.responsable}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                    style={{
                      background: t.estado === 'Activa' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: t.estado === 'Activa' ? '#4ade80' : '#f87171',
                    }}>{t.estado}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <Eye size={13} />
                    </button>
                    {t.estado === 'Activa' && (
                      <>
                        <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                          <Edit2 size={13} />
                        </button>
                        <button className="p-1.5 rounded" title="Anular"
                          onClick={() => { setTomas(tomas.map(x => x.id === t.id ? { ...x, estado: 'Anulada' } : x)); setToast({ message: 'Toma anulada.', type: 'success' }) }}
                          style={{ color: 'var(--muted-foreground)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} toma(s) encontrada(s)</p>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Toma de Ocupación">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Razón Social">
            <Select value={form.razonSocial} onChange={e => setForm({ ...form, razonSocial: e.target.value })}>
              {razonesSociales.filter(r => r.estado === 'Activa').map(r => <option key={r.id}>{r.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Casino" required>
            <Input value={form.casino} onChange={e => setForm({ ...form, casino: e.target.value })} placeholder="Nombre del casino" />
            {errors.casino && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.casino}</p>}
          </Field>
          <Field label="Fecha" required>
            <Input type="date" value={form.fecha} max={now.toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, fecha: e.target.value })} />
            {errors.fecha && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.fecha}</p>}
          </Field>
          <Field label="Hora" required>
            <Input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
            {errors.hora && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.hora}</p>}
          </Field>
          <Field label="Cantidad de jugadores" required>
            <Input type="number" min="0" value={form.jugadores} onChange={e => setForm({ ...form, jugadores: e.target.value })} placeholder="0" />
            {errors.jugadores && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.jugadores}</p>}
          </Field>
          <Field label="Zona / Área">
            <Select value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })}>
              {ZONAS.map(z => <option key={z}>{z}</option>)}
            </Select>
          </Field>
          <Field label="Tipo de toma">
            <Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS_TOMA.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Responsable" required>
            <Input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre del responsable" />
            {errors.responsable && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.responsable}</p>}
          </Field>
          <div className="sm:col-span-2">
            <Field label="Observaciones">
              <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Notas sobre la toma..." rows={2}
                className="w-full px-3 py-2.5 rounded text-xs outline-none resize-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Registrar Toma
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
