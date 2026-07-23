import { useState } from 'react'
import logoImg from '@/imports/logo.png'

interface LoginPageProps {
  onLogin: (user: { name: string; role: string }) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({ name: 'Administrador', role: 'Super Admin' })
    }, 1200)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0e0e1a 0%, #07070f 100%)' }}
      >
        {/* Gold mesh overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(200,168,75,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glowing orb */}
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--gold)' }}
        />
        <div className="relative z-10 text-center px-12">
          <img src={logoImg} alt="Innova Club" className="w-44 h-44 mx-auto mb-10 object-contain" />
          <h1
            className="font-display text-5xl font-semibold mb-4 tracking-widest"
            style={{ color: 'var(--gold)' }}
          >
            INNOVA CLUB
          </h1>
          <p className="text-lg tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            Sistema de Gestión Administrativa
          </p>
          <div className="mt-10 flex items-center gap-4 justify-center">
            <div className="h-px w-16" style={{ background: 'var(--gold-dim)' }} />
            <span className="text-xs tracking-widest" style={{ color: 'var(--gold-dim)' }}>
              GES · INNOVA
            </span>
            <div className="h-px w-16" style={{ background: 'var(--gold-dim)' }} />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--card)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <img src={logoImg} alt="Innova Club" className="w-20 h-20 object-contain" />
          </div>

          <div className="mb-10">
            <h2
              className="font-display text-3xl font-semibold tracking-wider mb-2"
              style={{ color: 'var(--gold)' }}
            >
              Bienvenido
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Inicia sesión para acceder al panel administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium tracking-widest uppercase mb-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Usuario / Correo
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@innovaclub.co"
                className="w-full px-4 py-3 rounded text-sm outline-none transition-all"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium tracking-widest uppercase mb-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded text-sm outline-none transition-all"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded" style={{ background: '#2a0a0a', color: '#f87171' }}>
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs transition-colors"
                style={{ color: 'var(--gold-dim)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gold-dim)')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-display text-sm font-semibold tracking-widest uppercase transition-all mt-2"
              style={{
                background: loading ? 'var(--gold-dim)' : 'var(--gold)',
                color: 'var(--primary-foreground)',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs mt-10" style={{ color: 'var(--muted-foreground)' }}>
            GES-INNOVA © 2026 · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
