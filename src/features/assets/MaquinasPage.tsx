import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, FileText, X, Download } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'

const TIPOS_MAQUINA = ['Slot Mecánica', 'Slot Video', 'Ruleta Electrónica', 'Terminal Lotería', 'Póker Electrónico', 'Bingo Electrónico']
const PROTOCOLOS = ['SAS', 'G2S', 'SAS + G2S', 'Propietario', 'Otro']
const MARCAS = ['IGT', 'Aristocrat', 'Novomatic', 'WMS', 'Bally', 'Ainsworth', 'TCSJohnHuxley', 'Konami']
const PAISES = ['Estados Unidos', 'Australia', 'Austria', 'Alemania', 'España', 'Japón', 'Corea del Sur']

interface Maquina {
  id: string
  activoId: string
  activoNombre: string
  casino: string
  serial: string
  numeroInterno: string
  nuc: string
  nuid: string
  marca: string
  modelo: string
  paisOrigen: string
  fechaFabricacion: string
  tipoMaquina: string
  codigoApuesta: string
  juegoMisterioso: 'Sí' | 'No'
  proveedorSCLM: string
  laboratorio: string
  sclm: string
  protocolo: string
  topeRollover: number
  estado: 'Activa' | 'Inactiva' | 'Mantenimiento'
}

const MAQUINAS_INIT: Maquina[] = [
  { id: 'M-001', activoId: 'A-001', activoNombre: 'Slot Machine IGT S2000', casino: 'CAS-001', serial: 'SN-IGT-20045', numeroInterno: 'NI-0001', nuc: 'NUC-44201', nuid: 'NUID-887A', marca: 'IGT', modelo: 'S2000', paisOrigen: 'Estados Unidos', fechaFabricacion: '2020-06-15', tipoMaquina: 'Slot Video', codigoApuesta: 'CA-001', juegoMisterioso: 'No', proveedorSCLM: 'SistemaSLM', laboratorio: 'GLI', sclm: 'SCLM-A', protocolo: 'SAS', topeRollover: 5000000, estado: 'Activa' },
  { id: 'M-002', activoId: 'A-002', activoNombre: 'Ruleta Electrónica TCS', casino: 'CAS-001', serial: 'SN-TCS-00891', numeroInterno: 'NI-0002', nuc: 'NUC-55810', nuid: 'NUID-991B', marca: 'TCSJohnHuxley', modelo: 'TouchBet Roulette', paisOrigen: 'Australia', fechaFabricacion: '2022-11-20', tipoMaquina: 'Ruleta Electrónica', codigoApuesta: 'CA-002', juegoMisterioso: 'No', proveedorSCLM: 'SistemaSLM', laboratorio: 'BMM', sclm: 'SCLM-B', protocolo: 'G2S', topeRollover: 10000000, estado: 'Activa' },
]

const EMPTY = {
  activoId: '', casino: '', serial: '', numeroInterno: '', nuc: '', nuid: '',
  marca: 'IGT', modelo: '', paisOrigen: 'Estados Unidos', fechaFabricacion: '',
  tipoMaquina: 'Slot Video', codigoApuesta: '', juegoMisterioso: 'No' as 'Sí' | 'No',
  proveedorSCLM: '', laboratorio: '', sclm: '', protocolo: 'SAS', topeRollover: '',
}

const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const ESTADO_STYLE: Record<string, { color: string; bg: string }> = {
  Activa: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  Inactiva: { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  Mantenimiento: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

export default function MaquinasPage() {
  const { razonSocialActiva } = useApp()
  const [maquinas, setMaquinas] = useState<Maquina[]>(MAQUINAS_INIT)
  const [search, setSearch] = useState('')
  const [filterMarca, setFilterMarca] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)

  const filtered = maquinas.filter((m) => {
    const q = search.toLowerCase()
    const matchQ = !q || m.serial.toLowerCase().includes(q) || m.numeroInterno.toLowerCase().includes(q) ||
      m.nuc.toLowerCase().includes(q) || m.marca.toLowerCase().includes(q) || m.modelo.toLowerCase().includes(q) ||
      m.activoNombre.toLowerCase().includes(q)
    const matchMarca = !filterMarca || m.marca === filterMarca
    const matchTipo = !filterTipo || m.tipoMaquina === filterTipo
    const matchEstado = !filterEstado || m.estado === filterEstado
    return matchQ && matchMarca && matchTipo && matchEstado
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.activoId.trim()) e.activoId = 'Requerido'
    if (!form.casino.trim()) e.casino = 'Requerido'
    if (!form.serial.trim()) e.serial = 'Requerido'
    else if (maquinas.some(m => m.serial === form.serial.trim())) e.serial = 'Serial ya registrado'
    if (!form.numeroInterno.trim()) e.numeroInterno = 'Requerido'
    if (form.fechaFabricacion && form.fechaFabricacion > new Date().toISOString().split('T')[0])
      e.fechaFabricacion = 'No puede ser posterior a hoy'
    if (form.topeRollover !== '' && Number(form.topeRollover) < 0) e.topeRollover = 'No puede ser negativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const nueva: Maquina = {
      id: `M-${String(maquinas.length + 1).padStart(3, '0')}`,
      activoId: form.activoId, activoNombre: `Activo ${form.activoId}`,
      casino: form.casino, serial: form.serial, numeroInterno: form.numeroInterno,
      nuc: form.nuc, nuid: form.nuid, marca: form.marca, modelo: form.modelo,
      paisOrigen: form.paisOrigen, fechaFabricacion: form.fechaFabricacion,
      tipoMaquina: form.tipoMaquina, codigoApuesta: form.codigoApuesta,
      juegoMisterioso: form.juegoMisterioso, proveedorSCLM: form.proveedorSCLM,
      laboratorio: form.laboratorio, sclm: form.sclm, protocolo: form.protocolo,
      topeRollover: form.topeRollover ? Number(form.topeRollover) : 0,
      estado: 'Activa',
    }
    setMaquinas([nueva, ...maquinas])
    setModalOpen(false)
    setForm({ ...EMPTY })
    setErrors({})
    setDocFile(null)
    setToast({ message: `Máquina "${nueva.serial}" registrada exitosamente.`, type: 'success' })
  }

  const clearFilters = () => { setSearch(''); setFilterMarca(''); setFilterTipo(''); setFilterEstado('') }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Máquinas', value: maquinas.length, color: 'var(--gold)' },
          { label: 'Activas', value: maquinas.filter(m => m.estado === 'Activa').length, color: '#4ade80' },
          { label: 'En Mantenimiento', value: maquinas.filter(m => m.estado === 'Mantenimiento').length, color: '#f59e0b' },
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
          <input type="text" placeholder="Serial, NUC, NUID, marca, modelo, activo..." value={search}
            onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <select value={filterMarca} onChange={e => setFilterMarca(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Marca</option>
          {MARCAS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Tipo</option>
          {TIPOS_MAQUINA.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Estado</option>
          <option>Activa</option><option>Inactiva</option><option>Mantenimiento</option>
        </select>
        {(search || filterMarca || filterTipo || filterEstado) && (
          <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <button onClick={() => { setForm({ ...EMPTY }); setErrors({}); setDocFile(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Plus size={13} /> Nueva Máquina
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Serial / N° Int.', 'Activo', 'Marca / Modelo', 'Tipo', 'NUC / NUID', 'Protocolo', 'Rollover', 'Estado', 'Doc.', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const s = ESTADO_STYLE[m.estado]
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3.5">
                    <p className="font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{m.serial}</p>
                    <p className="font-mono-data" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{m.numeroInterno}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{m.activoNombre}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{m.casino}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{m.marca}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{m.modelo}</p>
                  </td>
                  <td className="px-4 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{m.tipoMaquina}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-mono-data" style={{ color: 'var(--foreground)', fontSize: '10px' }}>{m.nuc}</p>
                    <p className="font-mono-data" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{m.nuid}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded text-[10px]"
                      style={{ background: 'rgba(200,168,75,0.08)', color: 'var(--gold-dim)' }}>{m.protocolo}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono-data" style={{ color: 'var(--foreground)' }}>{fmt(m.topeRollover)}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{ background: s.bg, color: s.color }}>{m.estado}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }} title="Ver documento legal"
                      onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                      <FileText size={13} />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Eye size={13} />
                      </button>
                      <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setMaquinas(maquinas.map(x => x.id === m.id ? { ...x, estado: x.estado === 'Activa' ? 'Inactiva' : 'Activa' } : x))}
                        style={{ color: m.estado === 'Activa' ? '#4ade80' : '#f87171' }}>
                        {m.estado === 'Activa' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
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
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} máquina(s) encontrada(s)</p>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Máquina" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Activo relacionado" required>
            <Input value={form.activoId} onChange={e => setForm({ ...form, activoId: e.target.value })} placeholder="Ej: A-001" />
            {errors.activoId && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.activoId}</p>}
          </Field>
          <Field label="Casino" required>
            <Input value={form.casino} onChange={e => setForm({ ...form, casino: e.target.value })} placeholder="Ej: CAS-001" />
            {errors.casino && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.casino}</p>}
          </Field>
          <Field label="Serial" required>
            <Input value={form.serial} onChange={e => setForm({ ...form, serial: e.target.value })} placeholder="Serial del fabricante" />
            {errors.serial && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.serial}</p>}
          </Field>
          <Field label="Número interno" required>
            <Input value={form.numeroInterno} onChange={e => setForm({ ...form, numeroInterno: e.target.value })} placeholder="Ej: NI-0003" />
            {errors.numeroInterno && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.numeroInterno}</p>}
          </Field>
          <Field label="NUC"><Input value={form.nuc} onChange={e => setForm({ ...form, nuc: e.target.value })} placeholder="Número único casino" /></Field>
          <Field label="NUID"><Input value={form.nuid} onChange={e => setForm({ ...form, nuid: e.target.value })} placeholder="ID único del dispositivo" /></Field>
          <Field label="Marca">
            <Select value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })}>
              {MARCAS.map(m => <option key={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Modelo"><Input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="Modelo de la máquina" /></Field>
          <Field label="País de origen">
            <Select value={form.paisOrigen} onChange={e => setForm({ ...form, paisOrigen: e.target.value })}>
              {PAISES.map(p => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Fecha de fabricación">
            <Input type="date" value={form.fechaFabricacion} max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, fechaFabricacion: e.target.value })} />
            {errors.fechaFabricacion && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.fechaFabricacion}</p>}
          </Field>
          <Field label="Tipo de máquina">
            <Select value={form.tipoMaquina} onChange={e => setForm({ ...form, tipoMaquina: e.target.value })}>
              {TIPOS_MAQUINA.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Código de apuesta"><Input value={form.codigoApuesta} onChange={e => setForm({ ...form, codigoApuesta: e.target.value })} placeholder="Ej: CA-003" /></Field>
          <Field label="Juego misterioso">
            <Select value={form.juegoMisterioso} onChange={e => setForm({ ...form, juegoMisterioso: e.target.value as 'Sí' | 'No' })}>
              <option>No</option><option>Sí</option>
            </Select>
          </Field>
          <Field label="Protocolo">
            <Select value={form.protocolo} onChange={e => setForm({ ...form, protocolo: e.target.value })}>
              {PROTOCOLOS.map(p => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Proveedor SCLM"><Input value={form.proveedorSCLM} onChange={e => setForm({ ...form, proveedorSCLM: e.target.value })} placeholder="Proveedor tecnológico" /></Field>
          <Field label="Laboratorio"><Input value={form.laboratorio} onChange={e => setForm({ ...form, laboratorio: e.target.value })} placeholder="Ej: GLI, BMM" /></Field>
          <Field label="SCLM"><Input value={form.sclm} onChange={e => setForm({ ...form, sclm: e.target.value })} placeholder="Sistema de conexión" /></Field>
          <Field label="Tope Rollover (COP)">
            <Input type="number" min="0" value={form.topeRollover} onChange={e => setForm({ ...form, topeRollover: e.target.value })} placeholder="0" />
            {errors.topeRollover && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.topeRollover}</p>}
          </Field>
          <Field label="Documento legal">
            <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-[10px]"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              <Download size={12} /> {docFile ? docFile.name : 'Adjuntar PDF / DOC'}
              <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden"
                onChange={e => setDocFile(e.target.files?.[0] || null)} />
            </label>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            Registrar Máquina
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
