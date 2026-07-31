import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Edit2,
  Loader2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react'

import Modal, {
  Field,
  Input,
  Toast,
} from '@/components/Modal'
import {
  type CrearRolPayload,
  type RolApi,
  rolesApi,
} from './services/roles.api'
import { MatrizPermisosRol } from '../control-acceso/services/control-acceso.api'

type EstadoRol = 'ACTIVO' | 'INACTIVO'

interface RoleForm {
  nombreRol: string
  descripcion: string
  estado: EstadoRol
}

interface ToastState {
  message: string
  type: 'success' | 'error'
}

const INITIAL_FORM: RoleForm = {
  nombreRol: '',
  descripcion: '',
  estado: 'ACTIVO',
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error
    ? error.message
    : fallback
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatRoleCode(idRol: number): string {
  return `ROL-${String(idRol).padStart(3, '0')}`
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RolApi[]>(
    [],
  )
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] =
    useState<number | null>(null)

  const [modalOpen, setModalOpen] =
    useState(false)
  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [form, setForm] =
    useState<RoleForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<
    Record<string, string>
  >({})

  const [
    permissionMatrix,
    setPermissionMatrix,
  ] = useState<MatrizPermisosRol | null>(
    null,
  )
  const [
    loadingPermissions,
    setLoadingPermissions,
  ] = useState(false)
  const [
    permissionsError,
    setPermissionsError,
  ] = useState<string | null>(null)

  const [toast, setToast] =
    useState<ToastState | null>(null)

  const loadRoles = async (
    showLoader = true,
  ) => {
    if (showLoader) {
      setLoading(true)
    }

    try {
      const response = await rolesApi.listar({
        page: 1,
        limit: 100,
      })

      setRoles(response.data)
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudieron cargar los roles.',
        ),
        type: 'error',
      })
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadRoles()
  }, [])

  const filteredRoles = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()

    if (!query) {
      return roles
    }

    return roles.filter((role) => {
      const name =
        role.nombreRol.toLowerCase()
      const description =
        role.descripcion?.toLowerCase() ??
        ''

      return (
        name.includes(query) ||
        description.includes(query)
      )
    })
  }, [roles, search])

  const summary = useMemo(
    () => ({
      totalRoles: roles.length,
      activeRoles: roles.filter(
        (role) =>
          role.estado === 'ACTIVO',
      ).length,
      assignedUsers: roles.reduce(
        (total, role) =>
          total + role.totalUsuarios,
        0,
      ),
    }),
    [roles],
  )

  const selectedPermissions = useMemo(
    () =>
      permissionMatrix?.modulos.reduce(
        (total, modulo) =>
          total +
          modulo.permisos.filter(
            (permiso) =>
              permiso.permitido,
          ).length,
        0,
      ) ?? 0,
    [permissionMatrix],
  )

  const totalPermissions = useMemo(
    () =>
      permissionMatrix?.modulos.reduce(
        (total, modulo) =>
          total +
          modulo.permisos.length,
        0,
      ) ?? 0,
    [permissionMatrix],
  )

  const setField = <
    K extends keyof RoleForm,
  >(
    field: K,
    value: RoleForm[K],
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

  const validateForm = (): boolean => {
    const nextErrors: Record<
      string,
      string
    > = {}

    const normalizedName =
      form.nombreRol
        .trim()
        .toLowerCase()

    if (!form.nombreRol.trim()) {
      nextErrors.nombreRol = 'Requerido'
    } else if (
      form.nombreRol.trim().length > 100
    ) {
      nextErrors.nombreRol =
        'Máximo 100 caracteres'
    } else {
      const duplicatedRole = roles.some(
        (role) =>
          role.idRol !== editingId &&
          role.nombreRol
            .trim()
            .toLowerCase() ===
          normalizedName,
      )

      if (duplicatedRole) {
        nextErrors.nombreRol =
          'Nombre ya existe'
      }
    }

    if (form.descripcion.length > 255) {
      nextErrors.descripcion =
        'Máximo 255 caracteres'
    }

    if (!permissionMatrix) {
      nextErrors.permisos =
        'No fue posible cargar la matriz de permisos.'
    } else if (
      totalPermissions === 0
    ) {
      nextErrors.permisos =
        'No existen permisos configurados para asignar.'
    }

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors).length === 0
    )
  }

  const buildPayload =
    (): CrearRolPayload => ({
      nombreRol: form.nombreRol.trim(),
      descripcion:
        form.descripcion.trim() || null,
      estado: form.estado,
    })

  const resetModalState = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setPermissionMatrix(null)
    setPermissionsError(null)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    resetModalState()
  }

  const openCreateModal = async () => {
    setEditingId(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setPermissionMatrix(null)
    setPermissionsError(null)
    setModalOpen(true)
    setLoadingPermissions(true)

    try {
      const matrix =
        await rolesApi.obtenerCatalogoPermisos()

      setPermissionMatrix(matrix)
    } catch (error) {
      setPermissionsError(
        getErrorMessage(
          error,
          'No se pudo cargar la matriz de permisos.',
        ),
      )
    } finally {
      setLoadingPermissions(false)
    }
  }

  const openEditModal = async (
    role: RolApi,
  ) => {
    setEditingId(role.idRol)
    setForm({
      nombreRol: role.nombreRol,
      descripcion: role.descripcion ?? '',
      estado: role.estado,
    })
    setErrors({})
    setPermissionMatrix(null)
    setPermissionsError(null)
    setModalOpen(true)
    setLoadingPermissions(true)

    try {
      const response =
        await rolesApi.obtenerMatrizPermisos(
          role.idRol,
        )

      setPermissionMatrix({
        acciones: response.acciones,
        modulos: response.modulos,
      })
    } catch (error) {
      setPermissionsError(
        getErrorMessage(
          error,
          'No se pudieron cargar los permisos del rol.',
        ),
      )
    } finally {
      setLoadingPermissions(false)
    }
  }

  const togglePermission = (
    idPermiso: number,
  ) => {
    setPermissionMatrix((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        modulos: current.modulos.map(
          (modulo) => ({
            ...modulo,
            permisos:
              modulo.permisos.map(
                (permiso) =>
                  permiso.idPermiso ===
                    idPermiso
                    ? {
                      ...permiso,
                      permitido:
                        !permiso.permitido,
                    }
                    : permiso,
              ),
          }),
        ),
      }
    })

    setErrors((current) => ({
      ...current,
      permisos: '',
    }))
  }

  const setAllPermissions = (
    permitido: boolean,
  ) => {
    setPermissionMatrix((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        modulos: current.modulos.map(
          (modulo) => ({
            ...modulo,
            permisos:
              modulo.permisos.map(
                (permiso) => ({
                  ...permiso,
                  permitido,
                }),
              ),
          }),
        ),
      }
    })
  }

  const setModulePermissions = (
    idModulo: number,
    permitido: boolean,
  ) => {
    setPermissionMatrix((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        modulos: current.modulos.map(
          (modulo) =>
            modulo.idModulo === idModulo
              ? {
                ...modulo,
                permisos:
                  modulo.permisos.map(
                    (permiso) => ({
                      ...permiso,
                      permitido,
                    }),
                  ),
              }
              : modulo,
        ),
      }
    })
  }

  const setActionPermissions = (
    idAccion: number,
    permitido: boolean,
  ) => {
    setPermissionMatrix((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        modulos: current.modulos.map(
          (modulo) => ({
            ...modulo,
            permisos:
              modulo.permisos.map(
                (permiso) =>
                  permiso.idAccion ===
                    idAccion
                    ? {
                      ...permiso,
                      permitido,
                    }
                    : permiso,
              ),
          }),
        ),
      }
    })
  }

  const isModuleFullySelected = (
    idModulo: number,
  ): boolean => {
    const module =
      permissionMatrix?.modulos.find(
        (item) =>
          item.idModulo === idModulo,
      )

    return Boolean(
      module &&
      module.permisos.length > 0 &&
      module.permisos.every(
        (permission) =>
          permission.permitido,
      ),
    )
  }

  const isActionFullySelected = (
    idAccion: number,
  ): boolean => {
    if (!permissionMatrix) {
      return false
    }

    const permissions =
      permissionMatrix.modulos.flatMap(
        (modulo) =>
          modulo.permisos.filter(
            (permission) =>
              permission.idAccion ===
              idAccion,
          ),
      )

    return (
      permissions.length > 0 &&
      permissions.every(
        (permission) =>
          permission.permitido,
      )
    )
  }

  const buildPermissionsPayload = () =>
    permissionMatrix?.modulos.flatMap(
      (modulo) =>
        modulo.permisos.map(
          (permission) => ({
            idPermiso:
              permission.idPermiso,
            permitido:
              permission.permitido,
          }),
        ),
    ) ?? []

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)

    let persistedRole: RolApi | null =
      null

    try {
      const rolePayload = buildPayload()

      persistedRole =
        editingId === null
          ? await rolesApi.crear(
            rolePayload,
          )
          : await rolesApi.actualizar(
            editingId,
            rolePayload,
          )

      await rolesApi.guardarMatrizPermisos(
        persistedRole.idRol,
        buildPermissionsPayload(),
      )

      setRoles((current) => {
        const exists = current.some(
          (role) =>
            role.idRol ===
            persistedRole?.idRol,
        )

        if (!persistedRole) {
          return current
        }

        if (!exists) {
          return [
            ...current,
            persistedRole,
          ]
        }

        return current.map((role) =>
          role.idRol ===
            persistedRole?.idRol
            ? persistedRole
            : role,
        )
      })

      setToast({
        message:
          editingId === null
            ? `Rol "${persistedRole.nombreRol}" creado con ${selectedPermissions} permiso(s).`
            : `Rol actualizado con ${selectedPermissions} permiso(s).`,
        type: 'success',
      })

      resetModalState()
    } catch (error) {
      if (persistedRole) {
        await loadRoles(false)
      }

      setToast({
        message: getErrorMessage(
          error,
          persistedRole
            ? 'El rol fue guardado, pero no fue posible completar la asignación de permisos.'
            : 'No se pudo guardar el rol.',
        ),
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (
    role: RolApi,
  ) => {
    setProcessingId(role.idRol)

    try {
      const nextStatus: EstadoRol =
        role.estado === 'ACTIVO'
          ? 'INACTIVO'
          : 'ACTIVO'

      const updatedRole =
        await rolesApi.actualizar(
          role.idRol,
          {
            estado: nextStatus,
          },
        )

      setRoles((current) =>
        current.map((item) =>
          item.idRol === role.idRol
            ? updatedRole
            : item,
        ),
      )

      setToast({
        message:
          updatedRole.estado === 'ACTIVO'
            ? 'Rol activado correctamente.'
            : 'Rol inactivado correctamente.',
        type: 'success',
      })
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudo cambiar el estado del rol.',
        ),
        type: 'error',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (
    role: RolApi,
  ) => {
    if (role.totalUsuarios > 0) {
      setToast({
        message: `No se puede eliminar: tiene ${role.totalUsuarios} usuario(s) asignado(s).`,
        type: 'error',
      })
      return
    }

    const confirmed = window.confirm(
      `¿Deseas inactivar el rol "${role.nombreRol}"?`,
    )

    if (!confirmed) {
      return
    }

    setProcessingId(role.idRol)

    try {
      const updatedRole =
        await rolesApi.inactivar(
          role.idRol,
        )

      setRoles((current) =>
        current.map((item) =>
          item.idRol === role.idRol
            ? updatedRole
            : item,
        ),
      )

      setToast({
        message: 'Rol eliminado.',
        type: 'success',
      })
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No se pudo eliminar el rol.',
        ),
        type: 'error',
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Roles',
            value: summary.totalRoles,
            color: 'var(--gold)',
          },
          {
            label: 'Activos',
            value: summary.activeRoles,
            color: '#4ade80',
          },
          {
            label: 'Usuarios Asignados',
            value: summary.assignedUsers,
            color: '#60a5fa',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-4"
            style={{
              background: 'var(--card)',
              border:
                '1px solid var(--border)',
            }}
          >
            <p
              className="font-mono-data text-2xl font-bold"
              style={{
                color: card.color,
              }}
            >
              {card.value}
            </p>

            <p
              className="text-[10px] tracking-wide mt-1"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1"
          style={{
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
          }}
        >
          <Search
            size={13}
            style={{
              color:
                'var(--muted-foreground)',
            }}
          />

          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            className="bg-transparent outline-none text-xs w-full"
            style={{
              color: 'var(--foreground)',
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
            >
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
          type="button"
          onClick={() =>
            void openCreateModal()
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
          style={{
            background: 'var(--gold)',
            color:
              'var(--primary-foreground)',
          }}
        >
          <Plus size={13} />
          Nuevo Rol
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'var(--card)',
          border:
            '1px solid var(--border)',
        }}
      >
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2">
            <Loader2
              size={18}
              className="animate-spin"
              style={{
                color: 'var(--gold)',
              }}
            />

            <span
              className="text-xs"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              Cargando roles...
            </span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr
                style={{
                  background:
                    'var(--secondary)',
                  borderBottom:
                    '1px solid var(--border)',
                }}
              >
                {[
                  'Rol',
                  'Descripción',
                  'Usuarios',
                  'Creado',
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
              {filteredRoles.map(
                (role) => {
                  const processing =
                    processingId ===
                    role.idRol

                  return (
                    <tr
                      key={role.idRol}
                      style={{
                        borderBottom:
                          '1px solid rgba(255,255,255,0.04)',
                      }}
                      onMouseEnter={(
                        event,
                      ) => {
                        event.currentTarget.style.background =
                          'rgba(255,255,255,0.02)'
                      }}
                      onMouseLeave={(
                        event,
                      ) => {
                        event.currentTarget.style.background =
                          'transparent'
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background:
                                'rgba(200,168,75,0.1)',
                              color:
                                'var(--gold)',
                            }}
                          >
                            {role.nombreRol.charAt(
                              0,
                            )}
                          </div>

                          <div>
                            <p
                              style={{
                                color:
                                  'var(--foreground)',
                              }}
                            >
                              {
                                role.nombreRol
                              }
                            </p>

                            <p
                              style={{
                                color:
                                  'var(--muted-foreground)',
                                fontSize:
                                  '10px',
                              }}
                            >
                              {formatRoleCode(
                                role.idRol,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className="px-5 py-4"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        {role.descripcion ||
                          'Sin descripción'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="font-mono-data font-bold text-sm"
                          style={{
                            color:
                              role.totalUsuarios >
                                0
                                ? 'var(--foreground)'
                                : 'var(--muted-foreground)',
                          }}
                        >
                          {
                            role.totalUsuarios
                          }
                        </span>
                      </td>

                      <td
                        className="px-5 py-4"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        {formatDate(
                          role.fechaCreacion,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="px-2.5 py-1 rounded text-[10px] font-medium"
                          style={{
                            background:
                              role.estado ===
                                'ACTIVO'
                                ? 'rgba(74,222,128,0.1)'
                                : 'rgba(248,113,113,0.1)',
                            color:
                              role.estado ===
                                'ACTIVO'
                                ? '#4ade80'
                                : '#f87171',
                          }}
                        >
                          {role.estado ===
                            'ACTIVO'
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Editar rol y permisos"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              void openEditModal(
                                role,
                              )
                            }
                            className="p-1.5 rounded"
                            style={{
                              color:
                                'var(--muted-foreground)',
                              opacity:
                                processing
                                  ? 0.5
                                  : 1,
                            }}
                            onMouseEnter={(
                              event,
                            ) => {
                              if (
                                !processing
                              ) {
                                event.currentTarget.style.color =
                                  'var(--gold)'
                              }
                            }}
                            onMouseLeave={(
                              event,
                            ) => {
                              event.currentTarget.style.color =
                                'var(--muted-foreground)'
                            }}
                          >
                            <Edit2
                              size={13}
                            />
                          </button>

                          <button
                            type="button"
                            title={
                              role.estado ===
                                'ACTIVO'
                                ? 'Desactivar'
                                : 'Activar'
                            }
                            disabled={
                              processing
                            }
                            onClick={() =>
                              void handleToggleStatus(
                                role,
                              )
                            }
                            style={{
                              color:
                                role.estado ===
                                  'ACTIVO'
                                  ? '#4ade80'
                                  : '#f87171',
                              opacity:
                                processing
                                  ? 0.5
                                  : 1,
                            }}
                          >
                            {processing ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : role.estado ===
                              'ACTIVO' ? (
                              <ToggleRight
                                size={15}
                              />
                            ) : (
                              <ToggleLeft
                                size={15}
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Eliminar"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              void handleDelete(
                                role,
                              )
                            }
                            className="p-1.5 rounded"
                            style={{
                              color:
                                'var(--muted-foreground)',
                              opacity:
                                processing
                                  ? 0.5
                                  : 1,
                            }}
                            onMouseEnter={(
                              event,
                            ) => {
                              if (
                                !processing
                              ) {
                                event.currentTarget.style.color =
                                  '#f87171'
                              }
                            }}
                            onMouseLeave={(
                              event,
                            ) => {
                              event.currentTarget.style.color =
                                'var(--muted-foreground)'
                            }}
                          >
                            <Trash2
                              size={13}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                },
              )}

              {filteredRoles.length ===
                0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      No se encontraron
                      roles.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        )}

        <div
          className="px-5 py-3"
          style={{
            borderTop:
              '1px solid var(--border)',
          }}
        >
          <p
            className="text-[10px]"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            {filteredRoles.length}{' '}
            rol(es) encontrado(s)
          </p>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingId === null
            ? 'Nuevo Rol'
            : 'Editar Rol'
        }
        size="lg"
      >
        <div className="max-h-[72vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nombre del rol"
              required
            >
              <Input
                value={form.nombreRol}
                onChange={(event) =>
                  setField(
                    'nombreRol',
                    event.target.value,
                  )
                }
                placeholder="Ej: Auditor"
              />

              {errors.nombreRol && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.nombreRol}
                </p>
              )}
            </Field>

            <Field label="Descripción">
              <Input
                value={form.descripcion}
                onChange={(event) =>
                  setField(
                    'descripcion',
                    event.target.value,
                  )
                }
                placeholder="Breve descripción del rol"
              />

              {errors.descripcion && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.descripcion}
                </p>
              )}
            </Field>

            {editingId !== null && (
              <Field label="Estado">
                <select
                  value={form.estado}
                  onChange={(event) =>
                    setField(
                      'estado',
                      event.target
                        .value as EstadoRol,
                    )
                  }
                  className="w-full rounded px-3 py-2.5 text-xs outline-none"
                  style={{
                    background:
                      'var(--card)',
                    border:
                      '1px solid var(--border)',
                    color:
                      'var(--foreground)',
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
            )}
          </div>

          <div
            className="mt-6 pt-5"
            style={{
              borderTop:
                '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color:
                      'var(--foreground)',
                  }}
                >
                  Matriz de Permisos
                </h3>

                <p
                  className="text-[10px] mt-1"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  {selectedPermissions} de{' '}
                  {totalPermissions}{' '}
                  permisos seleccionados
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    loadingPermissions ||
                    !permissionMatrix
                  }
                  onClick={() =>
                    setAllPermissions(true)
                  }
                  className="px-3 py-1.5 rounded text-[10px] font-medium"
                  style={{
                    background:
                      'rgba(200,168,75,0.1)',
                    color:
                      'var(--gold)',
                    border:
                      '1px solid var(--gold-dim)',
                  }}
                >
                  Marcar todos
                </button>

                <button
                  type="button"
                  disabled={
                    loadingPermissions ||
                    !permissionMatrix
                  }
                  onClick={() =>
                    setAllPermissions(false)
                  }
                  className="px-3 py-1.5 rounded text-[10px] font-medium"
                  style={{
                    background:
                      'var(--muted)',
                    color:
                      'var(--muted-foreground)',
                    border:
                      '1px solid var(--border)',
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>

            {loadingPermissions ? (
              <div
                className="flex items-center justify-center gap-2 py-16 rounded-lg"
                style={{
                  background:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                <Loader2
                  size={18}
                  className="animate-spin"
                  style={{
                    color: 'var(--gold)',
                  }}
                />

                <span
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Cargando permisos...
                </span>
              </div>
            ) : permissionsError ? (
              <div
                className="rounded-lg p-4 text-xs"
                style={{
                  background:
                    'rgba(248,113,113,0.08)',
                  border:
                    '1px solid rgba(248,113,113,0.25)',
                  color: '#f87171',
                }}
              >
                {permissionsError}
              </div>
            ) : permissionMatrix ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-xs">
                    <thead>
                      <tr
                        style={{
                          background:
                            'var(--secondary)',
                          borderBottom:
                            '1px solid var(--border)',
                        }}
                      >
                        <th
                          className="text-left px-5 py-3 font-medium tracking-widest uppercase min-w-[230px]"
                          style={{
                            color:
                              'var(--muted-foreground)',
                            fontSize:
                              '9px',
                          }}
                        >
                          Módulo
                        </th>

                        {permissionMatrix.acciones.map(
                          (action) => (
                            <th
                              key={
                                action.idAccion
                              }
                              className="px-4 py-3 text-center font-medium tracking-widest uppercase min-w-[88px]"
                              style={{
                                color:
                                  'var(--muted-foreground)',
                                fontSize:
                                  '9px',
                              }}
                            >
                              <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                                <span>
                                  {
                                    action.codigo
                                  }
                                </span>

                                <input
                                  type="checkbox"
                                  checked={isActionFullySelected(
                                    action.idAccion,
                                  )}
                                  onChange={(
                                    event,
                                  ) =>
                                    setActionPermissions(
                                      action.idAccion,
                                      event
                                        .target
                                        .checked,
                                    )
                                  }
                                  aria-label={`Seleccionar toda la columna ${action.nombre}`}
                                  className="w-3.5 h-3.5 cursor-pointer"
                                  style={{
                                    accentColor:
                                      'var(--gold)',
                                  }}
                                />
                              </label>
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {permissionMatrix.modulos.map(
                        (module) => (
                          <tr
                            key={
                              module.idModulo
                            }
                            style={{
                              borderBottom:
                                '1px solid rgba(255,255,255,0.04)',
                            }}
                            onMouseEnter={(
                              event,
                            ) => {
                              event.currentTarget.style.background =
                                'rgba(255,255,255,0.02)'
                            }}
                            onMouseLeave={(
                              event,
                            ) => {
                              event.currentTarget.style.background =
                                'transparent'
                            }}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isModuleFullySelected(
                                    module.idModulo,
                                  )}
                                  onChange={(
                                    event,
                                  ) =>
                                    setModulePermissions(
                                      module.idModulo,
                                      event
                                        .target
                                        .checked,
                                    )
                                  }
                                  aria-label={`Seleccionar todos los permisos de ${module.nombre}`}
                                  className="w-3.5 h-3.5 cursor-pointer mt-0.5"
                                  style={{
                                    accentColor:
                                      'var(--gold)',
                                  }}
                                />

                                <div>
                                  <p
                                    className="font-medium"
                                    style={{
                                      color:
                                        'var(--foreground)',
                                    }}
                                  >
                                    {
                                      module.nombre
                                    }
                                  </p>

                                  <p
                                    className="text-[10px] mt-1"
                                    style={{
                                      color:
                                        'var(--muted-foreground)',
                                    }}
                                  >
                                    {module.descripcion ||
                                      module.codigo}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {permissionMatrix.acciones.map(
                              (
                                action,
                              ) => {
                                const permission =
                                  module.permisos.find(
                                    (
                                      item,
                                    ) =>
                                      item.idAccion ===
                                      action.idAccion,
                                  )

                                return (
                                  <td
                                    key={`${module.idModulo}-${action.idAccion}`}
                                    className="px-4 py-4 text-center"
                                  >
                                    {permission ? (
                                      <input
                                        type="checkbox"
                                        checked={
                                          permission.permitido
                                        }
                                        onChange={() =>
                                          togglePermission(
                                            permission.idPermiso,
                                          )
                                        }
                                        aria-label={`${action.nombre} en ${module.nombre}`}
                                        className="w-4 h-4 cursor-pointer"
                                        style={{
                                          accentColor:
                                            'var(--gold)',
                                        }}
                                      />
                                    ) : (
                                      <span
                                        style={{
                                          color:
                                            'var(--muted-foreground)',
                                          opacity:
                                            0.35,
                                        }}
                                      >
                                        —
                                      </span>
                                    )}
                                  </td>
                                )
                              },
                            )}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {errors.permisos && (
              <p
                className="text-[10px] mt-2"
                style={{
                  color: '#f87171',
                }}
              >
                {errors.permisos}
              </p>
            )}
          </div>
        </div>

        <div
          className="flex justify-end gap-3 mt-6 pt-4"
          style={{
            borderTop:
              '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={closeModal}
            disabled={saving}
            className="px-4 py-2.5 rounded text-xs"
            style={{
              background: 'var(--muted)',
              color:
                'var(--muted-foreground)',
              border:
                '1px solid var(--border)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSubmit()
            }
            disabled={
              saving ||
              loadingPermissions ||
              Boolean(permissionsError) ||
              !permissionMatrix
            }
            className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2"
            style={{
              background: 'var(--gold)',
              color:
                'var(--primary-foreground)',
              opacity:
                saving ||
                  loadingPermissions ||
                  permissionsError ||
                  !permissionMatrix
                  ? 0.6
                  : 1,
            }}
          >
            {saving && (
              <Loader2
                size={13}
                className="animate-spin"
              />
            )}

            {editingId === null
              ? 'Crear Rol'
              : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}
    </div>
  )
}