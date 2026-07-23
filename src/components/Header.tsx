import { Bell, ChevronDown, CalendarDays, Building2, Check } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Tablero de Analítica',
  activos: 'Activos', inventario: 'Inventario de Activos', maquinas: 'Máquinas',
  contadores: 'Contadores', cargar_f18: 'Cargar F.18', listado_f18: 'Listado F.18',
  ocupacion: 'Ocupación', panel_ocupacion: 'Panel de Análisis — Ocupación', registro_tomas: 'Registro de Tomas',
  fidelizacion: 'Fidelización', analitica_fidelizacion: 'Analítica Fidelización',
  directorio_clientes: 'Directorio de Clientes', campanas_email: 'Campañas Email',
  importar_excel_fid: 'Importar Excel', modo_kiosco: 'Modo Kiosco',
  taller: 'Taller Técnico', taller_inventario: 'Inventario Taller',
  nuevo_repuesto: 'Nuevo Repuesto', reportar_falla: 'Reportar Falla', ver_solicitudes: 'Ver Solicitudes',
  soporte: 'Soporte', soporte_dashboard: 'Dashboard Soporte',
  ver_casos: 'Ver Casos', crear_caso: 'Crear Caso', base_conocimientos: 'Base de Conocimientos',
  rrhh: 'Recursos Humanos', asistencia: 'Asistencia', nomina_bonos: 'Nómina / Bonos', turnos: 'Turnos',
  dian: 'DIAN', monitor_operativo: 'Monitor Operativo', resumen_dian: 'Resumen DIAN',
  nueva_factura: 'Nueva Factura', nuevo_doc_soporte: 'Nuevo Doc. Soporte', resoluciones_dian: 'Resoluciones DIAN',
  facturacion: 'Pagos', gestion_pagos: 'Gestión de Pagos', historial_lotes: 'Historial de Lotes',
  recepcion: 'Recepción', panel_control: 'Panel Control', cargar_xml: 'Cargar XML',
  buzon_email: 'Buzón Email', portal_dian: 'Portal DIAN', reglas_puc: 'Reglas PUC',
  pages: 'Páginas', movil: 'Aplicación Móvil',
  configuracion: 'Configuración', usuarios: 'Usuarios', roles: 'Roles',
  razones_sociales: 'Razones Sociales', casinos: 'Casinos',
}

interface HeaderProps {
  activeModule: string
  user: { name: string; role: string }
}

export default function Header({ activeModule, user }: HeaderProps) {
  const { razonSocialActiva, setRazonSocialActiva, razonesSociales } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showRazones, setShowRazones] = useState(false)

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const notifications = [
    { id: 1, text: 'Máquina #045 reportó error de sensor', time: 'hace 5 min', type: 'alert' },
    { id: 2, text: 'Reporte DIAN pendiente de envío', time: 'hace 1 h', type: 'warn' },
    { id: 3, text: 'Nuevo técnico asignado a taller', time: 'hace 3 h', type: 'info' },
  ]

  const activasOnly = razonesSociales.filter((r) => r.estado === 'Activa')

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', height: '64px' }}
    >
      {/* Title */}
      <div>
        <h1 className="font-display text-base font-semibold tracking-wider" style={{ color: 'var(--foreground)' }}>
          {MODULE_LABELS[activeModule] || activeModule}
        </h1>
        <p className="text-xs flex items-center gap-1.5 mt-0.5 capitalize" style={{ color: 'var(--muted-foreground)' }}>
          <CalendarDays size={11} />
          {today}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Razón Social Selector */}
        <div className="relative">
          <button
            onClick={() => { setShowRazones(!showRazones); setShowNotifs(false) }}
            className="flex items-center gap-2 pl-3 pr-2 py-2 rounded transition-all"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-dim)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Building2 size={13} style={{ color: 'var(--gold)' }} />
            <div className="text-left hidden sm:block">
              <p className="text-[10px] leading-tight" style={{ color: 'var(--muted-foreground)' }}>Razón Social</p>
              <p className="text-xs font-medium leading-tight max-w-[140px] truncate" style={{ color: 'var(--foreground)' }}>
                {razonSocialActiva.nombre}
              </p>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {showRazones && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded shadow-2xl z-50"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
            >
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                  Seleccionar Razón Social
                </p>
              </div>
              {activasOnly.length === 0 ? (
                <p className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  No hay razones sociales registradas.
                </p>
              ) : (
                activasOnly.map((rs) => (
                  <button
                    key={rs.id}
                    onClick={() => { setRazonSocialActiva(rs); setShowRazones(false) }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{rs.nombre}</p>
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{rs.id}</p>
                    </div>
                    {razonSocialActiva.id === rs.id && <Check size={13} style={{ color: 'var(--gold)' }} />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowRazones(false) }}
            className="relative p-2 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded shadow-2xl z-50"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold tracking-wider" style={{ color: 'var(--gold)' }}>NOTIFICACIONES</p>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex gap-3 items-start cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: n.type === 'alert' ? '#f87171' : n.type === 'warn' ? 'var(--gold)' : '#60a5fa' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--foreground)' }}>{n.text}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div
          className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded cursor-pointer transition-colors"
          style={{ border: '1px solid var(--border)' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-dim)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display flex-shrink-0"
            style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>
            {user.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-tight" style={{ color: 'var(--foreground)' }}>{user.name}</p>
            <p className="text-[10px] leading-tight" style={{ color: 'var(--gold-dim)' }}>{user.role}</p>
          </div>
          <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
        </div>
      </div>
    </header>
  )
}
