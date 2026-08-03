import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  FileText,
} from 'lucide-react'

import Modal, { Field, Input, Select, Toast } from '@/components/Modal'
import { razonesSocialesApi, type RazonSocialApi } from '@/features/config/services/razones-sociales.api'
import {
  resolucionesDianApi,
  type ResolucionDianApi,
  type TipoDocumentoDian,
} from './services/resoluciones-dian.api'

type FormState = {
  idRazonSocial: string
  tipoDocumento: TipoDocumentoDian
  entorno: '1' | '2'
  prefijo: string
  numeroResolucion: string
  rangoDesde: string
  rangoHasta: string
  fechaVigenciaDesde: string
  fechaVigenciaHasta: string
  claveTecnica: string
}

const EMPTY_FORM: FormState = {
  idRazonSocial: '',
  tipoDocumento: 'FACTURA',
  entorno: '2',
  prefijo: '',
  numeroResolucion: '',
  rangoDesde: '',
  rangoHasta: '',
  fechaVigenciaDesde: '',
  fechaVigenciaHasta: '',
  claveTecnica: '',
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function ResolucionesDianPage() {
  const [resoluciones, setResoluciones] = useState<ResolucionDianApi[]>([])
  const [razonesSociales, setRazonesSociales] = useState<RazonSocialApi[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const razonSocialPorId = useMemo(() => {
    const map = new Map<number, RazonSocialApi>()
    razonesSociales.forEach((rs) => map.set(rs.idRazonSocial, rs))
    return map
  }, [razonesSociales])

  const cargar = async () => {
    setLoading(true)

    try {
      const [resolucionesResp, razonesResp] = await Promise.all([
        resolucionesDianApi.listar(),
        razonesSocialesApi.listar(),
      ])

      setResoluciones(resolucionesResp.resoluciones)
      setRazonesSociales(razonesResp.data)
    } catch (error) {
      setToast({
        message: getErrorMessage(error, 'No se pudieron cargar las resoluciones DIAN.'),
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.idRazonSocial) nextErrors.idRazonSocial = 'Requerido'
    if (!form.prefijo.trim()) nextErrors.prefijo = 'Requerido'
    if (!form.numeroResolucion.trim()) nextErrors.numeroResolucion = 'Requerido'
    if (!form.rangoDesde || Number(form.rangoDesde) < 0) nextErrors.rangoDesde = 'Requerido'
    if (!form.rangoHasta || Number(form.rangoHasta) <= Number(form.rangoDesde)) {
      nextErrors.rangoHasta = 'Debe ser mayor al rango desde'
    }
    if (!form.fechaVigenciaDesde) nextErrors.fechaVigenciaDesde = 'Requerido'
    if (!form.fechaVigenciaHasta) nextErrors.fechaVigenciaHasta = 'Requerido'
    if (!form.claveTecnica.trim()) nextErrors.claveTecnica = 'Requerido'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (resolucion: ResolucionDianApi) => {
    setEditingId(resolucion.idResolucionDian)
    setForm({
      idRazonSocial: String(resolucion.idRazonSocial),
      tipoDocumento: resolucion.tipoDocumento,
      entorno: resolucion.entorno as '1' | '2',
      prefijo: resolucion.prefijo,
      numeroResolucion: resolucion.numeroResolucion,
      rangoDesde: String(resolucion.rangoDesde),
      rangoHasta: String(resolucion.rangoHasta),
      fechaVigenciaDesde: resolucion.fechaVigenciaDesde.slice(0, 10),
      fechaVigenciaHasta: resolucion.fechaVigenciaHasta.slice(0, 10),
      claveTecnica: resolucion.claveTecnica,
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)

    try {
      if (editingId === null) {
        const nueva = await resolucionesDianApi.crear({
          idRazonSocial: Number(form.idRazonSocial),
          tipoDocumento: form.tipoDocumento,
          entorno: form.entorno,
          prefijo: form.prefijo.trim().toUpperCase(),
          numeroResolucion: form.numeroResolucion.trim(),
          rangoDesde: Number(form.rangoDesde),
          rangoHasta: Number(form.rangoHasta),
          fechaVigenciaDesde: form.fechaVigenciaDesde,
          fechaVigenciaHasta: form.fechaVigenciaHasta,
          claveTecnica: form.claveTecnica.trim(),
        })

        setResoluciones((current) => [nueva, ...current])
        setToast({ message: 'Resolución DIAN creada exitosamente.', type: 'success' })
      } else {
        const actualizada = await resolucionesDianApi.actualizar(editingId, {
          prefijo: form.prefijo.trim().toUpperCase(),
          numeroResolucion: form.numeroResolucion.trim(),
          rangoDesde: Number(form.rangoDesde),
          rangoHasta: Number(form.rangoHasta),
          fechaVigenciaDesde: form.fechaVigenciaDesde,
          fechaVigenciaHasta: form.fechaVigenciaHasta,
          claveTecnica: form.claveTecnica.trim(),
        })

        setResoluciones((current) =>
          current.map((item) => (item.idResolucionDian === editingId ? actualizada : item)),
        )
        setToast({ message: 'Resolución DIAN actualizada.', type: 'success' })
      }

      setModalOpen(false)
      setEditingId(null)
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo guardar la resolución DIAN.'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const toggleEstado = async (resolucion: ResolucionDianApi) => {
    try {
      const actualizada = await resolucionesDianApi.cambiarEstado(
        resolucion.idResolucionDian,
        !resolucion.activa,
      )

      setResoluciones((current) =>
        current.map((item) => (item.idResolucionDian === resolucion.idResolucionDian ? actualizada : item)),
      )
    } catch (error) {
      setToast({ message: getErrorMessage(error, 'No se pudo cambiar el estado.'), type: 'error' })
    }
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Resoluciones DIAN
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Numeración autorizada por la DIAN para la emisión de facturas electrónicas.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
        >
          <Plus size={13} />
          Nueva Resolución
        </button>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Cargando resoluciones...
            </span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Razón Social', 'Tipo', 'Entorno', 'Prefijo', 'Rango', 'Consecutivo', 'Vigencia hasta', 'Estado', 'Acciones'].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                      style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {resoluciones.map((resolucion) => (
                <tr
                  key={resolucion.idResolucionDian}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-5 py-4" style={{ color: 'var(--foreground)' }}>
                    {razonSocialPorId.get(resolucion.idRazonSocial)?.nombreRazonSocial ?? `#${resolucion.idRazonSocial}`}
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>
                    {resolucion.tipoDocumento === 'FACTURA' ? 'Factura' : 'Doc. Soporte'}
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>
                    {resolucion.entorno === '1' ? 'Producción' : 'Habilitación'}
                  </td>
                  <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--gold)' }}>
                    {resolucion.prefijo}
                  </td>
                  <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>
                    {resolucion.rangoDesde} - {resolucion.rangoHasta}
                  </td>
                  <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--foreground)' }}>
                    {resolucion.consecutivoActual}
                  </td>
                  <td className="px-5 py-4 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>
                    {resolucion.fechaVigenciaHasta.slice(0, 10)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{
                        background: resolucion.activa ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        color: resolucion.activa ? '#4ade80' : '#f87171',
                      }}
                    >
                      {resolucion.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded"
                        style={{ color: 'var(--muted-foreground)' }}
                        onClick={() => openEdit(resolucion)}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => void toggleEstado(resolucion)}
                        style={{ color: resolucion.activa ? '#4ade80' : '#f87171' }}
                      >
                        {resolucion.activa ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {resoluciones.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    <FileText size={20} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
                    No hay resoluciones DIAN registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId === null ? 'Nueva Resolución DIAN' : 'Editar Resolución DIAN'}
      >
        <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">
          <Field label="Razón Social" required>
            <Select
              value={form.idRazonSocial}
              disabled={editingId !== null}
              onChange={(e) => setField('idRazonSocial', e.target.value)}
            >
              <option value="">Selecciona...</option>
              {razonesSociales.map((rs) => (
                <option key={rs.idRazonSocial} value={rs.idRazonSocial}>
                  {rs.nombreRazonSocial}
                </option>
              ))}
            </Select>
            {errors.idRazonSocial && (
              <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.idRazonSocial}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de documento" required>
              <Select
                value={form.tipoDocumento}
                disabled={editingId !== null}
                onChange={(e) => setField('tipoDocumento', e.target.value)}
              >
                <option value="FACTURA">Factura de Venta</option>
                <option value="DOC_SOPORTE">Documento Soporte</option>
              </Select>
            </Field>

            <Field label="Entorno" required>
              <Select
                value={form.entorno}
                disabled={editingId !== null}
                onChange={(e) => setField('entorno', e.target.value)}
              >
                <option value="2">Habilitación (pruebas)</option>
                <option value="1">Producción</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prefijo" required>
              <Input value={form.prefijo} onChange={(e) => setField('prefijo', e.target.value)} placeholder="Ej: FEV" />
              {errors.prefijo && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.prefijo}</p>}
            </Field>

            <Field label="Número de resolución" required>
              <Input
                value={form.numeroResolucion}
                onChange={(e) => setField('numeroResolucion', e.target.value)}
                placeholder="Ej: 18760000001"
              />
              {errors.numeroResolucion && (
                <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.numeroResolucion}</p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rango desde" required>
              <Input
                type="number"
                value={form.rangoDesde}
                onChange={(e) => setField('rangoDesde', e.target.value)}
                placeholder="Ej: 1"
              />
              {errors.rangoDesde && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.rangoDesde}</p>}
            </Field>

            <Field label="Rango hasta" required>
              <Input
                type="number"
                value={form.rangoHasta}
                onChange={(e) => setField('rangoHasta', e.target.value)}
                placeholder="Ej: 5000000"
              />
              {errors.rangoHasta && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.rangoHasta}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Vigencia desde" required>
              <Input
                type="date"
                value={form.fechaVigenciaDesde}
                onChange={(e) => setField('fechaVigenciaDesde', e.target.value)}
              />
              {errors.fechaVigenciaDesde && (
                <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.fechaVigenciaDesde}</p>
              )}
            </Field>

            <Field label="Vigencia hasta" required>
              <Input
                type="date"
                value={form.fechaVigenciaHasta}
                onChange={(e) => setField('fechaVigenciaHasta', e.target.value)}
              />
              {errors.fechaVigenciaHasta && (
                <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.fechaVigenciaHasta}</p>
              )}
            </Field>
          </div>

          <Field label="Clave técnica" required>
            <Input
              value={form.claveTecnica}
              onChange={(e) => setField('claveTecnica', e.target.value)}
              placeholder="Clave técnica asignada por la DIAN"
            />
            {errors.claveTecnica && <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>{errors.claveTecnica}</p>}
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
            className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {editingId === null ? 'Crear' : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
