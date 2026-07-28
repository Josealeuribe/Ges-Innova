import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';

import Modal, {
  Field,
  Input,
  Select,
  Toast,
} from '@/components/Modal';

import {
  actualizar,
  crear,
  eliminar,
  listar,
  type Casino,
  type CasinoPayload,
  type EstadoRegistro,
} from './services/casinos.api';

import {
  listarCentrosCostosActivos,
  listarCiudadesActivas,
  listarRazonesSocialesActivas,
  type CentroCosto,
  type Ciudad,
  type RazonSocial,
} from './services/casino-relaciones.api';

interface CasinoForm {
  nombreCasino: string;
  codigoDane: string;
  codigoEstablecimiento: string;
  telefono: string;
  direccion: string;

  idCiudad: string;
  idCentroCosto: string;
  idRazonSocial: string;

  estado: EstadoRegistro;
}

type FormErrors = Partial<
  Record<keyof CasinoForm, string>
>;

const PAGE_SIZE = 20;

const EMPTY_FORM: CasinoForm = {
  nombreCasino: '',
  codigoDane: '',
  codigoEstablecimiento: '',
  telefono: '',
  direccion: '',

  idCiudad: '',
  idCentroCosto: '',
  idRazonSocial: '',

  estado: 'ACTIVO',
};

export default function CasinosPage() {
  const [casinos, setCasinos] = useState<
    Casino[]
  >([]);

  const [ciudades, setCiudades] = useState<
    Ciudad[]
  >([]);

  const [
    centrosCostos,
    setCentrosCostos,
  ] = useState<CentroCosto[]>([]);

  const [
    razonesSociales,
    setRazonesSociales,
  ] = useState<RazonSocial[]>([]);

  const [search, setSearch] = useState('');
  const [filterRS, setFilterRS] =
    useState('');
  const [filterEstado, setFilterEstado] =
    useState('');

  const [page, setPage] = useState(1);
  const [total, setTotal] =
    useState(0);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CasinoForm>({
      ...EMPTY_FORM,
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [loading, setLoading] =
    useState(true);

  const [
    loadingRelations,
    setLoadingRelations,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  const modalTitle =
    editingId === null
      ? 'Nuevo Casino'
      : 'Editar Casino';

  const loadRelations =
    useCallback(async () => {
      setLoadingRelations(true);

      try {
        const [
          ciudadesResponse,
          centrosResponse,
          razonesResponse,
        ] = await Promise.all([
          listarCiudadesActivas(),
          listarCentrosCostosActivos(),
          listarRazonesSocialesActivas(),
        ]);

        setCiudades(ciudadesResponse);
        setCentrosCostos(
          centrosResponse,
        );
        setRazonesSociales(
          razonesResponse,
        );
      } catch (error) {
        setToast({
          message:
            error instanceof Error
              ? error.message
              : 'No fue posible cargar ciudades, centros de costos y razones sociales.',
          type: 'error',
        });
      } finally {
        setLoadingRelations(false);
      }
    }, []);

  const loadCasinos =
    useCallback(async () => {
      setLoading(true);

      try {
        const response = await listar(
          page,
          PAGE_SIZE,
          search || undefined,
          filterEstado
            ? (filterEstado as EstadoRegistro)
            : undefined,
          undefined,
          undefined,
          filterRS
            ? Number(filterRS)
            : undefined,
        );

        setCasinos(response.casinos);
        setTotal(response.total);
      } catch (error) {
        setCasinos([]);
        setTotal(0);

        setToast({
          message:
            error instanceof Error
              ? error.message
              : 'No fue posible cargar los casinos.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      filterEstado,
      filterRS,
    ]);

  useEffect(() => {
    void loadRelations();
  }, [loadRelations]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        void loadCasinos();
      },
      300,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadCasinos]);

  const currentRange = useMemo(() => {
    if (total === 0) {
      return '0';
    }

    const start =
      (page - 1) * PAGE_SIZE + 1;

    const end = Math.min(
      page * PAGE_SIZE,
      total,
    );

    return `${start}-${end} de ${total}`;
  }, [page, total]);

  function updateForm<
    K extends keyof CasinoForm,
  >(
    field: K,
    value: CasinoForm[K],
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.nombreCasino.trim()) {
      nextErrors.nombreCasino =
        'El nombre es obligatorio.';
    }

    if (!form.codigoDane.trim()) {
      nextErrors.codigoDane =
        'El código DANE es obligatorio.';
    }

    if (
      !form.codigoEstablecimiento.trim()
    ) {
      nextErrors.codigoEstablecimiento =
        'El código de establecimiento es obligatorio.';
    }

    if (!form.telefono.trim()) {
      nextErrors.telefono =
        'El teléfono es obligatorio.';
    }

    if (!form.direccion.trim()) {
      nextErrors.direccion =
        'La dirección es obligatoria.';
    }

    if (!form.idCiudad) {
      nextErrors.idCiudad =
        'Selecciona una ciudad.';
    }

    if (!form.idCentroCosto) {
      nextErrors.idCentroCosto =
        'Selecciona un centro de costos.';
    }

    if (!form.idRazonSocial) {
      nextErrors.idRazonSocial =
        'Selecciona una razón social.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  }

  function openCreateModal(): void {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setModalOpen(true);
  }

  function openEditModal(
    casino: Casino,
  ): void {
    setEditingId(casino.idCasino);

    setForm({
      nombreCasino:
        casino.nombreCasino,

      codigoDane:
        casino.codigoDane,

      codigoEstablecimiento:
        casino.codigoEstablecimiento,

      telefono:
        casino.telefono,

      direccion:
        casino.direccion,

      idCiudad:
        casino.ciudad.idCiudad.toString(),

      idCentroCosto:
        casino.centroCosto.idCentroCosto.toString(),

      idRazonSocial:
        casino.razonSocial.idRazonSocial.toString(),

      estado:
        casino.estado,
    });

    setErrors({});
    setModalOpen(true);
  }

  function closeModal(): void {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingId(null);
    setErrors({});
  }

  async function handleSubmit(): Promise<void> {
    if (!validate()) {
      return;
    }

    const payload: CasinoPayload = {
      nombreCasino:
        form.nombreCasino.trim(),

      codigoDane:
        form.codigoDane.trim(),

      codigoEstablecimiento:
        form.codigoEstablecimiento.trim(),

      telefono:
        form.telefono.trim(),

      direccion:
        form.direccion.trim(),

      idCiudad:
        Number(form.idCiudad),

      idCentroCosto:
        Number(form.idCentroCosto),

      idRazonSocial:
        Number(form.idRazonSocial),

      estado:
        form.estado,
    };

    setSaving(true);

    try {
      if (editingId === null) {
        const created =
          await crear(payload);

        setToast({
          message: `Casino "${created.nombreCasino}" registrado correctamente.`,
          type: 'success',
        });
      } else {
        const updated =
          await actualizar(
            editingId,
            payload,
          );

        setToast({
          message: `Casino "${updated.nombreCasino}" actualizado correctamente.`,
          type: 'success',
        });
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadCasinos();
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible guardar el casino.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(
    casino: Casino,
  ): Promise<void> {
    const nuevoEstado: EstadoRegistro =
      casino.estado === 'ACTIVO'
        ? 'INACTIVO'
        : 'ACTIVO';

    setProcessingId(casino.idCasino);

    try {
      await actualizar(
        casino.idCasino,
        {
          estado: nuevoEstado,
        },
      );

      setToast({
        message:
          nuevoEstado === 'ACTIVO'
            ? 'Casino activado correctamente.'
            : 'Casino desactivado correctamente.',
        type: 'success',
      });

      await loadCasinos();
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible cambiar el estado.',
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteCasino(
    casino: Casino,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `¿Deseas desactivar el casino "${casino.nombreCasino}"?`,
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(casino.idCasino);

    try {
      await eliminar(casino.idCasino);

      setToast({
        message:
          'Casino desactivado correctamente.',
        type: 'success',
      });

      await loadCasinos();
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible desactivar el casino.',
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  }

  function clearFilters(): void {
    setSearch('');
    setFilterRS('');
    setFilterEstado('');
    setPage(1);
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
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
            placeholder="Nombre, dirección, código DANE, establecimiento..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value,
              );
              setPage(1);
            }}
            className="bg-transparent outline-none text-xs w-full"
            style={{
              color: 'var(--foreground)',
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
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
          value={filterRS}
          onChange={(event) => {
            setFilterRS(
              event.target.value,
            );
            setPage(1);
          }}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">
            Todas las razones sociales
          </option>

          {razonesSociales.map(
            (razon) => (
              <option
                key={
                  razon.idRazonSocial
                }
                value={
                  razon.idRazonSocial
                }
              >
                {razon.nit} —{' '}
                {
                  razon.nombreRazonSocial
                }
              </option>
            ),
          )}
        </select>

        <select
          value={filterEstado}
          onChange={(event) => {
            setFilterEstado(
              event.target.value,
            );
            setPage(1);
          }}
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">
            Todos los estados
          </option>
          <option value="ACTIVO">
            Activos
          </option>
          <option value="INACTIVO">
            Inactivos
          </option>
        </select>

        {(search ||
          filterRS ||
          filterEstado) && (
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

        <button
          type="button"
          onClick={() =>
            void loadCasinos()
          }
          className="p-2.5 rounded"
          disabled={loading}
          title="Actualizar"
          style={{
            background: 'var(--muted)',
            color:
              'var(--muted-foreground)',
            border:
              '1px solid var(--border)',
          }}
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />
        </button>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold ml-auto"
          style={{
            background: 'var(--gold)',
            color:
              'var(--primary-foreground)',
          }}
        >
          <Plus size={13} />
          Nuevo Casino
        </button>
      </div>

      <div
        className="rounded-lg overflow-x-auto"
        style={{
          background: 'var(--card)',
          border:
            '1px solid var(--border)',
        }}
      >
        <table className="w-full text-xs min-w-[1250px]">
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
                'Casino',
                'Contacto',
                'Ubicación',
                'Cód. DANE',
                'Cód. establecimiento',
                'Centro de costos',
                'Razón social',
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
            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-12 text-center"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  <div className="flex justify-center items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Cargando casinos...
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              casinos.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center"
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  >
                    No se encontraron casinos.
                  </td>
                </tr>
              )}

            {!loading &&
              casinos.map((casino) => {
                const processing =
                  processingId ===
                  casino.idCasino;

                return (
                  <tr
                    key={casino.idCasino}
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,0.04)',
                    }}
                    onMouseEnter={(
                      event,
                    ) => {
                      event.currentTarget.style.background =
                        'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={(
                      event,
                    ) => {
                      event.currentTarget.style.background =
                        'transparent';
                    }}
                  >
                    <td className="px-5 py-4">
                      <p
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {
                          casino.nombreCasino
                        }
                      </p>

                      <p
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: '10px',
                        }}
                      >
                        ID: {casino.idCasino}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {casino.telefono}
                      </p>

                      <p
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: '10px',
                        }}
                      >
                        {casino.direccion}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {
                          casino.ciudad
                            .nombreCiudad
                        }
                      </p>
                    </td>

                    <td
                      className="px-5 py-4 font-mono-data"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      {casino.codigoDane}
                    </td>

                    <td
                      className="px-5 py-4 font-mono-data"
                      style={{
                        color: 'var(--gold)',
                      }}
                    >
                      {
                        casino.codigoEstablecimiento
                      }
                    </td>

                    <td className="px-5 py-4">
                      <p
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {
                          casino
                            .centroCosto
                            .nombreCentroCosto
                        }
                      </p>

                      <p
                        className="font-mono-data"
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: '10px',
                        }}
                      >
                        {
                          casino
                            .centroCosto
                            .codigoCentroCosto
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        style={{
                          color:
                            'var(--foreground)',
                        }}
                      >
                        {
                          casino
                            .razonSocial
                            .nombreRazonSocial
                        }
                      </p>

                      <p
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: '10px',
                        }}
                      >
                        NIT:{' '}
                        {
                          casino
                            .razonSocial
                            .nit
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded text-[10px] font-medium"
                        style={{
                          background:
                            casino.estado ===
                              'ACTIVO'
                              ? 'rgba(74,222,128,0.1)'
                              : 'rgba(248,113,113,0.1)',

                          color:
                            casino.estado ===
                              'ACTIVO'
                              ? '#4ade80'
                              : '#f87171',
                        }}
                      >
                        {casino.estado ===
                          'ACTIVO'
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded"
                          disabled={processing}
                          onClick={() =>
                            openEditModal(
                              casino,
                            )
                          }
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                          title="Editar"
                        >
                          <Edit2
                            size={13}
                          />
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() =>
                            void toggleEstado(
                              casino,
                            )
                          }
                          title={
                            casino.estado ===
                              'ACTIVO'
                              ? 'Desactivar'
                              : 'Activar'
                          }
                          style={{
                            color:
                              casino.estado ===
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
                          ) : casino.estado ===
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
                          disabled={processing}
                          onClick={() =>
                            void deleteCasino(
                              casino,
                            )
                          }
                          className="p-1.5 rounded"
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                          title="Desactivar"
                        >
                          <Trash2
                            size={13}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div
          className="px-5 py-3 flex items-center justify-between"
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
            Mostrando {currentRange}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                page <= 1 || loading
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
                )
              }
              className="px-3 py-1.5 rounded text-xs disabled:opacity-40"
              style={{
                background:
                  'var(--muted)',
                color:
                  'var(--muted-foreground)',
                border:
                  '1px solid var(--border)',
              }}
            >
              Anterior
            </button>

            <span
              className="text-[10px]"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              Página {page} de{' '}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page >= totalPages ||
                loading
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1,
                  ),
                )
              }
              className="px-3 py-1.5 rounded text-xs disabled:opacity-40"
              style={{
                background:
                  'var(--muted)',
                color:
                  'var(--muted-foreground)',
                border:
                  '1px solid var(--border)',
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalTitle}
      >
        <div className="space-y-4">
          <Field
            label="Nombre del Casino"
            required
          >
            <Input
              value={form.nombreCasino}
              onChange={(event) =>
                updateForm(
                  'nombreCasino',
                  event.target.value,
                )
              }
              placeholder="Ej: Innova Club — Sede Centro"
            />

            {errors.nombreCasino && (
              <p
                className="text-[10px] mt-1"
                style={{
                  color: '#f87171',
                }}
              >
                {errors.nombreCasino}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Código DANE"
              required
            >
              <Input
                value={form.codigoDane}
                onChange={(event) =>
                  updateForm(
                    'codigoDane',
                    event.target.value,
                  )
                }
                placeholder="Ej: DANE-CAS-001"
              />

              {errors.codigoDane && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.codigoDane}
                </p>
              )}
            </Field>

            <Field
              label="Código Establecimiento"
              required
            >
              <Input
                value={
                  form.codigoEstablecimiento
                }
                onChange={(event) =>
                  updateForm(
                    'codigoEstablecimiento',
                    event.target.value,
                  )
                }
                placeholder="Ej: EST-001"
              />

              {errors.codigoEstablecimiento && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {
                    errors.codigoEstablecimiento
                  }
                </p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Teléfono"
              required
            >
              <Input
                value={form.telefono}
                onChange={(event) =>
                  updateForm(
                    'telefono',
                    event.target.value,
                  )
                }
                placeholder="Ej: 6044445566"
              />

              {errors.telefono && (
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color: '#f87171',
                  }}
                >
                  {errors.telefono}
                </p>
              )}
            </Field>

            <Field
              label="Estado"
              required
            >
              <Select
                value={form.estado}
                onChange={(event) =>
                  updateForm(
                    'estado',
                    event.target
                      .value as EstadoRegistro,
                  )
                }
              >
                <option value="ACTIVO">
                  Activo
                </option>
                <option value="INACTIVO">
                  Inactivo
                </option>
              </Select>
            </Field>
          </div>

          <Field
            label="Dirección"
            required
          >
            <Input
              value={form.direccion}
              onChange={(event) =>
                updateForm(
                  'direccion',
                  event.target.value,
                )
              }
              placeholder="Ej: Carrera 43A # 10-25"
            />

            {errors.direccion && (
              <p
                className="text-[10px] mt-1"
                style={{
                  color: '#f87171',
                }}
              >
                {errors.direccion}
              </p>
            )}
          </Field>

          <Field
            label="Ciudad"
            required
          >
            <Select
              value={form.idCiudad}
              disabled={loadingRelations}
              onChange={(event) =>
                updateForm(
                  'idCiudad',
                  event.target.value,
                )
              }
            >
              <option value="">
                — Seleccionar ciudad —
              </option>

              {ciudades.map(
                (ciudad) => (
                  <option
                    key={
                      ciudad.idCiudad
                    }
                    value={
                      ciudad.idCiudad
                    }
                  >
                    {
                      ciudad.nombreCiudad
                    }
                  </option>
                ),
              )}
            </Select>

            {errors.idCiudad && (
              <p
                className="text-[10px] mt-1"
                style={{
                  color: '#f87171',
                }}
              >
                {errors.idCiudad}
              </p>
            )}
          </Field>

          <Field
            label="Centro de costos"
            required
          >
            <Select
              value={
                form.idCentroCosto
              }
              disabled={loadingRelations}
              onChange={(event) =>
                updateForm(
                  'idCentroCosto',
                  event.target.value,
                )
              }
            >
              <option value="">
                — Seleccionar centro de costos —
              </option>

              {centrosCostos.map(
                (centro) => (
                  <option
                    key={
                      centro.idCentroCosto
                    }
                    value={
                      centro.idCentroCosto
                    }
                  >
                    {
                      centro.codigoCentroCosto
                    }{' '}
                    —{' '}
                    {
                      centro.nombreCentroCosto
                    }
                  </option>
                ),
              )}
            </Select>

            {errors.idCentroCosto && (
              <p
                className="text-[10px] mt-1"
                style={{
                  color: '#f87171',
                }}
              >
                {
                  errors.idCentroCosto
                }
              </p>
            )}
          </Field>

          <Field
            label="Razón Social"
            required
          >
            <Select
              value={
                form.idRazonSocial
              }
              disabled={loadingRelations}
              onChange={(event) =>
                updateForm(
                  'idRazonSocial',
                  event.target.value,
                )
              }
            >
              <option value="">
                — Seleccionar razón social —
              </option>

              {razonesSociales.map(
                (razon) => (
                  <option
                    key={
                      razon.idRazonSocial
                    }
                    value={
                      razon.idRazonSocial
                    }
                  >
                    {razon.nit} —{' '}
                    {
                      razon.nombreRazonSocial
                    }
                  </option>
                ),
              )}
            </Select>

            {errors.idRazonSocial && (
              <p
                className="text-[10px] mt-1"
                style={{
                  color: '#f87171',
                }}
              >
                {
                  errors.idRazonSocial
                }
              </p>
            )}
          </Field>
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
            className="px-4 py-2.5 rounded text-xs disabled:opacity-50"
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
            disabled={
              saving ||
              loadingRelations
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-semibold disabled:opacity-50"
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
              ? 'Registrar Casino'
              : 'Guardar Cambios'}
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
  );
}