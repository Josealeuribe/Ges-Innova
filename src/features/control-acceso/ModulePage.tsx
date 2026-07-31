import { useEffect, useMemo, useState } from 'react'
import { Edit2, Loader2, Plus, Search, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'

import Modal, { Field, Input, Toast } from '@/components/Modal'
import { controlAccesoApi, ModuloApi } from './services/control-acceso.api'


type FormState = {
  codigo: string
  nombre: string
  descripcion: string
  ruta: string
  icono: string
  orden: string
  visibleMenu: boolean
  idModuloPadre: string
  estado: 'ACTIVO' | 'INACTIVO'
}

const EMPTY: FormState = { codigo: '', nombre: '', descripcion: '', ruta: '', icono: '', orden: '0', visibleMenu: true, idModuloPadre: '', estado: 'ACTIVO' }

export default function ModulosPage() {
  const [items, setItems] = useState<ModuloApi[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = async () => {
    setLoading(true)
    try { setItems((await controlAccesoApi.listarModulos()).data) }
    catch (error) { setToast({ message: error instanceof Error ? error.message : 'No se pudieron cargar los módulos.', type: 'error' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return !q ? items : items.filter((item) => [item.codigo, item.nombre, item.descripcion ?? '', item.ruta ?? ''].some((value) => value.toLowerCase().includes(q)))
  }, [items, search])

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (item: ModuloApi) => {
    setEditingId(item.idModulo)
    setForm({ codigo: item.codigo, nombre: item.nombre, descripcion: item.descripcion ?? '', ruta: item.ruta ?? '', icono: item.icono ?? '', orden: String(item.orden), visibleMenu: item.visibleMenu, idModuloPadre: item.idModuloPadre ? String(item.idModuloPadre) : '', estado: item.estado })
    setModalOpen(true)
  }

  const submit = async () => {
    if (!form.codigo.trim() || !form.nombre.trim()) { setToast({ message: 'Código y nombre son obligatorios.', type: 'error' }); return }
    setSaving(true)
    try {
      const payload = { codigo: form.codigo, nombre: form.nombre, descripcion: form.descripcion || null, ruta: form.ruta || null, icono: form.icono || null, orden: Number(form.orden), visibleMenu: form.visibleMenu, idModuloPadre: form.idModuloPadre ? Number(form.idModuloPadre) : null, estado: form.estado }
      const saved = editingId === null ? await controlAccesoApi.crearModulo(payload) : await controlAccesoApi.actualizarModulo(editingId, payload)
      setItems((current) => editingId === null ? [...current, saved] : current.map((item) => item.idModulo === editingId ? saved : item))
      setModalOpen(false)
      setToast({ message: editingId === null ? 'Módulo creado.' : 'Módulo actualizado.', type: 'success' })
    } catch (error) { setToast({ message: error instanceof Error ? error.message : 'No se pudo guardar.', type: 'error' }) }
    finally { setSaving(false) }
  }

  const toggle = async (item: ModuloApi) => {
    try {
      const updated = await controlAccesoApi.actualizarModulo(item.idModulo, { estado: item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' })
      setItems((current) => current.map((value) => value.idModulo === item.idModulo ? updated : value))
    } catch (error) { setToast({ message: error instanceof Error ? error.message : 'No se pudo cambiar el estado.', type: 'error' }) }
  }

  const remove = async (item: ModuloApi) => {
    if (!window.confirm(`¿Inactivar ${item.nombre}?`)) return
    try {
      const updated = await controlAccesoApi.inactivarModulo(item.idModulo)
      setItems((current) => current.map((value) => value.idModulo === item.idModulo ? updated : value))
    } catch (error) { setToast({ message: error instanceof Error ? error.message : 'No se pudo inactivar.', type: 'error' }) }
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded flex-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar módulos..." className="bg-transparent outline-none text-xs w-full" style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold" style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}><Plus size={13} /> Nuevo módulo</button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin" /></div> : (
          <table className="w-full text-xs">
            <thead><tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>{['Módulo', 'Ruta', 'Orden', 'Permisos', 'Estado', 'Acciones'].map((h) => <th key={h} className="text-left px-5 py-3 uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', fontSize: 9 }}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((item) => <tr key={item.idModulo} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td className="px-5 py-4"><p>{item.nombre}</p><p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{item.codigo}</p></td>
              <td className="px-5 py-4" style={{ color: 'var(--muted-foreground)' }}>{item.ruta || '—'}</td>
              <td className="px-5 py-4">{item.orden}</td>
              <td className="px-5 py-4">{item.totalPermisos}</td>
              <td className="px-5 py-4" style={{ color: item.estado === 'ACTIVO' ? '#4ade80' : '#f87171' }}>{item.estado}</td>
              <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openEdit(item)}><Edit2 size={13} /></button><button onClick={() => void toggle(item)}>{item.estado === 'ACTIVO' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}</button><button onClick={() => void remove(item)}><Trash2 size={13} /></button></div></td>
            </tr>)}</tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId === null ? 'Nuevo módulo' : 'Editar módulo'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
          {[
            ['codigo', 'Código', 'FACTURACION'], ['nombre', 'Nombre', 'Facturación'], ['descripcion', 'Descripción', 'Descripción del módulo'], ['ruta', 'Ruta', '/facturacion'], ['icono', 'Icono', 'receipt'], ['orden', 'Orden', '1'], ['idModuloPadre', 'ID módulo padre', ''],
          ].map(([field, label, placeholder]) => <Field key={field} label={label} required={field === 'codigo' || field === 'nombre'}><Input type={field === 'orden' || field === 'idModuloPadre' ? 'number' : 'text'} value={String(form[field as keyof FormState])} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={placeholder} /></Field>)}
          <Field label="Visible en menú"><input type="checkbox" checked={form.visibleMenu} onChange={(event) => setForm((current) => ({ ...current, visibleMenu: event.target.checked }))} /></Field>
          <Field label="Estado"><select value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as 'ACTIVO' | 'INACTIVO' }))} className="w-full rounded px-3 py-2.5 text-xs" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">INACTIVO</option></select></Field>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded text-xs">Cancelar</button><button onClick={() => void submit()} disabled={saving} className="px-5 py-2.5 rounded text-xs font-semibold" style={{ background: 'var(--gold)', color: 'var(--primary-foreground)' }}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
