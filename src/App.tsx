import {
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import LoginPage from './features/auth/LoginPage';

import ProtectedRoute from './features/auth/components/ProtectedRoute';

import {
  useAuth,
} from './features/auth/context/AuthContext';

import Sidebar, {
  type ModuleKey,
} from './components/Sidebar';

import Header from './components/Header';
import StubPage from './components/StubPage';

import DashboardPage from './features/dashboard/DashboardPage';

import InventarioPage from './features/assets/InventarioPage';
import MaquinasPage from './features/assets/MaquinasPage';

import F18Page from './features/counters/F18Page';

import PanelOcupacionPage from './features/occupancy/PanelOcupacionPage';
import RegistroTomasPage from './features/occupancy/RegistroTomasPage';

import EmployeesPage from './features/employees/EmployeesPage';

import BillingPage from './features/billing/BillingPage';

import UsersPage from './features/config/UsersPage';
import RolesPage from './features/config/RolesPage';
import RazonesSocialesPage from './features/config/RazonesSocialesPage';
import CasinosPage from './features/config/CasinosPage';

import PortalDIANPage from './features/reception/PortalDIANPage';
import ReglasPUCPage from './features/reception/ReglasPUCPage';
import CargarXmlPage from './features/reception/CargarXmlPage';
import PanelControlPage from './features/reception/PanelControlPage';

import ResumenDianPage from './features/dian/ResumenDianPage';
import NuevaFacturaPage from './features/dian/NuevaFacturaPage';
import ResolucionesDianPage from './features/dian/ResolucionesDianPage';

import {
  AppProvider,
} from './context/AppContext';

interface HeaderUser {
  name: string;
  role: string;
}

interface AdminAppProps {
  user: HeaderUser;
  onLogout: () => void;
}

interface StubConfig {
  title: string;
  description?: string;
}

const ACTIVE_MODULE_STORAGE_KEY =
  'ges-innova.active-module';

const SIDEBAR_COLLAPSED_STORAGE_KEY =
  'ges-innova.sidebar-collapsed';

const STUBS: Partial<
  Record<ModuleKey, StubConfig>
> = {
  activos: {
    title: 'Activos',
    description:
      'Selecciona Inventario o Máquinas desde el menú.',
  },

  contadores: {
    title: 'Contadores',
    description:
      'Selecciona Cargar F.18 o Listado F.18 desde el menú.',
  },

  ocupacion: {
    title: 'Ocupación',
    description:
      'Selecciona Panel Análisis o Registrar Toma desde el menú.',
  },

  fidelizacion: {
    title: 'Fidelización',
  },

  analitica_fidelizacion: {
    title: 'Analítica Fidelización',
  },

  directorio_clientes: {
    title: 'Directorio de Clientes',
  },

  campanas_email: {
    title: 'Campañas Email',
  },

  importar_excel_fid: {
    title: 'Importar Excel',
  },

  modo_kiosco: {
    title: 'Modo Kiosco',
  },

  taller: {
    title: 'Taller Técnico',
  },

  taller_inventario: {
    title: 'Inventario Taller',
  },

  nuevo_repuesto: {
    title: 'Nuevo Repuesto',
  },

  reportar_falla: {
    title: 'Reportar Falla',
  },

  ver_solicitudes: {
    title: 'Ver Solicitudes',
  },

  soporte: {
    title: 'Soporte',
  },

  soporte_dashboard: {
    title: 'Dashboard Soporte',
  },

  ver_casos: {
    title: 'Ver Casos',
  },

  crear_caso: {
    title: 'Crear Caso',
  },

  base_conocimientos: {
    title: 'Base de Conocimientos',
  },

  asistencia: {
    title: 'Asistencia',
  },

  nomina_bonos: {
    title: 'Nómina / Bonos',
  },

  turnos: {
    title: 'Turnos',
  },

  dian: {
    title: 'DIAN',
  },

  monitor_operativo: {
    title: 'Monitor Operativo',
  },

  nuevo_doc_soporte: {
    title: 'Nuevo Doc. Soporte',
  },

  gestion_pagos: {
    title: 'Gestión de Pagos',
  },

  historial_lotes: {
    title: 'Historial de Lotes',
  },

  recepcion: {
    title: 'Recepción',
  },

  buzon_email: {
    title: 'Buzón Email',
  },

  pages: {
    title: 'Páginas Web',
  },

  movil: {
    title: 'Aplicación Móvil',
  },

  configuracion: {
    title: 'Configuración',
  },
};

function getStoredActiveModule(): ModuleKey {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const storedModule =
    window.localStorage.getItem(
      ACTIVE_MODULE_STORAGE_KEY,
    );

  return (
    storedModule as ModuleKey | null
  ) ?? 'dashboard';
}

function getStoredSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
    ) === 'true'
  );
}

function AdminApp({
  user,
  onLogout,
}: AdminAppProps) {
  const [
    activeModule,
    setActiveModule,
  ] = useState<ModuleKey>(
    getStoredActiveModule,
  );

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(
    getStoredSidebarCollapsed,
  );

  useEffect(() => {
    window.localStorage.setItem(
      ACTIVE_MODULE_STORAGE_KEY,
      activeModule,
    );
  }, [activeModule]);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  function handleModuleSelect(
    module: ModuleKey,
  ): void {
    setActiveModule(module);
  }

  function handleSidebarToggle(): void {
    setSidebarCollapsed(
      (current) => !current,
    );
  }

  function renderPage() {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage />;

      case 'inventario':
        return <InventarioPage />;

      case 'maquinas':
        return <MaquinasPage />;

      case 'cargar_f18':
      case 'listado_f18':
        return <F18Page />;

      case 'panel_ocupacion':
        return <PanelOcupacionPage />;

      case 'registro_tomas':
        return <RegistroTomasPage />;

      case 'rrhh':
        return <EmployeesPage />;

      case 'facturacion':
        return <BillingPage />;

      case 'usuarios':
        return <UsersPage />;

      case 'roles':
        return <RolesPage />;

      case 'razones_sociales':
        return <RazonesSocialesPage />;

      case 'casinos':
        return <CasinosPage />;

      case 'portal_dian':
        return <PortalDIANPage />;

      case 'reglas_puc':
        return <ReglasPUCPage />;

      case 'cargar_xml':
        return <CargarXmlPage />;

      case 'panel_control':
        return <PanelControlPage />;

      case 'resumen_dian':
        return <ResumenDianPage />;

      case 'nueva_factura':
        return <NuevaFacturaPage />;

      case 'resoluciones_dian':
        return <ResolucionesDianPage />;

      default: {
        const stub =
          STUBS[activeModule];

        return (
          <StubPage
            title={
              stub?.title ??
              activeModule
            }
            description={
              stub?.description
            }
          />
        );
      }
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background:
          'var(--background)',
      }}
    >
      <Sidebar
        active={activeModule}
        onSelect={handleModuleSelect}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          activeModule={activeModule}
          user={user}
        />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            background:
              'var(--background)',
          }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function LoginRoute() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
        style={{
          background:
            'var(--background)',

          color:
            'var(--foreground)',
        }}
      >
        Restaurando sesión...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <LoginPage />;
}

function AuthenticatedAdminApp() {
  const {
    usuario,
    logout,
  } = useAuth();

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const fullName = [
    usuario.nombre,
    usuario.apellido,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const headerUser: HeaderUser = {
    name:
      fullName ||
      usuario.correo,

    role:
      usuario.rol?.nombreRol ??
      'Usuario',
  };

  return (
    <AppProvider>
      <AdminApp
        user={headerUser}
        onLogout={logout}
      />
    </AppProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginRoute />}
      />

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          path="/*"
          element={
            <AuthenticatedAdminApp />
          }
        />
      </Route>
    </Routes>
  );
}