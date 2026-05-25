import { useState } from 'react'
import { X, Trash2, Upload } from 'lucide-react'
import { updateKit, deleteKit } from '../store/kitStore'

const inputCls = 'w-full h-9 rounded px-3 text-sm bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.07] focus:outline-none'
const btnGray  = 'h-9 px-4 rounded text-sm bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07] hover:bg-black/[0.09] dark:hover:bg-white/[0.1] transition-colors'
const btnBlack = 'h-9 px-4 rounded text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-85 transition-opacity'

function Label({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">
      {children}
    </p>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/[0.05] dark:border-white/[0.04] last:border-0">
      <span className="text-[12px] text-black/60 dark:text-white/60">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-mono text-black/35 dark:text-white/35">{value}</span>
        <label className="relative w-7 h-7 overflow-hidden cursor-pointer border border-black/[0.08] dark:border-white/[0.07]" style={{ borderRadius: 4 }}>
          <div className="absolute inset-0" style={{ backgroundColor: value }} />
          <input
            type="color" value={value} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>
    </div>
  )
}

function FontRow({ label, font, onChange }) {
  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const name = file.name.replace(/\.[^.]+$/, '')
    const reader = new FileReader()
    reader.onload = ev => onChange({ name, dataUrl: ev.target.result })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-black/[0.05] dark:border-white/[0.04] last:border-0">
      <span className="text-[12px] text-black/50 dark:text-white/50 w-14 shrink-0">{label}</span>
      <span className="flex-1 text-[11px] text-black/40 dark:text-white/40 truncate">
        {font?.name || 'Sistema'}
      </span>
      <label className="text-[11px] border border-black/[0.08] dark:border-white/[0.07] px-2.5 py-1 cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors whitespace-nowrap" style={{ borderRadius: 3 }}>
        Cargar
        <input type="file" accept=".ttf,.otf" onChange={handleFile} className="hidden" />
      </label>
      {font?.name && (
        <button
          onClick={() => onChange({ name: '', dataUrl: null })}
          className="text-black/25 dark:text-white/25 hover:text-red-400 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

function KitPanel({ kit, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    name:   kit.name,
    colors: {
      primary2:   '#ffffff',
      secondary2: '#e0dbd2',
      accent2:    '#2A4858',
      ...kit.colors
    },
    fonts:  {
      title: { ...kit.fonts.title },
      body:  { ...kit.fonts.body },
      aux:   { ...kit.fonts.aux }
    },
    logo:   kit.logo,
    images: [...(kit.images || [])]
  })

  function setColor(key, val) { setForm(f => ({ ...f, colors: { ...f.colors, [key]: val } })) }
  function setFont(key, val)  { setForm(f => ({ ...f, fonts:  { ...f.fonts,  [key]: val } })) }

  function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  function handleImages(e) {
    const files = [...e.target.files]
    if (!files.length) return
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setForm(f => ({
        ...f,
        images: [...f.images, ev.target.result].slice(0, 10)
      }))
      reader.readAsDataURL(file)
    })
  }

  function save() {
    const updated = updateKit(kit.id, form)
    onUpdate(updated)
    onClose()
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar el kit "${kit.name}"?`)) return
    deleteKit(kit.id)
    onDelete(kit.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] border border-black/[0.08] dark:border-white/[0.07] w-full max-w-sm max-h-[88vh] overflow-y-auto shadow-2xl" style={{ borderRadius: 8 }}>

        {/* Header del modal */}
        <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between px-6 py-4 z-10" style={{ borderRadius: '8px 8px 0 0' }}>
          <p className="text-[13px] font-semibold">Editar kit</p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
            style={{ borderRadius: 4 }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Nombre */}
          <div className="space-y-2">
            <Label>Nombre</Label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={inputCls}
            />
          </div>

          {/* Colores */}
          <div className="space-y-2">
            <Label>Colores</Label>
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.04] px-4" style={{ borderRadius: 6 }}>
              <ColorRow label="Texto 1"    value={form.colors.primary}    onChange={v => setColor('primary',    v)} />
              <ColorRow label="Texto 2"    value={form.colors.primary2}   onChange={v => setColor('primary2',   v)} />
              <ColorRow label="Fondo 1"    value={form.colors.secondary}  onChange={v => setColor('secondary',  v)} />
              <ColorRow label="Fondo 2"    value={form.colors.secondary2} onChange={v => setColor('secondary2', v)} />
              <ColorRow label="Acento 1"   value={form.colors.accent}     onChange={v => setColor('accent',     v)} />
              <ColorRow label="Acento 2"   value={form.colors.accent2}    onChange={v => setColor('accent2',    v)} />
            </div>
          </div>

          {/* Tipografías */}
          <div className="space-y-2">
            <Label>Tipografías</Label>
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.04] px-4" style={{ borderRadius: 6 }}>
              <FontRow label="Título"   font={form.fonts.title} onChange={v => setFont('title', v)} />
              <FontRow label="Cuerpo"   font={form.fonts.body}  onChange={v => setFont('body',  v)} />
              <FontRow label="Auxiliar" font={form.fonts.aux}   onChange={v => setFont('aux',   v)} />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-black/[0.08] dark:border-white/[0.07] flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] shrink-0" style={{ borderRadius: 4 }}>
                {form.logo
                  ? <img src={form.logo} alt="" className="w-full h-full object-contain p-1.5" />
                  : <Upload className="w-3.5 h-3.5 text-black/25 dark:text-white/25" />
                }
              </div>
              <div className="flex gap-1.5">
                <label className={`${btnGray} flex items-center gap-1.5 cursor-pointer text-[12px]`}>
                  <Upload className="w-3 h-3" />
                  PNG / SVG
                  <input type="file" accept="image/png,image/svg+xml" onChange={handleLogo} className="hidden" />
                </label>
                {form.logo && (
                  <button
                    onClick={() => setForm(f => ({ ...f, logo: null }))}
                    className="h-9 px-3 rounded text-[12px] text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Imágenes de marca */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Imágenes de marca</Label>
              <span className="text-[10px] text-black/25 dark:text-white/25">{form.images.length}/10</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-14 h-14 object-cover" style={{ borderRadius: 4 }} />
                  <button
                    onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {form.images.length < 10 && (
                <label className="w-14 h-14 border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" style={{ borderRadius: 4 }}>
                  <Upload className="w-4 h-4 text-black/25 dark:text-white/25" />
                  <input type="file" accept="image/png,image/jpeg" onChange={handleImages} className="hidden" multiple />
                </label>
              )}
            </div>
          </div>

        </div>

        {/* Footer del modal */}
        <div className="sticky bottom-0 bg-white dark:bg-[#1a1a1a] border-t border-black/[0.06] dark:border-white/[0.05] px-6 py-4 flex items-center justify-between" style={{ borderRadius: '0 0 8px 8px' }}>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-[12px] text-red-500 hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar kit
          </button>
          <div className="flex gap-1.5">
            <button onClick={onClose} className={`${btnGray} text-[12px]`}>Cancelar</button>
            <button onClick={save}    className={`${btnBlack} text-[12px]`}>Guardar</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default KitPanel
