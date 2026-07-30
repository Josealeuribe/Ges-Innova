import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

import Modal, { Field, Input, Toast } from '@/components/Modal'
import { useApp } from '@/context/AppContext'
import {
  type CrearRazonSocialPayload,
  type RazonSocialApi,
  razonesSocialesApi,
} from './services/razones-sociales.api'

type FormState = {
  nit: string
  nombreRazonSocial: string
  direccion: string
  correo: string
  telefono: string
  codigoPostal: string
  idPais: string
  idDepartamento: string
  idCiudad: string
  idTipoPersona: string
  idAmbienteDian: string
  idRegimen: string
  responsabilidadFiscal: string
  codigoHelisa: string
  estado: 'ACTIVO' | 'INACTIVO'
}

const EMPTY_FORM: FormState = {
  nit: '',
  nombreRazonSocial: '',
  direccion: '',
  correo: '',
  telefono: '',
  codigoPostal: '',
  idPais: '',
  idDepartamento: '',
  idCiudad: '',
  idTipoPersona: '',
  idAmbienteDian: '',
  idRegimen: '',
  responsabilidadFiscal: '',
  codigoHelisa: '',
  estado: 'ACTIVO',
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error ? error.message : fallback
}

export default function RazonesSocialesPage() {
  const { razonSocialActiva } = useApp()

  const [razonesSociales, setRazonesSociales] = useState<
    RazonSocialApi[]
  >([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(
    null,
  )
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<
    Record<string, string>
  >({})
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const loadRazonesSociales = async () => {
    setLoading(true)

    try {
      const response = await razonesSocialesApi.listar()
      setRazonesSociales(response.data)
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudieron cargar las razones sociales.',
        ),
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRazonesSociales()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return razonesSociales

    return razonesSociales.filter((r) =>
      [
        r.nombreRazonSocial,
        r.nit,
        r.direccion,
        r.correo,
        r.telefono,
      ].some((value) =>
        value.toLowerCase().includes(q),
      ),
    )
  }, [razonesSociales, search])

  const isRazonSocialActiva = (
    razonSocial: RazonSocialApi,
  ): boolean => {
    const activeId = String(
      razonSocialActiva?.id ?? '',
    )
    const currentId = String(
      razonSocial.idRazonSocial,
    )

    const activeName = String(
      razonSocialActiva?.nombre ?? '',
    )
      .trim()
      .toLowerCase()

    return (
      activeId === currentId ||
      activeName ===
        razonSocial.nombreRazonSocial
          .trim()
          .toLowerCase()
    )
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    const requiredFields: Array<keyof FormState> = [
      'nit',
      'nombreRazonSocial',
      'direccion',
      'correo',
      'telefono',
      'idPais',
      'idDepartamento',
      'idCiudad',
      'idTipoPersona',
      'idAmbienteDian',
      'idRegimen',
      'responsabilidadFiscal',
    ]

    for (const field of requiredFields) {
      if (!form[field].trim()) {
        nextErrors[field] = 'Requerido'
      }
    }

    if (
      form.correo &&
      !/\S+@\S+\.\S+/.test(form.correo)
    ) {
      nextErrors.correo = 'Formato inválido'
    }

    const idFields: Array<keyof FormState> = [
      'idPais',
      'idDepartamento',
      'idCiudad',
      'idTipoPersona',
      'idAmbienteDian',
      'idRegimen',
    ]

    for (const field of idFields) {
      if (
        form[field] &&
        (!Number.isInteger(Number(form[field])) ||
          Number(form[field]) <= 0)
      ) {
        nextErrors[field] = 'ID inválido'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const toPayload = (): CrearRazonSocialPayload => ({
    nit: form.nit.trim(),
    nombreRazonSocial:
      form.nombreRazonSocial.trim(),
    direccion: form.direccion.trim(),
    correo: form.correo.trim().toLowerCase(),
    telefono: form.telefono.trim(),
    codigoPostal: form.codigoPostal.trim() || null,
    idPais: Number(form.idPais),
    idDepartamento: Number(form.idDepartamento),
    idCiudad: Number(form.idCiudad),
    idTipoPersona: Number(form.idTipoPersona),
    idAmbienteDian: Number(form.idAmbienteDian),
    idRegimen: Number(form.idRegimen),
    responsabilidadFiscal:
      form.responsabilidadFiscal.trim(),
    codigoHelisa: form.codigoHelisa.trim() || null,
    estado: form.estado,
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (razonSocial: RazonSocialApi) => {
    setEditingId(razonSocial.idRazonSocial)
    setForm({
      nit: razonSocial.nit,
      nombreRazonSocial:
        razonSocial.nombreRazonSocial,
      direccion: razonSocial.direccion,
      correo: razonSocial.correo,
      telefono: razonSocial.telefono,
      codigoPostal:
        razonSocial.codigoPostal ?? '',
      idPais: String(razonSocial.idPais),
      idDepartamento: String(
        razonSocial.idDepartamento,
      ),
      idCiudad: String(razonSocial.idCiudad),
      idTipoPersona: String(
        razonSocial.idTipoPersona,
      ),
      idAmbienteDian: String(
        razonSocial.idAmbienteDian,
      ),
      idRegimen: String(razonSocial.idRegimen),
      responsabilidadFiscal:
        razonSocial.responsabilidadFiscal,
      codigoHelisa:
        razonSocial.codigoHelisa ?? '',
      estado: razonSocial.estado,
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setModalOpen(false)
    setEditingId(null)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSaving(true)

    try {
      const payload = toPayload()

      if (editingId === null) {
        const nueva =
          await razonesSocialesApi.crear(payload)

        setRazonesSociales((current) => [
          nueva,
          ...current,
        ])

        setToast({
          message: `Razón social "${nueva.nombreRazonSocial}" registrada exitosamente.`,
          type: 'success',
        })
      } else {
        const actualizada =
          await razonesSocialesApi.actualizar(
            editingId,
            payload,
          )

        setRazonesSociales((current) =>
          current.map((item) =>
            item.idRazonSocial === editingId
              ? actualizada
              : item,
          ),
        )

        setToast({
          message:
            'Razón social actualizada exitosamente.',
          type: 'success',
        })
      }

      setModalOpen(false)
      setEditingId(null)
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudo guardar la razón social.',
        ),
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleEstado = async (
    razonSocial: RazonSocialApi,
  ) => {
    if (
      razonSocial.estado === 'ACTIVO' &&
      isRazonSocialActiva(razonSocial)
    ) {
      setToast({
        message:
          'No puedes desactivar la razón social actualmente activa.',
        type: 'error',
      })
      return
    }

    try {
      const actualizada =
        await razonesSocialesApi.actualizar(
          razonSocial.idRazonSocial,
          {
            estado:
              razonSocial.estado === 'ACTIVO'
                ? 'INACTIVO'
                : 'ACTIVO',
          },
        )

      setRazonesSociales((current) =>
        current.map((item) =>
          item.idRazonSocial ===
          razonSocial.idRazonSocial
            ? actualizada
            : item,
        ),
      )
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudo cambiar el estado.',
        ),
        type: 'error',
      })
    }
  }

  const deleteRS = async (
    razonSocial: RazonSocialApi,
  ) => {
    if (isRazonSocialActiva(razonSocial)) {
      setToast({
        message:
          'No puedes eliminar la razón social activa. Cambia primero la selección.',
        type: 'error',
      })
      return
    }

    const confirmed = window.confirm(
      `¿Deseas inactivar la razón social "${razonSocial.nombreRazonSocial}"?`,
    )

    if (!confirmed) return

    try {
      const actualizada =
        await razonesSocialesApi.inactivar(
          razonSocial.idRazonSocial,
        )

      setRazonesSociales((current) =>
        current.map((item) =>
          item.idRazonSocial ===
          razonSocial.idRazonSocial
            ? actualizada
            : item,
        ),
      )

      setToast({
        message: 'Razón social eliminada.',
        type: 'success',
      })
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudo eliminar la razón social.',
        ),
        type: 'error',
      })
    }
  }

  const setField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }

  const formFields: Array<{
    field: keyof FormState
    label: string
    placeholder: string
    required?: boolean
    type?: 'text' | 'email' | 'number'
  }> = [
    {
      field: 'nit',
      label: 'NIT',
      placeholder: 'Ej: 901234567-8',
      required: true,
    },
    {
      field: 'nombreRazonSocial',
      label: 'Nombre / Razón Social',
      placeholder:
        'Ej: Operadora Nacional S.A.S',
      required: true,
    },
    {
      field: 'direccion',
      label: 'Dirección',
      placeholder: 'Ej: Cra 7 #32-15, Bogotá',
      required: true,
    },
    {
      field: 'correo',
      label: 'Correo electrónico',
      placeholder: 'contacto@empresa.co',
      required: true,
      type: 'email',
    },
    {
      field: 'telefono',
      label: 'Teléfono',
      placeholder: 'Ej: 601-1234567',
      required: true,
    },
    {
      field: 'codigoPostal',
      label: 'Código postal',
      placeholder: 'Ej: 050015',
    },
    {
      field: 'idPais',
      label: 'ID País',
      placeholder: 'Ej: 1',
      required: true,
      type: 'number',
    },
    {
      field: 'idDepartamento',
      label: 'ID Departamento',
      placeholder: 'Ej: 1',
      required: true,
      type: 'number',
    },
    {
      field: 'idCiudad',
      label: 'ID Ciudad',
      placeholder: 'Ej: 1',
      required: true,
      type: 'number',
    },
    {
      field: 'idTipoPersona',
      label: 'ID Tipo de persona',
      placeholder: 'Ej: 1',
      required: true,
      type: 'number',
    },
    {
      field: 'idAmbienteDian',
      label: 'ID Ambiente DIAN',
      placeholder: 'Ej: 1',
      required: true,
      type: 'number',
    },
    {
      field: 'idRegimen',
      label: 'ID Régimen',
      placeholder: 'Ej: 1',
      required: true,
      type: 'number',
    },
    {
      field: 'responsabilidadFiscal',
      label: 'Responsabilidad fiscal',
      placeholder: 'Ej: Responsable de IVA',
      required: true,
    },
    {
      field: 'codigoHelisa',
      label: 'Código Helisa',
      placeholder: 'Ej: RS-001',
    },
  ]

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Info activa */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-lg"
        style={{
          background: 'rgba(200,168,75,0.08)',
          border: '1px solid var(--gold-dim)',
        }}
      >
        <AlertTriangle
          size={14}
          style={{
            color: 'var(--gold)',
            marginTop: 1,
            flexShrink: 0,
          }}
        />
        <p
          className="text-xs"
          style={{
            color: 'var(--muted-foreground)',
          }}
        >
          Razón social activa en el sistema:{' '}
          <span
            className="font-semibold"
            style={{ color: 'var(--gold)' }}
          >
            {razonSocialActiva?.nombre ||
              'Sin selección'}
          </span>
          . Para cambiar, usa el selector en la barra
          superior.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <Search
            size={13}
            style={{
              color: 'var(--muted-foreground)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, NIT, dirección, correo..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="bg-transparent outline-none text-xs w-full"
            style={{ color: 'var(--foreground)' }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X
                size={12}
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              />
            </button>
          )}
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{
            background: 'var(--gold)',
            color: 'var(--primary-foreground)',
          }}
        >
          <Plus size={13} />
          Nueva Razón Social
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader2
              className="animate-spin"
              size={18}
              style={{ color: 'var(--gold)' }}
            />
            <span
              className="text-xs"
              style={{
                color: 'var(--muted-foreground)',
              }}
            >
              Cargando razones sociales...
            </span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr
                style={{
                  background: 'var(--secondary)',
                  borderBottom:
                    '1px solid var(--border)',
                }}
              >
                {[
                  'Razón Social',
                  'Dirección',
                  'Correo',
                  'Teléfono',
                  'Estado',
                  'Acciones',
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left px-5 py-3 font-medium tracking-widest uppercase"
                    style={{
                      color:
                        'var(--muted-foreground)',
                      fontSize: '9px',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((razonSocial) => {
                const activa =
                  isRazonSocialActiva(razonSocial)

                return (
                  <tr
                    key={razonSocial.idRazonSocial}
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,0.04)',
                      background: activa
                        ? 'rgba(200,168,75,0.04)'
                        : 'transparent',
                    }}
                    onMouseEnter={(event) => {
                      if (!activa) {
                        event.currentTarget.style.background =
                          'rgba(255,255,255,0.02)'
                      }
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background =
                        activa
                          ? 'rgba(200,168,75,0.04)'
                          : 'transparent'
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p
                            style={{
                              color: 'var(--foreground)',
                            }}
                          >
                            {
                              razonSocial.nombreRazonSocial
                            }
                          </p>
                          <p
                            style={{
                              color:
                                'var(--muted-foreground)',
                              fontSize: '10px',
                            }}
                          >
                            {razonSocial.nit}
                          </p>
                        </div>

                        {activa && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wider"
                            style={{
                              background: 'var(--gold)',
                              color:
                                'var(--primary-foreground)',
                            }}
                          >
                            ACTIVA
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      className="px-5 py-4"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      {razonSocial.direccion}
                    </td>

                    <td
                      className="px-5 py-4"
                      style={{
                        color: 'var(--foreground)',
                      }}
                    >
                      {razonSocial.correo}
                    </td>

                    <td
                      className="px-5 py-4 font-mono-data"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      {razonSocial.telefono}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded text-[10px] font-medium"
                        style={{
                          background:
                            razonSocial.estado ===
                            'ACTIVO'
                              ? 'rgba(74,222,128,0.1)'
                              : 'rgba(248,113,113,0.1)',
                          color:
                            razonSocial.estado ===
                            'ACTIVO'
                              ? '#4ade80'
                              : '#f87171',
                        }}
                      >
                        {razonSocial.estado === 'ACTIVO'
                          ? 'Activa'
                          : 'Inactiva'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded"
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                          onClick={() =>
                            openEdit(razonSocial)
                          }
                          onMouseEnter={(event) => {
                            event.currentTarget.style.color =
                              'var(--gold)'
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.color =
                              'var(--muted-foreground)'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() =>
                            void toggleEstado(
                              razonSocial,
                            )
                          }
                          style={{
                            color:
                              razonSocial.estado ===
                              'ACTIVO'
                                ? '#4ade80'
                                : '#f87171',
                          }}
                        >
                          {razonSocial.estado ===
                          'ACTIVO' ? (
                            <ToggleRight size={15} />
                          ) : (
                            <ToggleLeft size={15} />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            void deleteRS(razonSocial)
                          }
                          className="p-1.5 rounded"
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.color =
                              '#f87171'
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.color =
                              'var(--muted-foreground)'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  >
                    No se encontraron razones sociales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div
          className="px-5 py-3"
          style={{
            borderTop: '1px solid var(--border)',
          }}
        >
          <p
            className="text-[10px]"
            style={{
              color: 'var(--muted-foreground)',
            }}
          >
            {filtered.length} razón(es) social(es)
          </p>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingId === null
            ? 'Nueva Razón Social'
            : 'Editar Razón Social'
        }
      >
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <div className="space-y-4">
            {formFields.map(
              ({
                field,
                label,
                placeholder,
                required,
                type = 'text',
              }) => (
                <Field
                  key={field}
                  label={label}
                  required={required}
                >
                  <Input
                    type={type}
                    value={form[field]}
                    onChange={(event) =>
                      setField(
                        field,
                        event.target.value,
                      )
                    }
                    placeholder={placeholder}
                  />
                  {errors[field] && (
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: '#f87171' }}
                    >
                      {errors[field]}
                    </p>
                  )}
                </Field>
              ),
            )}

            <Field label="Estado">
              <select
                value={form.estado}
                onChange={(event) =>
                  setField(
                    'estado',
                    event.target.value,
                  )
                }
                className="w-full rounded px-3 py-2.5 text-xs outline-none"
                style={{
                  background: 'var(--card)',
                  border:
                    '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="ACTIVO">
                  ACTIVO
                </option>
                <option value="INACTIVO">
                  INACTIVO
                </option>
              </select>
            </Field>
          </div>
        </div>

        <div
          className="flex justify-end gap-3 mt-6 pt-4"
          style={{
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={closeModal}
            disabled={saving}
            className="px-4 py-2.5 rounded text-xs"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              border: '1px solid var(--border)',
            }}
          >
            Cancelar
          </button>

          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
            style={{
              background: 'var(--gold)',
              color: 'var(--primary-foreground)',
            }}
          >
            {saving && (
              <Loader2
                size={13}
                className="animate-spin"
              />
            )}

            {editingId === null
              ? 'Registrar'
              : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
