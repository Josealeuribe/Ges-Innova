import { useState } from "react";
import LoginPage from "./features/auth/LoginPage";
import Sidebar, { type ModuleKey } from "./components/Sidebar";
import Header from "./components/Header";
import DashboardPage from "./features/dashboard/DashboardPage";
import InventarioPage from "./features/assets/InventarioPage";
import MaquinasPage from "./features/assets/MaquinasPage";
import F18Page from "./features/counters/F18Page";
import PanelOcupacionPage from "./features/occupancy/PanelOcupacionPage";
import RegistroTomasPage from "./features/occupancy/RegistroTomasPage";
import EmployeesPage from "./features/employees/EmployeesPage";
import BillingPage from "./features/billing/BillingPage";
import UsersPage from "./features/config/UsersPage";
import RolesPage from "./features/config/RolesPage";
import RazonesSocialesPage from "./features/config/RazonesSocialesPage";
import CasinosPage from "./features/config/CasinosPage";
import PortalDIANPage from "./features/reception/PortalDIANPage";
import ReglasPUCPage from "./features/reception/ReglasPUCPage";
import StubPage from "./components/StubPage";
import { AppProvider } from "./context/AppContext";

interface User {
  name: string;
  role: string;
}

const STUBS: Partial<Record<ModuleKey, { title: string; description?: string }>> = {
  activos: { title: "Activos", description: "Selecciona Inventario o Máquinas desde el menú." },
  contadores: { title: "Contadores", description: "Selecciona Cargar F.18 o Listado F.18 desde el menú." },
  ocupacion: { title: "Ocupación", description: "Selecciona Panel Análisis o Registrar Toma desde el menú." },
  fidelizacion: { title: "Fidelización" }, analitica_fidelizacion: { title: "Analítica Fidelización" },
  directorio_clientes: { title: "Directorio de Clientes" }, campanas_email: { title: "Campañas Email" },
  importar_excel_fid: { title: "Importar Excel" }, modo_kiosco: { title: "Modo Kiosco" },
  taller: { title: "Taller Técnico" }, taller_inventario: { title: "Inventario Taller" },
  nuevo_repuesto: { title: "Nuevo Repuesto" }, reportar_falla: { title: "Reportar Falla" },
  ver_solicitudes: { title: "Ver Solicitudes" },
  soporte: { title: "Soporte" }, soporte_dashboard: { title: "Dashboard Soporte" },
  ver_casos: { title: "Ver Casos" }, crear_caso: { title: "Crear Caso" },
  base_conocimientos: { title: "Base de Conocimientos" },
  rrhh: { title: "Recursos Humanos" }, asistencia: { title: "Asistencia" },
  nomina_bonos: { title: "Nómina / Bonos" }, turnos: { title: "Turnos" },
  dian: { title: "DIAN" }, monitor_operativo: { title: "Monitor Operativo" },
  resumen_dian: { title: "Resumen DIAN" }, nueva_factura: { title: "Nueva Factura" },
  nuevo_doc_soporte: { title: "Nuevo Doc. Soporte" }, resoluciones_dian: { title: "Resoluciones DIAN" },
  facturacion: { title: "Pagos" }, gestion_pagos: { title: "Gestión de Pagos" },
  historial_lotes: { title: "Historial de Lotes" },
  recepcion: { title: "Recepción" }, panel_control: { title: "Panel Control" },
  cargar_xml: { title: "Cargar XML" }, buzon_email: { title: "Buzón Email" },
  pages: { title: "Páginas Web" }, movil: { title: "Aplicación Móvil" },
  configuracion: { title: "Configuración" },
};

function AdminApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activeModule) {
      case "dashboard": return <DashboardPage />;
      // Activos
      case "inventario": return <InventarioPage />;
      case "maquinas": return <MaquinasPage />;
      // Contadores
      case "cargar_f18":
      case "listado_f18": return <F18Page />;
      // Ocupación
      case "panel_ocupacion": return <PanelOcupacionPage />;
      case "registro_tomas": return <RegistroTomasPage />;
      // RR.HH. (existing)
      case "rrhh": return <EmployeesPage />;
      // Facturación
      case "facturacion": return <BillingPage />;
      // Configuración
      case "usuarios": return <UsersPage />;
      case "roles": return <RolesPage />;
      case "razones_sociales": return <RazonesSocialesPage />;
      case "casinos": return <CasinosPage />;
      // Recepción
      case "portal_dian": return <PortalDIANPage />;
      case "reglas_puc": return <ReglasPUCPage />;
      default: {
        const stub = STUBS[activeModule];
        return <StubPage title={stub?.title || activeModule} description={stub?.description} />;
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar
        active={activeModule}
        onSelect={setActiveModule}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header activeModule={activeModule} user={user} />
        <main className="flex-1 overflow-y-auto" style={{ background: "var(--background)" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  if (!user) return <LoginPage onLogin={setUser} />;
  return (
    <AppProvider>
      <AdminApp user={user} onLogout={() => setUser(null)} />
    </AppProvider>
  );
}
