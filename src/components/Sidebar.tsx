import {
  LayoutDashboard, Cpu, Hash, Users2, Star, Wrench, HeadphonesIcon,
  UserCheck, FileText, Receipt, ConciergeBell, Globe, Smartphone,
  Settings, ChevronDown, LogOut, Users, ShieldCheck, Building2,
  Landmark, BookOpen, FileSearch, Package, Cog, ClipboardList,
  BarChart3, UserPlus, TrendingUp, ContactRound, Mail, FileSpreadsheet,
  Monitor, Monitor as MonitorIcon, FolderOpen, Scissors, Wrench as WrenchIcon,
  AlertTriangle, ListChecks, LayoutGrid, FilePlus, FileCheck, MessageSquare,
  Calendar, DollarSign, History, PanelLeft, Upload, Inbox, Code2,
  ClockIcon, Boxes,
} from 'lucide-react'
import { useState, useRef } from 'react'
import logoImg from '@/imports/logo.png'

export type ModuleKey =
  | 'dashboard'
  // Activos
  | 'activos' | 'inventario' | 'maquinas'
  // Contadores
  | 'contadores' | 'cargar_f18' | 'listado_f18'
  // Ocupación
  | 'ocupacion' | 'panel_ocupacion' | 'registro_tomas'
  // Fidelización
  | 'fidelizacion' | 'analitica_fidelizacion' | 'directorio_clientes'
  | 'campanas_email' | 'importar_excel_fid' | 'modo_kiosco'
  // Taller
  | 'taller' | 'taller_inventario' | 'nuevo_repuesto' | 'reportar_falla' | 'ver_solicitudes'
  // Soporte
  | 'soporte' | 'soporte_dashboard' | 'ver_casos' | 'crear_caso' | 'base_conocimientos'
  // RR.HH.
  | 'rrhh' | 'asistencia' | 'nomina_bonos' | 'turnos'
  // DIAN
  | 'dian' | 'monitor_operativo' | 'resumen_dian' | 'nueva_factura'
  | 'nuevo_doc_soporte' | 'resoluciones_dian'
  // Pagos
  | 'facturacion' | 'gestion_pagos' | 'historial_lotes'
  // Recepción
  | 'recepcion' | 'panel_control' | 'cargar_xml' | 'buzon_email'
  | 'portal_dian' | 'reglas_puc'
  // Simple
  | 'pages' | 'movil'
  // Configuración
  | 'configuracion' | 'usuarios' | 'roles' | 'razones_sociales' | 'casinos'

interface SubItem { key: ModuleKey; label: string; icon: React.ReactNode }
interface NavItem {
  key: ModuleKey
  label: string
  icon: React.ReactNode
  badge?: string
  children?: SubItem[]
}

const S = (icon: React.ReactNode) => <span className="flex-shrink-0 opacity-70">{icon}</span>

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  {
    key: 'activos', label: 'Activos', icon: <Boxes size={16} />,
    children: [
      { key: 'inventario', label: 'Inventario', icon: S(<Package size={14} />) },
      { key: 'maquinas', label: 'Máquinas', icon: S(<Cog size={14} />) },
    ],
  },
  {
    key: 'contadores', label: 'Contadores', icon: <Hash size={16} />,
    children: [
      { key: 'cargar_f18', label: 'Cargar F.18', icon: S(<Upload size={14} />) },
      { key: 'listado_f18', label: 'Listado F.18', icon: S(<ClipboardList size={14} />) },
    ],
  },
  {
    key: 'ocupacion', label: 'Ocupación', icon: <Users2 size={16} />,
    children: [
      { key: 'registro_tomas', label: 'Registrar Toma', icon: S(<UserPlus size={14} />) },
      { key: 'panel_ocupacion', label: 'Panel Análisis', icon: S(<BarChart3 size={14} />) },
    ],
  },
  {
    key: 'fidelizacion', label: 'Fidelización', icon: <Star size={16} />,
    children: [
      { key: 'analitica_fidelizacion', label: 'Analítica Fidelización', icon: S(<TrendingUp size={14} />) },
      { key: 'directorio_clientes', label: 'Directorio Clientes', icon: S(<ContactRound size={14} />) },
      { key: 'campanas_email', label: 'Campañas Email', icon: S(<Mail size={14} />) },
      { key: 'importar_excel_fid', label: 'Importar Excel', icon: S(<FileSpreadsheet size={14} />) },
      { key: 'modo_kiosco', label: 'Modo Kiosco', icon: S(<MonitorIcon size={14} />) },
    ],
  },
  {
    key: 'taller', label: 'Taller (Técnico)', icon: <Wrench size={16} />,
    children: [
      { key: 'taller_inventario', label: 'Inventario', icon: S(<FolderOpen size={14} />) },
      { key: 'nuevo_repuesto', label: 'Nuevo Repuesto', icon: S(<FilePlus size={14} />) },
      { key: 'reportar_falla', label: 'Reportar Falla', icon: S(<AlertTriangle size={14} />) },
      { key: 'ver_solicitudes', label: 'Ver Solicitudes', icon: S(<ListChecks size={14} />) },
    ],
  },
  {
    key: 'soporte', label: 'Soporte', icon: <HeadphonesIcon size={16} />,
    children: [
      { key: 'soporte_dashboard', label: 'Dashboard', icon: S(<LayoutGrid size={14} />) },
      { key: 'ver_casos', label: 'Ver Casos', icon: S(<FolderOpen size={14} />) },
      { key: 'crear_caso', label: 'Crear Caso', icon: S(<FilePlus size={14} />) },
      { key: 'base_conocimientos', label: 'Base Conocimientos', icon: S(<BookOpen size={14} />) },
    ],
  },
  {
    key: 'rrhh', label: 'RR.HH.', icon: <UserCheck size={16} />,
    children: [
      { key: 'asistencia', label: 'Asistencia', icon: S(<Calendar size={14} />) },
      { key: 'nomina_bonos', label: 'Nómina / Bonos', icon: S(<DollarSign size={14} />) },
      { key: 'turnos', label: 'Turnos', icon: S(<ClockIcon size={14} />) },
    ],
  },
  {
    key: 'dian', label: 'DIAN', icon: <Code2 size={16} />,
    children: [
      { key: 'monitor_operativo', label: 'Monitor Operativo', icon: S(<MonitorIcon size={14} />) },
      { key: 'resumen_dian', label: 'Resumen', icon: S(<FileCheck size={14} />) },
      { key: 'nueva_factura', label: 'Nueva Factura', icon: S(<FilePlus size={14} />) },
      { key: 'nuevo_doc_soporte', label: 'Nuevo Doc. Soporte', icon: S(<FilePlus size={14} />) },
      { key: 'resoluciones_dian', label: 'Resoluciones DIAN', icon: S(<FileText size={14} />) },
    ],
  },
  {
    key: 'facturacion', label: 'Pagos', icon: <Receipt size={16} />,
    children: [
      { key: 'gestion_pagos', label: 'Gestión de Pagos', icon: S(<DollarSign size={14} />) },
      { key: 'historial_lotes', label: 'Historial de Lotes', icon: S(<History size={14} />) },
    ],
  },
  {
    key: 'recepcion', label: 'Recepción', icon: <ConciergeBell size={16} />, badge: 'new',
    children: [
      { key: 'panel_control', label: 'Panel Control', icon: S(<PanelLeft size={14} />) },
      { key: 'cargar_xml', label: 'Cargar XML', icon: S(<Upload size={14} />) },
      { key: 'reglas_puc', label: 'Reglas PUC', icon: S(<BookOpen size={14} />) },
      { key: 'buzon_email', label: 'Buzón Email', icon: S(<Inbox size={14} />) },
      { key: 'portal_dian', label: 'Portal DIAN', icon: S(<FileSearch size={14} />) },
    ],
  },
  { key: 'pages', label: 'Pages', icon: <Globe size={16} /> },
  { key: 'movil', label: 'Móvil', icon: <Smartphone size={16} /> },
  {
    key: 'configuracion', label: 'Configuración', icon: <Settings size={16} />,
    children: [
      { key: 'usuarios', label: 'Usuarios', icon: S(<Users size={14} />) },
      { key: 'roles', label: 'Roles', icon: S(<ShieldCheck size={14} />) },
      { key: 'razones_sociales', label: 'Razones Sociales', icon: S(<Building2 size={14} />) },
      { key: 'casinos', label: 'Casinos', icon: S(<Landmark size={14} />) },
    ],
  },
]

// Reverse-lookup: which parent owns each child key
const CHILD_TO_PARENT = new Map<ModuleKey, ModuleKey>()
for (const item of navItems) {
  if (item.children) {
    for (const child of item.children) {
      CHILD_TO_PARENT.set(child.key, item.key)
    }
  }
}

interface SidebarProps {
  active: ModuleKey
  onSelect: (key: ModuleKey) => void
  onLogout: () => void
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ active, onSelect, onLogout, collapsed, onToggle }: SidebarProps) {
  // LRU queue: max 2 open dropdowns
  const parentOfActive = CHILD_TO_PARENT.get(active)
  const [openQueue, setOpenQueue] = useState<ModuleKey[]>(() =>
    parentOfActive ? [parentOfActive] : []
  )

  const openSet = new Set(openQueue)

  const toggleGroup = (key: ModuleKey) => {
    if (openSet.has(key)) {
      // Close it
      setOpenQueue((q) => q.filter((k) => k !== key))
    } else {
      // Open it, enforce max 2
      setOpenQueue((q) => {
        const next = q.filter((k) => k !== key)
        if (next.length >= 2) next.shift() // remove oldest
        return [...next, key]
      })
    }
  }

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '220px',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={onToggle} className="flex-shrink-0 focus:outline-none" title={collapsed ? 'Expandir' : 'Colapsar'}>
          <img src={logoImg} alt="Innova Club"
            className="w-8 h-8 object-contain rounded-full"
            style={{ border: '1px solid var(--gold-dim)' }} />
        </button>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-display text-xs font-semibold tracking-widest leading-tight" style={{ color: 'var(--gold)' }}>INNOVA</p>
            <p className="font-display text-[10px] tracking-widest leading-tight" style={{ color: 'var(--muted-foreground)' }}>GES-INNOVA</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const hasChildren = !!item.children?.length
          const isOpen = openSet.has(item.key)
          const isActive = active === item.key
          const isChildActive = hasChildren && item.children!.some((c) => c.key === active)
          const highlighted = isActive || isChildActive

          return (
            <div key={item.key}>
              {/* Parent button */}
              <button
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-controls={hasChildren ? `submenu-${item.key}` : undefined}
                onClick={() => {
                  if (hasChildren) {
                    toggleGroup(item.key)
                    if (collapsed) onToggle()
                  } else {
                    onSelect(item.key)
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all duration-150 group"
                style={{
                  background: highlighted ? 'rgba(200,168,75,0.12)' : 'transparent',
                  color: highlighted ? 'var(--gold)' : 'var(--muted-foreground)',
                  borderLeft: highlighted ? '2px solid var(--gold)' : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (!highlighted) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={(e) => { if (!highlighted) e.currentTarget.style.background = 'transparent' }}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-xs font-medium tracking-wide truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold tracking-wider flex-shrink-0"
                        style={{ background: 'var(--gold-dim)', color: 'var(--foreground)' }}>
                        {item.badge.toUpperCase()}
                      </span>
                    )}
                    {hasChildren && (
                      <ChevronDown size={12} className="flex-shrink-0 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', color: 'var(--muted-foreground)' }} />
                    )}
                  </>
                )}
              </button>

              {/* Children — animated */}
              {!collapsed && hasChildren && (
                <div
                  id={`submenu-${item.key}`}
                  style={{
                    maxHeight: isOpen ? `${item.children!.length * 36 + 4}px` : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 200ms ease-in-out',
                  }}
                >
                  <div className="mt-0.5 space-y-0.5 pb-1">
                    {item.children!.map((child) => {
                      const childActive = active === child.key
                      return (
                        <button
                          key={child.key}
                          onClick={() => onSelect(child.key)}
                          className="w-full flex items-center gap-2.5 pl-9 pr-3 py-2 rounded text-left transition-all duration-150"
                          style={{
                            background: childActive ? 'rgba(200,168,75,0.1)' : 'transparent',
                            color: childActive ? 'var(--gold)' : 'var(--muted-foreground)',
                            borderLeft: childActive ? '2px solid var(--gold-dim)' : '2px solid transparent',
                          }}
                          onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                          onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.background = 'transparent' }}
                        >
                          {child.icon}
                          <span className="text-xs tracking-wide truncate">{child.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all"
          style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-xs font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
