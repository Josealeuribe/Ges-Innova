import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Download,
  Edit2,
  Eye,
  Image as ImageIcon,
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
  Select,
  Toast,
} from '@/components/Modal'
import {
  inventarioApi,
  type CasinoOption,
  type EstadoInventario,
  type EstadoRegistro,
  type InventarioItem,
  type InventarioPayload,
  type UsuarioOption,
} from './services/inventario.api'

const CLASIFICACIONES = [
  'Máquina',
  'Equipo tecnológico',
  'Mueble',
  'Herramienta',
  'Equipo de seguridad',
  'Elemento locativo',
  'Otro',
]

const ESTADOS: Array<{
  value: EstadoInventario
  label: string
}> = [
  {
    value: 'DISPONIBLE',
    label: 'Disponible',
  },
  {
    value: 'EN_USO',
    label: 'En uso',
  },
  {
    value: 'EN_MANTENIMIENTO',
    label: 'En mantenimiento',
  },
  {
    value: 'DANADO',
    label: 'Dañado',
  },
  {
    value: 'DADO_DE_BAJA',
    label: 'Dado de baja',
  },
]

interface FormState {
  fotoSerial: string
  fotoEstado: string
  codigo: string
  nombre: string
  serial: string
  clasificacion: string
  estado: EstadoInventario
  cantidad: string
  valor: string
  idCasino: string
  idResponsable: string
  ubicacionLocal: string
  fechaAdquisicion: string
  observaciones: string
}

const EMPTY_FORM: FormState = {
  fotoSerial: '',
  fotoEstado: '',
  codigo: '',
  nombre: '',
  serial: '',
  clasificacion: 'Máquina',
  estado: 'DISPONIBLE',
  cantidad: '1',
  valor: '',
  idCasino: '',
  idResponsable: '',
  ubicacionLocal: '',
  fechaAdquisicion: '',
  observaciones: '',
}

const STATE_COLOR:
  Record<EstadoInventario, string> = {
    DISPONIBLE: '#4ade80',
    EN_USO: '#60a5fa',
    EN_MANTENIMIENTO: '#c084fc',
    DANADO: '#f87171',
    DADO_DE_BAJA: '#6b7280',
  }

function getStateLabel(
  state: EstadoInventario,
): string {
  return (
    ESTADOS.find(
      (option) => option.value === state,
    )?.label ?? state
  )
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error
    ? error.message
    : fallback
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function onlyDate(
  value: string | null,
): string {
  return value ? value.slice(0, 10) : ''
}

function csvCell(value: unknown): string {
  const normalized = String(
    value ?? '',
  ).replace(/"/g, '""')

  return `"${normalized}"`
}

export default function InventarioPage() {
  const [items, setItems] =
    useState<InventarioItem[]>([])
  const [casinos, setCasinos] =
    useState<CasinoOption[]>([])
  const [responsables, setResponsables] =
    useState<UsuarioOption[]>([])

  const [search, setSearch] = useState('')
  const [filterClasif, setFilterClasif] =
    useState('')
  const [filterEstado, setFilterEstado] =
    useState<EstadoInventario | ''>('')
  const [filterRegistro, setFilterRegistro] =
    useState<EstadoRegistro | ''>('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] =
    useState<number | null>(null)

  const [modalOpen, setModalOpen] =
    useState(false)
  const [editingId, setEditingId] =
    useState<number | null>(null)
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] =
    useState<Record<string, string>>({})

  const [detailItem, setDetailItem] =
    useState<InventarioItem | null>(null)
  const [photoItem, setPhotoItem] =
    useState<InventarioItem | null>(null)

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  async function loadData(): Promise<void> {
    setLoading(true)

    try {
      const [
        inventoryResponse,
        casinoResponse,
        userResponse,
      ] = await Promise.all([
        inventarioApi.listar({
          page: 1,
          limit: 100,
        }),
        inventarioApi.listarCasinos(),
        inventarioApi.listarResponsables(),
      ])

      setItems(inventoryResponse.data)
      setCasinos(casinoResponse)
      setResponsables(userResponse)
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No fue posible cargar el inventario.',
        ),
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()

    return items.filter((item) => {
      const responsable = item.responsable
        ? `${item.responsable.nombre} ${item.responsable.apellido}`
        : ''

      const matchesSearch =
        !query ||
        [
          item.codigo,
          item.nombre,
          item.serial ?? '',
          item.clasificacion,
          item.casino.nombreCasino,
          responsable,
          item.ubicacionLocal ?? '',
        ].some((value) =>
          value.toLowerCase().includes(query),
        )

      const matchesClassification =
        !filterClasif ||
        item.clasificacion === filterClasif

      const matchesState =
        !filterEstado ||
        item.estado === filterEstado

      const matchesRecord =
        !filterRegistro ||
        item.estadoRegistro === filterRegistro

      return (
        matchesSearch &&
        matchesClassification &&
        matchesState &&
        matchesRecord
      )
    })
  }, [
    items,
    search,
    filterClasif,
    filterEstado,
    filterRegistro,
  ])

  const summary = useMemo(
    () => ({
      total: items.length,
      activos: items.filter(
        (item) =>
          item.estadoRegistro === 'ACTIVO',
      ).length,
      mantenimiento: items.filter(
        (item) =>
          item.estado ===
          'EN_MANTENIMIENTO',
      ).length,
      fueraServicio: items.filter(
        (item) =>
          item.estado === 'DANADO' ||
          item.estado ===
            'DADO_DE_BAJA',
      ).length,
    }),
    [items],
  )

  const hasFilters = Boolean(
    search ||
      filterClasif ||
      filterEstado ||
      filterRegistro,
  )

  function setField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }

  function validate(): boolean {
    const nextErrors:
      Record<string, string> = {}

    if (!form.codigo.trim()) {
      nextErrors.codigo = 'Requerido'
    } else {
      const duplicated = items.some(
        (item) =>
          item.idInventario !== editingId &&
          item.codigo.toLowerCase() ===
            form.codigo
              .trim()
              .toLowerCase(),
      )

      if (duplicated) {
        nextErrors.codigo =
          'Código ya registrado'
      }
    }

    if (!form.nombre.trim()) {
      nextErrors.nombre = 'Requerido'
    }

    if (!form.clasificacion.trim()) {
      nextErrors.clasificacion = 'Requerido'
    }

    if (!form.idCasino) {
      nextErrors.idCasino =
        'Selecciona un casino'
    }

    if (
      !Number.isInteger(
        Number(form.cantidad),
      ) ||
      Number(form.cantidad) <= 0
    ) {
      nextErrors.cantidad =
        'Debe ser un entero mayor que cero'
    }

    if (
      form.valor !== '' &&
      Number(form.valor) < 0
    ) {
      nextErrors.valor =
        'No puede ser negativo'
    }

    const today =
      new Date().toISOString().split('T')[0]

    if (
      form.fechaAdquisicion &&
      form.fechaAdquisicion > today
    ) {
      nextErrors.fechaAdquisicion =
        'No puede ser una fecha futura'
    }

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors).length === 0
    )
  }

  function buildPayload(): InventarioPayload {
    return {
      fotoSerial:
        form.fotoSerial.trim() || null,
      fotoEstado:
        form.fotoEstado.trim() || null,
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      serial: form.serial.trim() || null,
      clasificacion:
        form.clasificacion.trim(),
      estado: form.estado,
      cantidad: Number(form.cantidad),
      valor:
        form.valor === ''
          ? 0
          : Number(form.valor),
      idCasino: Number(form.idCasino),
      idResponsable:
        form.idResponsable === ''
          ? null
          : Number(form.idResponsable),
      ubicacionLocal:
        form.ubicacionLocal.trim() ||
        null,
      fechaAdquisicion:
        form.fechaAdquisicion || null,
      observaciones:
        form.observaciones.trim() ||
        null,
    }
  }

  function openCreateModal(): void {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(
    item: InventarioItem,
  ): void {
    setEditingId(item.idInventario)
    setForm({
      fotoSerial: item.fotoSerial ?? '',
      fotoEstado: item.fotoEstado ?? '',
      codigo: item.codigo,
      nombre: item.nombre,
      serial: item.serial ?? '',
      clasificacion:
        item.clasificacion,
      estado: item.estado,
      cantidad: String(item.cantidad),
      valor: String(item.valor),
      idCasino: String(item.idCasino),
      idResponsable:
        item.idResponsable === null
          ? ''
          : String(item.idResponsable),
      ubicacionLocal:
        item.ubicacionLocal ?? '',
      fechaAdquisicion: onlyDate(
        item.fechaAdquisicion,
      ),
      observaciones:
        item.observaciones ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal(): void {
    if (saving) return

    setModalOpen(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
  }

  async function handleSubmit(): Promise<void> {
    if (!validate()) return

    setSaving(true)

    try {
      const payload = buildPayload()

      const saved =
        editingId === null
          ? await inventarioApi.crear(
              payload,
            )
          : await inventarioApi.actualizar(
              editingId,
              payload,
            )

      setItems((current) => {
        if (editingId === null) {
          return [saved, ...current]
        }

        return current.map((item) =>
          item.idInventario === editingId
            ? saved
            : item,
        )
      })

      setToast({
        message:
          editingId === null
            ? `Activo "${saved.nombre}" registrado correctamente.`
            : `Activo "${saved.nombre}" actualizado correctamente.`,
        type: 'success',
      })

      closeModal()
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No fue posible guardar el activo.',
        ),
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function toggleEstadoRegistro(
    item: InventarioItem,
  ): Promise<void> {
    const nextState: EstadoRegistro =
      item.estadoRegistro === 'ACTIVO'
        ? 'INACTIVO'
        : 'ACTIVO'

    setProcessingId(item.idInventario)

    try {
      const updated =
        await inventarioApi.actualizar(
          item.idInventario,
          {
            estadoRegistro: nextState,
          },
        )

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.idInventario ===
          item.idInventario
            ? updated
            : currentItem,
        ),
      )

      setToast({
        message:
          nextState === 'ACTIVO'
            ? 'Activo habilitado correctamente.'
            : 'Activo deshabilitado correctamente.',
        type: 'success',
      })
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No fue posible cambiar el estado.',
        ),
        type: 'error',
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function deleteItem(
    item: InventarioItem,
  ): Promise<void> {
    const confirmed = window.confirm(
      `¿Deseas inactivar el activo "${item.nombre}"?`,
    )

    if (!confirmed) return

    setProcessingId(item.idInventario)

    try {
      const updated =
        await inventarioApi.inactivar(
          item.idInventario,
        )

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.idInventario ===
          item.idInventario
            ? updated
            : currentItem,
        ),
      )

      setToast({
        message:
          'Activo inactivado correctamente.',
        type: 'success',
      })
    } catch (error) {
      setToast({
        message: getErrorMessage(
          error,
          'No fue posible inactivar el activo.',
        ),
        type: 'error',
      })
    } finally {
      setProcessingId(null)
    }
  }

  function clearFilters(): void {
    setSearch('')
    setFilterClasif('')
    setFilterEstado('')
    setFilterRegistro('')
  }

  function exportCsv(): void {
    const headers = [
      'Código',
      'Nombre',
      'Serial',
      'Clasificación',
      'Estado',
      'Estado registro',
      'Cantidad',
      'Valor',
      'Casino',
      'Responsable',
      'Ubicación',
      'Fecha adquisición',
      'Observaciones',
    ]

    const rows = filtered.map((item) => [
      item.codigo,
      item.nombre,
      item.serial ?? '',
      item.clasificacion,
      getStateLabel(item.estado),
      item.estadoRegistro,
      item.cantidad,
      item.valor,
      item.casino.nombreCasino,
      item.responsable
        ? `${item.responsable.nombre} ${item.responsable.apellido}`
        : '',
      item.ubicacionLocal ?? '',
      onlyDate(item.fechaAdquisicion),
      item.observaciones ?? '',
    ])

    const csv = [
      headers.map(csvCell).join(','),
      ...rows.map((row) =>
        row.map(csvCell).join(','),
      ),
    ].join('\n')

    const blob = new Blob(
      ['\uFEFF', csv],
      {
        type: 'text/csv;charset=utf-8;',
      },
    )

    const url =
      URL.createObjectURL(blob)
    const anchor =
      document.createElement('a')

    anchor.href = url
    anchor.download =
      'inventario.csv'
    anchor.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Activos',
            value: summary.total,
            color: 'var(--gold)',
          },
          {
            label: 'Activos',
            value: summary.activos,
            color: '#4ade80',
          },
          {
            label: 'En Mantenimiento',
            value: summary.mantenimiento,
            color: '#c084fc',
          },
          {
            label: 'Fuera de Servicio',
            value: summary.fueraServicio,
            color: '#f87171',
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
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
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
            placeholder="Código, nombre, serial, responsable..."
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

        <select
          value={filterClasif}
          onChange={(event) =>
            setFilterClasif(
              event.target.value,
            )
          }
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">
            Clasificación
          </option>

          {CLASIFICACIONES.map(
            (classification) => (
              <option
                key={classification}
                value={classification}
              >
                {classification}
              </option>
            ),
          )}
        </select>

        <select
          value={filterEstado}
          onChange={(event) =>
            setFilterEstado(
              event.target
                .value as
                | EstadoInventario
                | '',
            )
          }
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">
            Estado
          </option>

          {ESTADOS.map((state) => (
            <option
              key={state.value}
              value={state.value}
            >
              {state.label}
            </option>
          ))}
        </select>

        <select
          value={filterRegistro}
          onChange={(event) =>
            setFilterRegistro(
              event.target
                .value as
                | EstadoRegistro
                | '',
            )
          }
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">Todos</option>
          <option value="ACTIVO">
            Activos
          </option>
          <option value="INACTIVO">
            Inactivos
          </option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs px-3 py-2.5 rounded"
            style={{
              background: 'var(--muted)',
              color:
                'var(--muted-foreground)',
              border:
                '1px solid var(--border)',
            }}
          >
            Limpiar
          </button>
        )}

        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded text-xs"
            style={{
              background: 'var(--muted)',
              color:
                'var(--muted-foreground)',
              border:
                '1px solid var(--border)',
            }}
          >
            <Download size={13} />
            Exportar
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold"
            style={{
              background: 'var(--gold)',
              color:
                'var(--primary-foreground)',
            }}
          >
            <Plus size={13} />
            Nuevo Activo
          </button>
        </div>
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
          <div className="flex items-center justify-center gap-2 py-16">
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
              Cargando inventario...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-xs">
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
                    'Código',
                    'Activo',
                    'Clasificación',
                    'Estado',
                    'Cantidad',
                    'Valor',
                    'Responsable',
                    'Adquisición',
                    'Fotos',
                    'Acciones',
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left px-4 py-3 font-medium tracking-widest uppercase"
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
                {filtered.map((item) => {
                  const color =
                    STATE_COLOR[item.estado]
                  const processing =
                    processingId ===
                    item.idInventario

                  return (
                    <tr
                      key={item.idInventario}
                      style={{
                        borderBottom:
                          '1px solid rgba(255,255,255,0.04)',
                        opacity:
                          item.estadoRegistro ===
                          'ACTIVO'
                            ? 1
                            : 0.5,
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          'rgba(255,255,255,0.02)'
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          'transparent'
                      }}
                    >
                      <td
                        className="px-4 py-3.5 font-mono-data font-semibold"
                        style={{
                          color: 'var(--gold)',
                        }}
                      >
                        {item.codigo}
                      </td>

                      <td className="px-4 py-3.5">
                        <p
                          style={{
                            color:
                              'var(--foreground)',
                          }}
                        >
                          {item.nombre}
                        </p>

                        <p
                          style={{
                            color:
                              'var(--muted-foreground)',
                            fontSize: '10px',
                          }}
                        >
                          {item.serial ||
                            'Sin serial'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className="px-2 py-1 rounded text-[10px]"
                          style={{
                            background:
                              'rgba(200,168,75,0.08)',
                            color:
                              'var(--gold-dim)',
                          }}
                        >
                          {item.clasificacion}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: color,
                            }}
                          />

                          <span
                            style={{
                              color,
                            }}
                          >
                            {getStateLabel(
                              item.estado,
                            )}
                          </span>
                        </span>
                      </td>

                      <td
                        className="px-4 py-3.5 font-mono-data"
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {item.cantidad}
                      </td>

                      <td
                        className="px-4 py-3.5 font-mono-data"
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {formatCurrency(
                          item.valor,
                        )}
                      </td>

                      <td
                        className="px-4 py-3.5"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        {item.responsable
                          ? `${item.responsable.nombre} ${item.responsable.apellido}`
                          : 'Sin responsable'}
                      </td>

                      <td
                        className="px-4 py-3.5"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        {onlyDate(
                          item.fechaAdquisicion,
                        ) || 'Sin fecha'}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoItem(item)
                          }
                          className="p-1.5 rounded"
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                          title="Ver fotos"
                        >
                          <ImageIcon size={13} />
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Ver"
                            onClick={() =>
                              setDetailItem(item)
                            }
                            className="p-1.5 rounded"
                            style={{
                              color:
                                'var(--muted-foreground)',
                            }}
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            title="Editar"
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="p-1.5 rounded"
                            style={{
                              color:
                                'var(--muted-foreground)',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            disabled={processing}
                            title={
                              item.estadoRegistro ===
                              'ACTIVO'
                                ? 'Desactivar'
                                : 'Activar'
                            }
                            onClick={() =>
                              void toggleEstadoRegistro(
                                item,
                              )
                            }
                            style={{
                              color:
                                item.estadoRegistro ===
                                'ACTIVO'
                                  ? '#4ade80'
                                  : '#f87171',
                            }}
                          >
                            {processing ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : item.estadoRegistro ===
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
                            disabled={processing}
                            onClick={() =>
                              void deleteItem(item)
                            }
                            className="p-1.5 rounded"
                            style={{
                              color:
                                'var(--muted-foreground)',
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
                      colSpan={10}
                      className="px-5 py-8 text-center text-xs"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      Sin activos para los filtros
                      aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            {filtered.length} activo(s)
            encontrado(s)
          </p>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingId === null
            ? 'Nuevo Activo'
            : 'Editar Activo'
        }
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="URL foto del serial">
              <Input
                value={form.fotoSerial}
                onChange={(event) =>
                  setField(
                    'fotoSerial',
                    event.target.value,
                  )
                }
                placeholder="/uploads/inventario/serial.webp"
              />

              {form.fotoSerial && (
                <img
                  src={form.fotoSerial}
                  alt="Serial"
                  className="mt-2 w-14 h-14 object-cover rounded"
                />
              )}
            </Field>

            <Field label="URL foto del estado">
              <Input
                value={form.fotoEstado}
                onChange={(event) =>
                  setField(
                    'fotoEstado',
                    event.target.value,
                  )
                }
                placeholder="/uploads/inventario/estado.webp"
              />

              {form.fotoEstado && (
                <img
                  src={form.fotoEstado}
                  alt="Estado"
                  className="mt-2 w-14 h-14 object-cover rounded"
                />
              )}
            </Field>

            <Field label="Código" required>
              <Input
                value={form.codigo}
                onChange={(event) =>
                  setField(
                    'codigo',
                    event.target.value,
                  )
                }
                placeholder="ACT-0006"
              />

              {errors.codigo && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.codigo}
                </p>
              )}
            </Field>

            <Field label="Nombre" required>
              <Input
                value={form.nombre}
                onChange={(event) =>
                  setField(
                    'nombre',
                    event.target.value,
                  )
                }
                placeholder="Nombre del activo"
              />

              {errors.nombre && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.nombre}
                </p>
              )}
            </Field>

            <Field label="Serial">
              <Input
                value={form.serial}
                onChange={(event) =>
                  setField(
                    'serial',
                    event.target.value,
                  )
                }
                placeholder="Serial del fabricante"
              />
            </Field>

            <Field
              label="Clasificación"
              required
            >
              <Select
                value={form.clasificacion}
                onChange={(event) =>
                  setField(
                    'clasificacion',
                    event.target.value,
                  )
                }
              >
                {CLASIFICACIONES.map(
                  (classification) => (
                    <option
                      key={classification}
                      value={classification}
                    >
                      {classification}
                    </option>
                  ),
                )}
              </Select>
            </Field>

            <Field label="Estado del activo">
              <Select
                value={form.estado}
                onChange={(event) =>
                  setField(
                    'estado',
                    event.target
                      .value as EstadoInventario,
                  )
                }
              >
                {ESTADOS.map((state) => (
                  <option
                    key={state.value}
                    value={state.value}
                  >
                    {state.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Cantidad" required>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.cantidad}
                onChange={(event) =>
                  setField(
                    'cantidad',
                    event.target.value,
                  )
                }
              />

              {errors.cantidad && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.cantidad}
                </p>
              )}
            </Field>

            <Field label="Valor (COP)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.valor}
                onChange={(event) =>
                  setField(
                    'valor',
                    event.target.value,
                  )
                }
                placeholder="0"
              />

              {errors.valor && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.valor}
                </p>
              )}
            </Field>

            <Field label="Casino" required>
              <Select
                value={form.idCasino}
                onChange={(event) =>
                  setField(
                    'idCasino',
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Seleccionar casino
                </option>

                {casinos.map((casino) => (
                  <option
                    key={casino.idCasino}
                    value={casino.idCasino}
                  >
                    {casino.nombreCasino}
                    {casino.codigoEstablecimiento
                      ? ` — ${casino.codigoEstablecimiento}`
                      : ''}
                  </option>
                ))}
              </Select>

              {errors.idCasino && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.idCasino}
                </p>
              )}
            </Field>

            <Field label="Responsable">
              <Select
                value={form.idResponsable}
                onChange={(event) =>
                  setField(
                    'idResponsable',
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Sin responsable
                </option>

                {responsables.map(
                  (responsable) => (
                    <option
                      key={responsable.id}
                      value={responsable.id}
                    >
                      {responsable.nombre}{' '}
                      {responsable.apellido}
                    </option>
                  ),
                )}
              </Select>
            </Field>

            <Field label="Ubicación local">
              <Input
                value={form.ubicacionLocal}
                onChange={(event) =>
                  setField(
                    'ubicacionLocal',
                    event.target.value,
                  )
                }
                placeholder="Sala principal, oficina..."
              />
            </Field>

            <Field label="Fecha de adquisición">
              <Input
                type="date"
                value={form.fechaAdquisicion}
                max={
                  new Date()
                    .toISOString()
                    .split('T')[0]
                }
                onChange={(event) =>
                  setField(
                    'fechaAdquisicion',
                    event.target.value,
                  )
                }
              />

              {errors.fechaAdquisicion && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.fechaAdquisicion}
                </p>
              )}
            </Field>

            <div className="sm:col-span-2">
              <Field label="Observaciones">
                <textarea
                  value={form.observaciones}
                  onChange={(event) =>
                    setField(
                      'observaciones',
                      event.target.value,
                    )
                  }
                  placeholder="Estado físico, ubicación, garantía..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded text-xs outline-none resize-none"
                  style={{
                    background: 'var(--muted)',
                    border:
                      '1px solid var(--border)',
                    color:
                      'var(--foreground)',
                  }}
                />
              </Field>
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-3 mt-5 pt-4"
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
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSubmit()
            }
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold"
            style={{
              background: 'var(--gold)',
              color:
                'var(--primary-foreground)',
            }}
          >
            {saving && (
              <Loader2
                size={13}
                className="animate-spin"
              />
            )}

            {editingId === null
              ? 'Registrar Activo'
              : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailItem !== null}
        onClose={() => setDetailItem(null)}
        title="Detalle del Activo"
        size="lg"
      >
        {detailItem && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              ['Código', detailItem.codigo],
              ['Nombre', detailItem.nombre],
              [
                'Serial',
                detailItem.serial ||
                  'Sin serial',
              ],
              [
                'Clasificación',
                detailItem.clasificacion,
              ],
              [
                'Estado',
                getStateLabel(
                  detailItem.estado,
                ),
              ],
              [
                'Estado registro',
                detailItem.estadoRegistro,
              ],
              [
                'Cantidad',
                detailItem.cantidad,
              ],
              [
                'Valor',
                formatCurrency(
                  detailItem.valor,
                ),
              ],
              [
                'Casino',
                detailItem.casino
                  .nombreCasino,
              ],
              [
                'Responsable',
                detailItem.responsable
                  ? `${detailItem.responsable.nombre} ${detailItem.responsable.apellido}`
                  : 'Sin responsable',
              ],
              [
                'Ubicación',
                detailItem.ubicacionLocal ||
                  'Sin ubicación',
              ],
              [
                'Adquisición',
                onlyDate(
                  detailItem.fechaAdquisicion,
                ) || 'Sin fecha',
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded p-3"
                style={{
                  background: 'var(--muted)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                <p
                  className="text-[9px] uppercase tracking-wider"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  {label}
                </p>

                <p
                  className="mt-1"
                  style={{
                    color:
                      'var(--foreground)',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}

            <div className="sm:col-span-2">
              <p
                className="text-[9px] uppercase tracking-wider"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                Observaciones
              </p>

              <p
                className="mt-1"
                style={{
                  color:
                    'var(--foreground)',
                }}
              >
                {detailItem.observaciones ||
                  'Sin observaciones'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Photo Modal */}
      <Modal
        open={photoItem !== null}
        onClose={() => setPhotoItem(null)}
        title="Fotos del Activo"
        size="lg"
      >
        {photoItem && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: 'Foto del serial',
                url: photoItem.fotoSerial,
              },
              {
                label: 'Foto del estado',
                url: photoItem.fotoEstado,
              },
            ].map((photo) => (
              <div key={photo.label}>
                <p
                  className="text-xs mb-2"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  {photo.label}
                </p>

                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-full max-h-80 object-contain rounded"
                    style={{
                      border:
                        '1px solid var(--border)',
                    }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center h-40 rounded text-xs"
                    style={{
                      background: 'var(--muted)',
                      color:
                        'var(--muted-foreground)',
                      border:
                        '1px solid var(--border)',
                    }}
                  >
                    Sin imagen
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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