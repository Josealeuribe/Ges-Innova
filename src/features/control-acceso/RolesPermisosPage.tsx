import { useEffect, useMemo, useState } from 'react'
import { Loader2, Save, ShieldCheck } from 'lucide-react'

import { Toast } from '@/components/Modal'
import { controlAccesoApi, MatrizPermisosRol, RolApi } from './services/control-acceso.api'


export default function RolesPermisosPage() {
  const [roles, setRoles] = useState<RolApi[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [matrix, setMatrix] = useState<MatrizPermisosRol | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await controlAccesoApi.listarRoles()
        const activeRoles = response.data.filter((role) => role.estado === 'ACTIVO')
        setRoles(activeRoles)
        if (activeRoles[0]) setSelectedRole(String(activeRoles[0].idRol))
      } catch (error) {
        setToast({ message: error instanceof Error ? error.message : 'No se pudieron cargar los roles.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    void loadRoles()
  }, [])

  useEffect(() => {
    if (!selectedRole) {
      setMatrix(null)
      return
    }

    const loadMatrix = async () => {
      setLoading(true)
      try {
        setMatrix(await controlAccesoApi.obtenerMatriz(Number(selectedRole)))
      } catch (error) {
        setToast({ message: error instanceof Error ? error.message : 'No se pudo cargar la matriz.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    void loadMatrix()
  }, [selectedRole])

  const totalEnabled = useMemo(
    () => matrix?.modulos.reduce((total, module) => total + module.permisos.filter((permission) => permission.permitido).length, 0) ?? 0,
    [matrix],
  )

  const togglePermission = (idPermiso: number) => {
    setMatrix((current) => {
      if (!current) return current
      return {
        ...current,
        modulos: current.modulos.map((module) => ({
          ...module,
          permisos: module.permisos.map((permission) =>
            permission.idPermiso === idPermiso
              ? { ...permission, permitido: !permission.permitido }
              : permission,
          ),
        })),
      }
    })
  }

  const save = async () => {
    if (!matrix) return
    setSaving(true)
    try {
      const permissions = matrix.modulos.flatMap((module) =>
        module.permisos.map((permission) => ({
          idPermiso: permission.idPermiso,
          permitido: permission.permitido,
        })),
      )
      setMatrix(await controlAccesoApi.guardarMatriz(matrix.rol.idRol, permissions))
      setToast({ message: 'Permisos actualizados correctamente.', type: 'success' })
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'No se pudieron guardar los permisos.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: 'var(--gold)' }} />
            <h1 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Permisos por rol</h1>
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Selecciona las acciones disponibles para cada módulo del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="rounded px-3 py-2.5 text-xs outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((role) => <option key={role.idRol} value={role.idRol}>{role.nombreRol}</option>)}
          </select>

          <button
            onClick={() => void save()}
            disabled={!matrix || saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold disabled:opacity-50"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar permisos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Rol seleccionado', value: matrix?.rol.nombreRol ?? '—', color: 'var(--gold)' },
          { label: 'Módulos', value: matrix?.modulos.length ?? 0, color: '#60a5fa' },
          { label: 'Permisos habilitados', value: totalEnabled, color: '#4ade80' },
        ].map((card) => (
          <div key={card.label} className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-mono-data text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[10px] tracking-wide mt-1" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cargando permisos...</span>
          </div>
        ) : matrix ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[720px]">
              <thead>
                <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-5 py-3 font-medium tracking-widest uppercase" style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>Módulo</th>
                  {matrix.acciones.map((action) => (
                    <th key={action.idAccion} className="text-center px-5 py-3 font-medium tracking-widest uppercase" style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>
                      {action.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.modulos.map((module) => (
                  <tr key={module.idModulo} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-4">
                      <p style={{ color: 'var(--foreground)' }}>{module.nombre}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{module.descripcion || module.codigo}</p>
                    </td>
                    {matrix.acciones.map((action) => {
                      const permission = module.permisos.find((item) => item.idAccion === action.idAccion)
                      return (
                        <td key={action.idAccion} className="px-5 py-4 text-center">
                          {permission ? (
                            <input
                              type="checkbox"
                              checked={permission.permitido}
                              onChange={() => togglePermission(permission.idPermiso)}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          ) : (
                            <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>Selecciona un rol.</div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
