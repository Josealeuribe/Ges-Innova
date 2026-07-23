import { Construction } from 'lucide-react'

interface StubPageProps {
  title: string
  description?: string
}

export default function StubPage({ title, description }: StubPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid var(--gold-dim)' }}
        >
          <Construction size={28} style={{ color: 'var(--gold)' }} />
        </div>
        <h2 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          {title}
        </h2>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          {description || 'Este módulo está en desarrollo. Estará disponible próximamente.'}
        </p>
        <div className="flex items-center gap-3 justify-center mt-8">
          <div className="h-px w-12" style={{ background: 'var(--gold-dim)' }} />
          <span className="text-[10px] tracking-widest" style={{ color: 'var(--gold-dim)' }}>
            PRÓXIMAMENTE
          </span>
          <div className="h-px w-12" style={{ background: 'var(--gold-dim)' }} />
        </div>
      </div>
    </div>
  )
}
