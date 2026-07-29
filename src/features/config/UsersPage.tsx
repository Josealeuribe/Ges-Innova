import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';

import Modal, {
  Field,
  Input,
  Select,
  Toast,
} from '@/components/Modal';

import {
  ActualizarUsuarioPayload,
  ApiError,
  CrearUsuarioPayload,
  EstadoUsuario,
  UsuarioApi,
  UsuarioCatalogos,
  usuariosService,
} from './services/usuarios.services';

interface UserForm {
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  contrasena: string;
  confirmarContrasena: string;

  cargo: string;
  fechaNacimiento: string;
  telefono: string;

  codigoHelisa: string;
  cuentaPuc: string;
  imgUrl: string;

  estado: EstadoUsuario;

  idTipoDoc: string;
  idGenero: string;
  idRol: string;
  idDepartamento: string;
  idCiudad: string;
  idCasino: string;
}

const EMPTY_FORM: UserForm = {
  nombre: '',
  apellido: '',
  cedula: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',

  cargo: '',
  fechaNacimiento: '',
  telefono: '',

  codigoHelisa: '',
  cuentaPuc: '',
  imgUrl: '',

  estado: 'ACTIVO',

  idTipoDoc: '',
  idGenero: '',
  idRol: '',
  idDepartamento: '',
  idCiudad: '',
  idCasino: '',
};

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}

function formatUserId(id: number): string {
  return `USR-${String(id).padStart(4, '0')}`;
}

function toDateInput(value: string): string {
  return value.slice(0, 10);
}

export default function UsersPage() {
  const [users, setUsers] =
    useState<UsuarioApi[]>([]);

  const [catalogos, setCatalogos] =
    useState<UsuarioCatalogos | null>(null);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] =
    useState('');

  const [filterRol, setFilterRol] =
    useState('');

  const [filterEstado, setFilterEstado] =
    useState<'' | EstadoUsuario>('');

  const [loading, setLoading] = useState(true);
  const [loadingCatalogos, setLoadingCatalogos] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<UsuarioApi | null>(null);

  const [form, setForm] =
    useState<UserForm>(EMPTY_FORM);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filterRol,
    filterEstado,
  ]);

  const loadCatalogos = useCallback(
    async (): Promise<void> => {
      setLoadingCatalogos(true);

      try {
        const result =
          await usuariosService.obtenerCatalogos();

        setCatalogos(result);
      } catch (error: unknown) {
        setToast({
          message: getErrorMessage(error),
          type: 'error',
        });
      } finally {
        setLoadingCatalogos(false);
      }
    },
    [],
  );

  const loadUsers = useCallback(
    async (): Promise<void> => {
      setLoading(true);
      setPageError(null);

      try {
        const result =
          await usuariosService.listarUsuarios({
            page,
            limit: 20,
            buscar:
              debouncedSearch || undefined,
            estado:
              filterEstado || undefined,
            idRol:
              filterRol
                ? Number(filterRol)
                : undefined,
          });

        setUsers(result.data);
        setMeta(result.meta);
      } catch (error: unknown) {
        setPageError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      debouncedSearch,
      filterRol,
      filterEstado,
    ],
  );

  useEffect(() => {
    void loadCatalogos();
  }, [loadCatalogos]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const availableCities = useMemo(() => {
    if (!catalogos) {
      return [];
    }

    if (!form.idDepartamento) {
      return catalogos.ciudades;
    }

    return catalogos.ciudades.filter(
      (city) =>
        city.idDepartamento ===
        Number(form.idDepartamento),
    );
  }, [
    catalogos,
    form.idDepartamento,
  ]);

  const openCreateModal = (): void => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (
    user: UsuarioApi,
  ): void => {
    const city = catalogos?.ciudades.find(
      (item) =>
        item.idCiudad ===
        user.ciudad.idCiudad,
    );

    setEditingUser(user);

    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      cedula: user.cedula,
      correo: user.correo,
      contrasena: '',
      confirmarContrasena: '',

      cargo: user.cargo,
      fechaNacimiento: toDateInput(
        user.fechaNacimiento,
      ),
      telefono: user.telefono,

      codigoHelisa:
        user.codigoHelisa ?? '',
      cuentaPuc: user.cuentaPuc ?? '',
      imgUrl: user.imgUrl ?? '',

      estado: user.estado,

      idTipoDoc: String(
        user.tipoDocumento.idTipoDoc,
      ),
      idGenero: String(
        user.genero.idGenero,
      ),
      idRol: String(user.rol.idRol),
      idDepartamento: String(
        city?.idDepartamento ??
          user.ciudad.idDepartamento,
      ),
      idCiudad: String(
        user.ciudad.idCiudad,
      ),
      idCasino: String(
        user.casino.idCasino,
      ),
    });

    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> =
      {};

    if (!form.nombre.trim()) {
      nextErrors.nombre = 'Requerido';
    }

    if (!form.apellido.trim()) {
      nextErrors.apellido = 'Requerido';
    }

    if (!form.cedula.trim()) {
      nextErrors.cedula = 'Requerido';
    }

    if (!form.correo.trim()) {
      nextErrors.correo = 'Requerido';
    } else if (
      !/\S+@\S+\.\S+/.test(form.correo)
    ) {
      nextErrors.correo =
        'Formato de correo inválido';
    }

    if (!editingUser && !form.contrasena) {
      nextErrors.contrasena = 'Requerido';
    }

    if (
      form.contrasena &&
      form.contrasena.length < 8
    ) {
      nextErrors.contrasena =
        'Mínimo 8 caracteres';
    }

    if (
      form.contrasena !==
      form.confirmarContrasena
    ) {
      nextErrors.confirmarContrasena =
        'Las contraseñas no coinciden';
    }

    if (!form.cargo.trim()) {
      nextErrors.cargo = 'Requerido';
    }

    if (!form.fechaNacimiento) {
      nextErrors.fechaNacimiento =
        'Requerido';
    }

    if (!form.telefono.trim()) {
      nextErrors.telefono = 'Requerido';
    }

    if (!form.idTipoDoc) {
      nextErrors.idTipoDoc = 'Requerido';
    }

    if (!form.idGenero) {
      nextErrors.idGenero = 'Requerido';
    }

    if (!form.idRol) {
      nextErrors.idRol = 'Requerido';
    }

    if (!form.idDepartamento) {
      nextErrors.idDepartamento =
        'Requerido';
    }

    if (!form.idCiudad) {
      nextErrors.idCiudad = 'Requerido';
    }

    if (!form.idCasino) {
      nextErrors.idCasino = 'Requerido';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const buildBasePayload = () => ({
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    cedula: form.cedula.trim(),
    correo: form.correo
      .trim()
      .toLowerCase(),

    cargo: form.cargo.trim(),
    fechaNacimiento:
      form.fechaNacimiento,
    telefono: form.telefono.trim(),

    codigoHelisa:
      form.codigoHelisa.trim() || null,
    cuentaPuc:
      form.cuentaPuc.trim() || null,
    imgUrl: form.imgUrl.trim() || null,

    estado: form.estado,

    idTipoDoc: Number(form.idTipoDoc),
    idGenero: Number(form.idGenero),
    idRol: Number(form.idRol),
    idCiudad: Number(form.idCiudad),
    idCasino: Number(form.idCasino),
  });

  const handleSubmit =
    async (): Promise<void> => {
      if (!validate()) {
        return;
      }

      setSaving(true);

      try {
        if (editingUser) {
          const payload:
            ActualizarUsuarioPayload = {
              ...buildBasePayload(),
            };

          if (form.contrasena.trim()) {
            payload.contrasena =
              form.contrasena;
          }

          await usuariosService.actualizarUsuario(
            editingUser.id,
            payload,
          );

          setToast({
            message:
              'Usuario actualizado correctamente.',
            type: 'success',
          });
        } else {
          const payload:
            CrearUsuarioPayload = {
              ...buildBasePayload(),
              contrasena: form.contrasena,
            };

          await usuariosService.crearUsuario(
            payload,
          );

          setToast({
            message:
              'Usuario creado correctamente.',
            type: 'success',
          });
        }

        setModalOpen(false);
        setEditingUser(null);
        setForm(EMPTY_FORM);

        if (page !== 1) {
          setPage(1);
        } else {
          await loadUsers();
        }
      } catch (error: unknown) {
        setToast({
          message: getErrorMessage(error),
          type: 'error',
        });
      } finally {
        setSaving(false);
      }
    };

  const toggleEstado =
    async (
      user: UsuarioApi,
    ): Promise<void> => {
      try {
        if (user.estado === 'ACTIVO') {
          await usuariosService.desactivarUsuario(
            user.id,
          );
        } else {
          await usuariosService.actualizarUsuario(
            user.id,
            {
              estado: 'ACTIVO',
            },
          );
        }

        setToast({
          message:
            user.estado === 'ACTIVO'
              ? 'Usuario desactivado.'
              : 'Usuario activado.',
          type: 'success',
        });

        await loadUsers();
      } catch (error: unknown) {
        setToast({
          message: getErrorMessage(error),
          type: 'error',
        });
      }
    };

  const clearFilters = (): void => {
    setSearch('');
    setFilterRol('');
    setFilterEstado('');
    setPage(1);
  };

  const hasFilters =
    search ||
    filterRol ||
    filterEstado;

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded flex-1 min-w-52"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
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
            placeholder="Nombre, cédula, correo, cargo..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
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
          value={filterRol}
          onChange={(event) =>
            setFilterRol(event.target.value)
          }
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">
            Todos los roles
          </option>

          {catalogos?.roles.map((role) => (
            <option
              key={role.idRol}
              value={role.idRol}
            >
              {role.nombreRol}
            </option>
          ))}
        </select>

        <select
          value={filterEstado}
          onChange={(event) =>
            setFilterEstado(
              event.target.value as
                | ''
                | EstadoUsuario,
            )
          }
          className="px-3 py-2.5 rounded text-xs outline-none"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">
            Todos los estados
          </option>
          <option value="ACTIVO">
            Activo
          </option>
          <option value="INACTIVO">
            Inactivo
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
            onClick={() => {
              void loadUsers();
              void loadCatalogos();
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded text-xs"
            style={{
              background: 'var(--muted)',
              color:
                'var(--muted-foreground)',
              border:
                '1px solid var(--border)',
            }}
          >
            <RefreshCw size={13} />
            Actualizar
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            disabled={
              loadingCatalogos ||
              !catalogos
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold disabled:opacity-50"
            style={{
              background: 'var(--gold)',
              color:
                'var(--primary-foreground)',
            }}
          >
            <Plus size={13} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {pageError && (
        <div
          className="rounded-lg px-4 py-3 text-xs"
          style={{
            background:
              'rgba(248,113,113,0.1)',
            color: '#f87171',
            border:
              '1px solid rgba(248,113,113,0.25)',
          }}
        >
          {pageError}
        </div>
      )}

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
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
                'Usuario',
                'Cédula',
                'Correo',
                'Cargo / Ubicación',
                'Rol',
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
                  colSpan={7}
                  className="px-5 py-10 text-center"
                >
                  <Loader2
                    size={20}
                    className="animate-spin mx-auto"
                    style={{
                      color: 'var(--gold)',
                    }}
                  />
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom:
                      '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-display flex-shrink-0"
                        style={{
                          background:
                            'rgba(200,168,75,0.15)',
                          color:
                            'var(--gold)',
                        }}
                      >
                        {user.nombre.charAt(0)}
                        {user.apellido.charAt(0)}
                      </div>

                      <div>
                        <p
                          style={{
                            color:
                              'var(--foreground)',
                          }}
                        >
                          {user.nombre}{' '}
                          {user.apellido}
                        </p>

                        <p
                          style={{
                            color:
                              'var(--muted-foreground)',
                            fontSize: '10px',
                          }}
                        >
                          {formatUserId(
                            user.id,
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td
                    className="px-5 py-3.5 font-mono-data"
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  >
                    {user.cedula}
                  </td>

                  <td
                    className="px-5 py-3.5"
                    style={{
                      color:
                        'var(--foreground)',
                    }}
                  >
                    {user.correo}
                  </td>

                  <td className="px-5 py-3.5">
                    <p
                      style={{
                        color:
                          'var(--foreground)',
                      }}
                    >
                      {user.cargo}
                    </p>

                    <p
                      style={{
                        color:
                          'var(--muted-foreground)',
                        fontSize: '10px',
                      }}
                    >
                      {user.ciudad.nombreCiudad}
                      {' · '}
                      {
                        user.ciudad
                          .departamento.nombre
                      }
                    </p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className="px-2 py-1 rounded text-[10px]"
                      style={{
                        background:
                          'rgba(200,168,75,0.1)',
                        color:
                          'var(--gold)',
                      }}
                    >
                      {user.rol.nombreRol}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded text-[10px] font-medium"
                      style={{
                        background:
                          user.estado ===
                          'ACTIVO'
                            ? 'rgba(74,222,128,0.1)'
                            : 'rgba(248,113,113,0.1)',
                        color:
                          user.estado ===
                          'ACTIVO'
                            ? '#4ade80'
                            : '#f87171',
                      }}
                    >
                      {user.estado ===
                      'ACTIVO'
                        ? 'Activo'
                        : 'Inactivo'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Editar"
                        onClick={() =>
                          openEditModal(user)
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
                        title={
                          user.estado ===
                          'ACTIVO'
                            ? 'Desactivar'
                            : 'Activar'
                        }
                        onClick={() => {
                          void toggleEstado(
                            user,
                          );
                        }}
                        className="p-1.5 rounded"
                        style={{
                          color:
                            user.estado ===
                            'ACTIVO'
                              ? '#4ade80'
                              : '#f87171',
                        }}
                      >
                        {user.estado ===
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
                    </div>
                  </td>
                </tr>
              ))}

            {!loading &&
              users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-xs"
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
          </tbody>
        </table>

        <div
          className="px-5 py-3 flex items-center justify-between gap-4"
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
            {meta.total} usuario(s)
            encontrado(s)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                loading || meta.page <= 1
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              className="p-2 rounded disabled:opacity-40"
              style={{
                border:
                  '1px solid var(--border)',
                color:
                  'var(--muted-foreground)',
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <span
              className="text-[10px]"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              Página {meta.page} de{' '}
              {Math.max(
                1,
                meta.totalPages,
              )}
            </span>

            <button
              type="button"
              disabled={
                loading ||
                meta.page >=
                  meta.totalPages
              }
              onClick={() =>
                setPage((current) =>
                  current + 1,
                )
              }
              className="p-2 rounded disabled:opacity-40"
              style={{
                border:
                  '1px solid var(--border)',
                color:
                  'var(--muted-foreground)',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() =>
          !saving && setModalOpen(false)
        }
        title={
          editingUser
            ? 'Editar Usuario'
            : 'Nuevo Usuario'
        }
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre" required>
            <Input
              value={form.nombre}
              onChange={(event) =>
                setForm({
                  ...form,
                  nombre:
                    event.target.value,
                })
              }
            />
            {errors.nombre && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.nombre}
              </p>
            )}
          </Field>

          <Field label="Apellido" required>
            <Input
              value={form.apellido}
              onChange={(event) =>
                setForm({
                  ...form,
                  apellido:
                    event.target.value,
                })
              }
            />
            {errors.apellido && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.apellido}
              </p>
            )}
          </Field>

          <Field label="Cédula" required>
            <Input
              value={form.cedula}
              onChange={(event) =>
                setForm({
                  ...form,
                  cedula:
                    event.target.value,
                })
              }
            />
            {errors.cedula && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.cedula}
              </p>
            )}
          </Field>

          <Field
            label="Correo electrónico"
            required
          >
            <Input
              type="email"
              value={form.correo}
              onChange={(event) =>
                setForm({
                  ...form,
                  correo:
                    event.target.value,
                })
              }
            />
            {errors.correo && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.correo}
              </p>
            )}
          </Field>

          <Field label="Cargo" required>
            <Input
              value={form.cargo}
              onChange={(event) =>
                setForm({
                  ...form,
                  cargo:
                    event.target.value,
                })
              }
            />
            {errors.cargo && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.cargo}
              </p>
            )}
          </Field>

          <Field
            label="Fecha de nacimiento"
            required
          >
            <Input
              type="date"
              value={form.fechaNacimiento}
              onChange={(event) =>
                setForm({
                  ...form,
                  fechaNacimiento:
                    event.target.value,
                })
              }
            />
            {errors.fechaNacimiento && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.fechaNacimiento}
              </p>
            )}
          </Field>

          <Field label="Teléfono" required>
            <Input
              value={form.telefono}
              onChange={(event) =>
                setForm({
                  ...form,
                  telefono:
                    event.target.value,
                })
              }
            />
            {errors.telefono && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.telefono}
              </p>
            )}
          </Field>

          <Field
            label="Tipo de documento"
            required
          >
            <Select
              value={form.idTipoDoc}
              onChange={(event) =>
                setForm({
                  ...form,
                  idTipoDoc:
                    event.target.value,
                })
              }
            >
              <option value="">
                Seleccionar
              </option>

              {catalogos?.tiposDocumento.map(
                (item) => (
                  <option
                    key={item.idTipoDoc}
                    value={item.idTipoDoc}
                  >
                    {item.nombreDoc}
                  </option>
                ),
              )}
            </Select>
            {errors.idTipoDoc && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.idTipoDoc}
              </p>
            )}
          </Field>

          <Field label="Género" required>
            <Select
              value={form.idGenero}
              onChange={(event) =>
                setForm({
                  ...form,
                  idGenero:
                    event.target.value,
                })
              }
            >
              <option value="">
                Seleccionar
              </option>

              {catalogos?.generos.map(
                (item) => (
                  <option
                    key={item.idGenero}
                    value={item.idGenero}
                  >
                    {item.nombreGenero}
                  </option>
                ),
              )}
            </Select>
            {errors.idGenero && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.idGenero}
              </p>
            )}
          </Field>

          <Field label="Rol" required>
            <Select
              value={form.idRol}
              onChange={(event) =>
                setForm({
                  ...form,
                  idRol:
                    event.target.value,
                })
              }
            >
              <option value="">
                Seleccionar
              </option>

              {catalogos?.roles.map(
                (item) => (
                  <option
                    key={item.idRol}
                    value={item.idRol}
                  >
                    {item.nombreRol}
                  </option>
                ),
              )}
            </Select>
            {errors.idRol && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.idRol}
              </p>
            )}
          </Field>

          <Field
            label="Departamento"
            required
          >
            <Select
              value={form.idDepartamento}
              onChange={(event) =>
                setForm({
                  ...form,
                  idDepartamento:
                    event.target.value,
                  idCiudad: '',
                })
              }
            >
              <option value="">
                Seleccionar
              </option>

              {catalogos?.departamentos.map(
                (item) => (
                  <option
                    key={
                      item.idDepartamento
                    }
                    value={
                      item.idDepartamento
                    }
                  >
                    {item.nombre}
                  </option>
                ),
              )}
            </Select>
            {errors.idDepartamento && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.idDepartamento}
              </p>
            )}
          </Field>

          <Field label="Ciudad" required>
            <Select
              value={form.idCiudad}
              disabled={
                !form.idDepartamento
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  idCiudad:
                    event.target.value,
                })
              }
            >
              <option value="">
                Seleccionar
              </option>

              {availableCities.map(
                (item) => (
                  <option
                    key={item.idCiudad}
                    value={item.idCiudad}
                  >
                    {item.nombreCiudad}
                  </option>
                ),
              )}
            </Select>
            {errors.idCiudad && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.idCiudad}
              </p>
            )}
          </Field>

          <Field label="Casino" required>
            <Select
              value={form.idCasino}
              onChange={(event) =>
                setForm({
                  ...form,
                  idCasino:
                    event.target.value,
                })
              }
            >
              <option value="">
                Seleccionar
              </option>

              {catalogos?.casinos.map(
                (item) => (
                  <option
                    key={item.idCasino}
                    value={item.idCasino}
                  >
                    {item.nombreCasino}
                  </option>
                ),
              )}
            </Select>
            {errors.idCasino && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.idCasino}
              </p>
            )}
          </Field>

          <Field label="Código Helisa">
            <Input
              value={form.codigoHelisa}
              onChange={(event) =>
                setForm({
                  ...form,
                  codigoHelisa:
                    event.target.value,
                })
              }
            />
          </Field>

          <Field label="Cuenta PUC">
            <Input
              value={form.cuentaPuc}
              onChange={(event) =>
                setForm({
                  ...form,
                  cuentaPuc:
                    event.target.value,
                })
              }
            />
          </Field>

          <Field label="URL de imagen">
            <Input
              value={form.imgUrl}
              onChange={(event) =>
                setForm({
                  ...form,
                  imgUrl:
                    event.target.value,
                })
              }
            />
          </Field>

          <Field label="Estado">
            <Select
              value={form.estado}
              onChange={(event) =>
                setForm({
                  ...form,
                  estado:
                    event.target
                      .value as EstadoUsuario,
                })
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

          <Field
            label={
              editingUser
                ? 'Nueva contraseña'
                : 'Contraseña'
            }
            required={!editingUser}
          >
            <Input
              type="password"
              value={form.contrasena}
              onChange={(event) =>
                setForm({
                  ...form,
                  contrasena:
                    event.target.value,
                })
              }
              placeholder={
                editingUser
                  ? 'Dejar vacía para conservarla'
                  : 'Mínimo 8 caracteres'
              }
            />
            {errors.contrasena && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.contrasena}
              </p>
            )}
          </Field>

          <Field
            label="Confirmar contraseña"
            required={
              !editingUser ||
              Boolean(form.contrasena)
            }
          >
            <Input
              type="password"
              value={
                form.confirmarContrasena
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  confirmarContrasena:
                    event.target.value,
                })
              }
            />
            {errors.confirmarContrasena && (
              <p className="text-[10px] mt-1 text-red-400">
                {
                  errors.confirmarContrasena
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
            disabled={saving}
            onClick={() =>
              setModalOpen(false)
            }
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
            disabled={saving}
            onClick={() => {
              void handleSubmit();
            }}
            className="px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{
              background: 'var(--gold)',
              color:
                'var(--primary-foreground)',
            }}
          >
            {saving && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            {editingUser
              ? 'Guardar cambios'
              : 'Crear Usuario'}
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
  );
}
