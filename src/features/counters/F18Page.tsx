import { useState } from 'react'
import { Search, Upload, Download, Eye, Trash2, RefreshCw, AlertCircle, CheckCircle2, Clock, X, FileSpreadsheet } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'

type F18Estado = 'Pendiente' | 'Cargando' | 'Procesando' | 'Procesado' | 'Procesado con errores' | 'Rechazado'

interface ArchivoF18 {
  id: string
  nombre: string
  razonSocial: string
  casino: string
  periodo: string
  fechaCarga: string
  usuario: string
  estado: F18Estado
  totalRegistros: number
  correctos: number
  errores: number
}

const F18_INIT: ArchivoF18[] = [
  { id: 'F18-001', nombre: 'F18_INNOVA_2026_07.xlsx', razonSocial: 'Innova Club S.A.S', casino: 'Sede Norte', periodo: '2026-07', fechaCarga: '2026-07-19 09:14', usuario: 'admin@innovaclub.co', estado: 'Procesado', totalRegistros: 1240, correctos: 1240, errores: 0 },
  { id: 'F18-002', nombre: 'F18_INNOVA_2026_06.xlsx', razonSocial: 'Innova Club S.A.S', casino: 'Sede Sur', periodo: '2026-06', fechaCarga: '2026-06-30 17:45', usuario: 'admin@innovaclub.co', estado: 'Procesado con errores', totalRegistros: 980, correctos: 941, errores: 39 },
  { id: 'F18-003', nombre: 'F18_NORTE_2026_07.xlsx', razonSocial: 'Casino Norte Ltda.', casino: 'Casino Norte Centro', periodo: '2026-07', fechaCarga: '2026-07-18 11:22', usuario: 'norte@innovaclub.co', estado: 'Procesando', totalRegistros: 560, correctos: 0, errores: 0 },
  { id: 'F18-004', nombre: 'F18_INNOVA_2026_05.xlsx', razonSocial: 'Innova Club S.A.S', casino: 'Sede Norte', periodo: '2026-05', fechaCarga: '2026-06-02 08:30', usuario: 'admin@innovaclub.co', estado: 'Rechazado', totalRegistros: 0, correctos: 0, errores: 0 },
]

const ESTADO_STYLE: Record<F18Estado, { color: string; bg: string; icon: React.ReactNode }> = {
  Pendiente: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={11} /> },
  Cargando: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <RefreshCw size={11} className="animate-spin" /> },
  Procesando: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: <RefreshCw size={11} className="animate-spin" /> },
  Procesado: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={11} /> },
  'Procesado con errores': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <AlertCircle size={11} /> },
  Rechazado: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <X size={11} /> },
}

const PERIODOS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, 6 - i, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})

export default function F18Page() {
  const { razonesSociales, razonSocialActiva } = useApp()
  const [archivos, setArchivos] = useState<ArchivoF18[]>(F18_INIT)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ razonSocial: razonSocialActiva.nombre, casino: '', periodo: PERIODOS[0], observaciones: '' })
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = archivos.filter((a) => {
    const q = search.toLowerCase()
    const matchQ = !q || a.nombre.toLowerCase().includes(q) || a.razonSocial.toLowerCase().includes(q) || a.casino.toLowerCase().includes(q) || a.usuario.toLowerCase().includes(q)
    const matchEstado = !filterEstado || a.estado === filterEstado
    const matchPeriodo = !filterPeriodo || a.periodo === filterPeriodo
    return matchQ && matchEstado && matchPeriodo
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFileError('')
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setFileError('Solo se permiten archivos .xlsx, .xls o .csv')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError('El archivo supera el tamaño máximo de 10 MB')
      return
    }
    setFile(f)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.casino.trim()) e.casino = 'Requerido'
    if (!file) e.file = 'Adjunta el archivo F.18'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCargar = () => {
    if (!validate()) return
    const nuevo: ArchivoF18 = {
      id: `F18-${String(archivos.length + 1).padStart(3, '0')}`,
      nombre: file!.name,
      razonSocial: form.razonSocial,
      casino: form.casino,
      periodo: form.periodo,
      fechaCarga: new Date().toLocaleString('es-CO'),
      usuario: 'admin@innovaclub.co',
      estado: 'Pendiente',
      totalRegistros: 0,
      correctos: 0,
      errores: 0,
    }
    setArchivos([nuevo, ...archivos])
    setModalOpen(false)
    setForm({ razonSocial: razonSocialActiva.nombre, casino: '', periodo: PERIODOS[0], observaciones: '' })
    setFile(null)
    setErrors({})
    setToast({ message: `Archivo "${nuevo.nombre}" cargado. Estado: Pendiente de procesamiento.`, type: 'success' })
  }

  const clearFilters = () => { setSearch(''); setFilterEstado(''); setFilterPeriodo('') }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cargas', value: archivos.length, color: 'var(--gold)' },
          { label: 'Procesados', value: archivos.filter(a => a.estado === 'Procesado').length, color: '#4ade80' },
          { label: 'Con Errores', value: archivos.filter(a => a.estado === 'Procesado con errores').length, color: '#f59e0b' },
          { label: 'Rechazados', value: archivos.filter(a => a.estado === 'Rechazado').length, color: '#f87171' },
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
          <input type="text" placeholder="Nombre, razón social, casino, usuario..." value={search}
            onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Estado</option>
          {(['Pendiente', 'Procesando', 'Procesado', 'Procesado con errores', 'Rechazado'] as F18Estado[]).map(e => <option key={e}>{e}</option>)}
        </select>
        <select value={filterPeriodo} onChange={e => setFilterPeriodo(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <option value="">Período</option>
          {PERIODOS.map(p => <option key={p}>{p}</option>)}
        </select>
        {(search || filterEstado || filterPeriodo) && (
          <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Limpiar
          </button>
        )}
        <button onClick={() => { setForm({ razonSocial: razonSocialActiva.nombre, casino: '', periodo: PERIODOS[0], observaciones: '' }); setFile(null); setErrors({}); setFileError(''); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
          <Upload size={13} /> Cargar F.18
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Archivo', 'Razón Social / Casino', 'Período', 'Cargado', 'Usuario', 'Registros', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                  style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const s = ESTADO_STYLE[a.estado]
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                      <div>
                        <p style={{ color: 'var(--foreground)' }}>{a.nombre}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{a.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{a.razonSocial}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{a.casino}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>{a.periodo}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{a.fechaCarga}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>{a.usuario}</td>
                  <td className="px-5 py-3.5">
                    {a.totalRegistros > 0 ? (
                      <div>
                        <p className="font-mono-data" style={{ color: 'var(--foreground)' }}>{a.totalRegistros.toLocaleString()}</p>
                        <p style={{ fontSize: '10px' }}>
                          <span style={{ color: '#4ade80' }}>{a.correctos.toLocaleString()} ✓</span>
                          {a.errores > 0 && <span style={{ color: '#f87171' }}> · {a.errores} ✗</span>}
                        </p>
                      </div>
                    ) : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{ background: s.bg, color: s.color }}>
                      {s.icon} {a.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button title="Ver detalle" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Eye size={13} />
                      </button>
                      <button title="Descargar" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                        <Download size={13} />
                      </button>
                      <button title="Eliminar" className="p-1.5 rounded" style={{ color: 'var(--muted-foreground)' }}
                        onClick={() => { setArchivos(archivos.filter(x => x.id !== a.id)); setToast({ message: 'Archivo eliminado.', type: 'success' }) }}
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
              <tr><td colSpan={8} className="px-5 py-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Sin archivos F.18 para los filtros aplicados.
              </td></tr>
            )}
          </tbody>
        </table>
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} archivo(s) encontrado(s)</p>
        </div>
      </div>

      {/* Upload modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Cargar Archivo F.18">
        <div className="space-y-4">
          <Field label="Razón Social" required>
            <Select value={form.razonSocial} onChange={e => setForm({ ...form, razonSocial: e.target.value })}>
              {razonesSociales.filter(r => r.estado === 'Activa').map(r => <option key={r.id}>{r.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Casino" required>
            <Input value={form.casino} onChange={e => setForm({ ...form, casino: e.target.value })} placeholder="Nombre o código del casino" />
            {errors.casino && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.casino}</p>}
          </Field>
          <Field label="Período (AAAA-MM)" required>
            <Select value={form.periodo} onChange={e => setForm({ ...form, periodo: e.target.value })}>
              {PERIODOS.map(p => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Archivo F.18 (.xlsx / .xls / .csv)" required>
            <label className="flex items-center gap-3 px-4 py-3 rounded cursor-pointer transition-all"
              style={{ background: 'var(--muted)', border: `1px dashed ${file ? 'var(--gold)' : 'var(--border)'}` }}>
              <FileSpreadsheet size={16} style={{ color: file ? 'var(--gold)' : 'var(--muted-foreground)', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: file ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {file ? file.name : 'Haz clic para seleccionar el archivo'}
              </span>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            </label>
            {(fileError || errors.file) && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{fileError || errors.file}</p>}
          </Field>
          <Field label="Observaciones">
            <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Notas sobre esta carga..." rows={2}
              className="w-full px-3 py-2.5 rounded text-xs outline-none resize-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={handleCargar} className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            <Upload size={13} /> Cargar F.18
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
