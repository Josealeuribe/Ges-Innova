import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full ${widths[size]} rounded-lg shadow-2xl`}
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h3 className="font-display text-sm font-semibold tracking-wider" style={{ color: 'var(--gold)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'var(--muted)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* Shared form field helper */
export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-medium tracking-widest uppercase mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
        {label}{required && <span style={{ color: 'var(--gold)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded text-xs outline-none transition-all"
      style={{
        background: 'var(--muted)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
        ...(props.style || {}),
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; props.onFocus?.(e) }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; props.onBlur?.(e) }}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 rounded text-xs outline-none transition-all"
      style={{
        background: 'var(--muted)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
        ...(props.style || {}),
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; props.onFocus?.(e) }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; props.onBlur?.(e) }}
    />
  )
}

export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-xs font-medium"
      style={{
        background: type === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
        border: `1px solid ${type === 'success' ? '#4ade80' : '#f87171'}`,
        color: type === 'success' ? '#4ade80' : '#f87171',
      }}
    >
      {message}
      <button onClick={onClose} style={{ opacity: 0.6 }}><X size={13} /></button>
    </div>
  )
}
