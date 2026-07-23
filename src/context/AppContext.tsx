import { createContext, useContext, useState, type ReactNode } from 'react'

export interface RazonSocial {
  id: string
  nombre: string
  direccion: string
  correo: string
  telefono: string
  estado: 'Activa' | 'Inactiva'
}

const INITIAL_RAZONES: RazonSocial[] = [
  { id: 'RS-001', nombre: 'Innova Club S.A.S', direccion: 'Cra 15 #45-32, Bogotá', correo: 'admin@innovaclub.co', telefono: '601-3214567', estado: 'Activa' },
  { id: 'RS-002', nombre: 'Casino Norte Ltda.', direccion: 'Av. 68 #12-10, Bogotá', correo: 'norte@innovaclub.co', telefono: '601-9876543', estado: 'Activa' },
  { id: 'RS-003', nombre: 'Operadora Sur S.A.', direccion: 'Cll 80 #22-45, Medellín', correo: 'sur@operadora.co', telefono: '604-5554321', estado: 'Inactiva' },
]

interface AppContextValue {
  razonSocialActiva: RazonSocial
  setRazonSocialActiva: (rs: RazonSocial) => void
  razonesSociales: RazonSocial[]
  setRazonesSociales: (list: RazonSocial[]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>(INITIAL_RAZONES)
  const [razonSocialActiva, setRazonSocialActiva] = useState<RazonSocial>(INITIAL_RAZONES[0])

  return (
    <AppContext.Provider value={{ razonSocialActiva, setRazonSocialActiva, razonesSociales, setRazonesSociales }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
