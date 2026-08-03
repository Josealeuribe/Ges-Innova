import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { razonesSocialesApi, type RazonSocialApi } from '@/features/config/services/razones-sociales.api'
import {
  reglasPucApi,
  type ActualizarReglaPucPayload,
  type CrearReglaPucPayload,
  type ReglaPucApi,
} from './services/reglas-puc.api'
import type { NaturalezaContable, TipoDocumentoRecibido } from './services/documentos-recibidos.api'

const TIPOS_DOC: { value: TipoDocumentoRecibido | ''; label: string }[] = [
  { value: '', label: 'Cualquier tipo' },
  { value: 'FACTURA', label: 'Factura Electrónica' },
  { value: 'NOTA_CREDITO', label: 'Nota Crédito' },
  { value: 'NOTA_DEBITO', label: 'Nota Débito' },
]

type FormState = {
  idRazonSocial: string
  nombre: string
  concepto: string
  cuentaPuc: string
  tipoDocumento: TipoDocumentoRecibido | ''
  nombreEmisor: string
  nitEmisor: string
  naturaleza: NaturalezaContable
}

const EMPTY_FORM: FormState = {
  idRazonSocial: '',
  nombre: '',
  concepto: '',
  cuentaPuc: '',
  tipoDocumento: '',
  nombreEmisor: '',
  nitEmisor: '',
  naturaleza: 'D',
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function ReglasPUCPage() {
  const [reglas, setReglas] = useState<ReglaPucApi[]>([])
  const [razonesSociales, setRazonesSociales] = useState<RazonSocialApi[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [filterRS, setFilterRS] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const [reglasResp, razonesResp] = await Promise.all([
        reglasPucApi.listar(),
        razonesSocialesApi.listar(),
      ])
      setReglas(reglasResp.reglas)
      setRazonesSociales(razonesResp.data)
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudieron cargar las reglas PUC.'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const razonSocialPorId = useMemo(() => {
    const map = new Map<number, RazonSocialApi>()
    razonesSociales.forEach((rs) => map.set(rs.idRazonSocial, rs))
    return map
  }, [razonesSociales])

  const filtered = reglas.filter((r) => {
    const q = search.toLowerCase()
    const matchQ =
      !q ||
      r.nombre.toLowerCase().includes(q) ||
      r.concepto.toLowerCase().includes(q) ||
      r.cuentaPuc.includes(q) ||
      (r.nombreEmisor ?? '').toLowerCase().includes(q) ||
      (r.nitEmisor ?? '').includes(q)
    const matchRS = !filterRS || String(r.idRazonSocial) === filterRS
    const matchEstado = !filterEstado || (filterEstado === 'Activa' ? r.activa : !r.activa)
    return matchQ && matchRS && matchEstado
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.idRazonSocial) e.idRazonSocial = 'Selecciona una razón social'
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.concepto.trim()) e.concepto = 'Requerido'
    if (!form.cuentaPuc.trim()) e.cuentaPuc = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (regla: ReglaPucApi) => {
    setEditingId(regla.idReglaMapeoPuc)
    setForm({
      idRazonSocial: String(regla.idRazonSocial),
      nombre: regla.nombre,
      concepto: regla.concepto,
      cuentaPuc: regla.cuentaPuc,
      tipoDocumento: regla.tipoDocumento ?? '',
      nombreEmisor: regla.nombreEmisor ?? '',
      nitEmisor: regla.nitEmisor ?? '',
      naturaleza: regla.naturaleza,
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)

    try {
      if (editingId === null) {
        const payload: CrearReglaPucPayload = {
          idRazonSocial: Number(form.idRazonSocial),
          nombre: form.nombre.trim(),
          concepto: form.concepto.trim(),
          cuentaPuc: form.cuentaPuc.trim(),
          naturaleza: form.naturaleza,
          tipoDocumento: form.tipoDocumento || undefined,
          nombreEmisor: form.nombreEmisor.trim() || undefined,
          nitEmisor: form.nitEmisor.trim() || undefined,
        }

        const nueva = await reglasPucApi.crear(payload)
        setReglas((current) => [nueva, ...current])
        setToast({ message: `Regla PUC "${nueva.nombre}" creada exitosamente.`, type: 'success' })
      } else {
        const payload: ActualizarReglaPucPayload = {
          nombre: form.nombre.trim(),
          concepto: form.concepto.trim(),
          cuentaPuc: form.cuentaPuc.trim(),
          naturaleza: form.naturaleza,
          tipoDocumento: form.tipoDocumento || undefined,
          nombreEmisor: form.nombreEmisor.trim() || undefined,
          nitEmisor: form.nitEmisor.trim() || undefined,
        }

        const actualizada = await reglasPucApi.actualizar(editingId, payload)
        setReglas((current) =>
          current.map((item) => (item.idReglaMapeoPuc === editingId ? actualizada : item)),
        )
        setToast({ message: 'Regla PUC actualizada.', type: 'success' })
      }

      setModalOpen(false)
      setEditingId(null)
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo guardar la regla PUC.'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const toggleEstado = async (regla: ReglaPucApi) => {
    try {
      const actualizada = await reglasPucApi.actualizar(regla.idReglaMapeoPuc, {
        activa: !regla.activa,
      })
      setReglas((current) =>
        current.map((item) => (item.idReglaMapeoPuc === regla.idReglaMapeoPuc ? actualizada : item)),
      )
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo cambiar el estado.'), type: 'error' })
    }
  }

  const deleteRegla = async (regla: ReglaPucApi) => {
    const confirmado = window.confirm(`¿Eliminar la regla PUC "${regla.nombre}"?`)
    if (!confirmado) return

    try {
      await reglasPucApi.eliminar(regla.idReglaMapeoPuc)
      setReglas((current) => current.filter((item) => item.idReglaMapeoPuc !== regla.idReglaMapeoPuc))
      setToast({ message: 'Regla PUC eliminada.', type: 'success' })
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo eliminar la regla PUC.'), type: 'error' })
    }
  }

  const clearFilters = () => {
    setSearch('')
    setFilterRS('')
    setFilterEstado('')
  }

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Nombre, concepto, cuenta, emisor, NIT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={12} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>

        <select
          value={filterRS}
          onChange={(e) => setFilterRS(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">Todas las razones sociales</option>
          {razonesSociales.map((rs) => (
            <option key={rs.idRazonSocial} value={rs.idRazonSocial}>
              {rs.nombreRazonSocial}
            </option>
          ))}
        </select>

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">Todos los estados</option>
          <option>Activa</option>
          <option>Inactiva</option>
        </select>

        {(search || filterRS || filterEstado) && (
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-2.5 rounded"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            Limpiar
          </button>
        )}

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={13} /> Nueva Regla PUC
        </button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando reglas PUC...</span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Nombre / Concepto', 'Cuenta Contable', 'Tipo Doc.', 'Emisor / NIT', 'Razón Social', 'Estado', 'Acciones'].map((h) => (
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
              {filtered.map((r) => (
                <tr
                  key={r.idReglaMapeoPuc}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{r.nombre}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{r.concepto}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono-data font-semibold" style={{ color: 'var(--gold)' }}>
                    {r.cuentaPuc}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>
                    {TIPOS_DOC.find((t) => t.value === (r.tipoDocumento ?? ''))?.label ?? 'Cualquier tipo'}
                  </td>
                  <td className="px-5 py-3.5">
                    <p style={{ color: 'var(--foreground)' }}>{r.nombreEmisor || '—'}</p>
                    <p className="font-mono-data" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                      {r.nitEmisor || ''}
                    </p>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--muted-foreground)' }}>
                    {razonSocialPorId.get(r.idRazonSocial)?.nombreRazonSocial ?? `#${r.idRazonSocial}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{
                        background: r.activa ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        color: r.activa ? '#4ade80' : '#f87171',
                      }}
                    >
                      {r.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded"
                        style={{ color: 'var(--muted-foreground)' }}
                        onClick={() => openEdit(r)}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => void toggleEstado(r)} style={{ color: r.activa ? '#4ade80' : '#f87171' }}>
                        {r.activa ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => void deleteRegla(r)}
                        className="p-1.5 rounded"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Sin reglas PUC para los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} regla(s) PUC encontrada(s)</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editingId === null ? 'Nueva Regla PUC' : 'Editar Regla PUC'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Razón Social" required>
            <Select
              value={form.idRazonSocial}
              disabled={editingId !== null}
              onChange={(e) => setField('idRazonSocial', e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              {razonesSociales.map((rs) => (
                <option key={rs.idRazonSocial} value={rs.idRazonSocial}>
                  {rs.nombreRazonSocial}
                </option>
              ))}
            </Select>
            {errors.idRazonSocial && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.idRazonSocial}</p>}
          </Field>

          <Field label="Nombre de la regla" required>
            <Input value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} placeholder="Ej: Compra materiales de oficina" />
            {errors.nombre && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.nombre}</p>}
          </Field>

          <Field label="Concepto contable" required>
            <Input value={form.concepto} onChange={(e) => setField('concepto', e.target.value)} placeholder="Ej: Gastos de papelería" />
            {errors.concepto && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.concepto}</p>}
          </Field>

          <Field label="Cuenta Contable (PUC)" required>
            <Input value={form.cuentaPuc} onChange={(e) => setField('cuentaPuc', e.target.value)} placeholder="Ej: 5135-01" />
            {errors.cuentaPuc && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.cuentaPuc}</p>}
          </Field>

          <Field label="Naturaleza" required>
            <Select value={form.naturaleza} onChange={(e) => setField('naturaleza', e.target.value as NaturalezaContable)}>
              <option value="D">Débito</option>
              <option value="C">Crédito</option>
            </Select>
          </Field>

          <Field label="Tipo de documento (criterio opcional)">
            <Select value={form.tipoDocumento} onChange={(e) => setField('tipoDocumento', e.target.value as TipoDocumentoRecibido | '')}>
              {TIPOS_DOC.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Nombre del emisor (criterio opcional)">
            <Input value={form.nombreEmisor} onChange={(e) => setField('nombreEmisor', e.target.value)} placeholder="Nombre del proveedor" />
          </Field>

          <Field label="NIT del emisor (criterio opcional)">
            <Input value={form.nitEmisor} onChange={(e) => setField('nitEmisor', e.target.value)} placeholder="Ej: 900123456" />
          </Field>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={closeModal}
            disabled={saving}
            className="px-4 py-2.5 rounded text-xs"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="px-5 py-2.5 rounded text-xs font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
          >
            {editingId === null ? 'Crear Regla PUC' : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
