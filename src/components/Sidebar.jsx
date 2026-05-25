import { useState } from 'react'
import { ExternalLink, Plus, Pencil, BookTemplate, Trash2, ImageIcon, Wand2, Loader2 } from 'lucide-react'
import KitPanel from './KitPanel'
import { createKit } from '../store/kitStore'
import { getTemplates, saveTemplate, deleteTemplate } from '../store/canvasStore'


const FORMAT_OPTIONS = [
  { value: 'portrait', label: 'Post vertical 4:5' },
  { value: 'square',   label: 'Post cuadrado 1:1' },
  { value: 'story',    label: 'Historia 9:16' }
]

const inputCls  = 'w-full h-9 rounded px-3 text-sm bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.07] focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25'
const selectCls = 'w-full h-9 rounded pl-3 pr-8 text-sm bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.07] appearance-none focus:outline-none'
const btnGray   = 'h-9 px-4 rounded text-sm bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07] hover:bg-black/[0.09] dark:hover:bg-white/[0.1] transition-colors'
const btnBlack  = 'h-9 px-4 rounded text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-85 transition-opacity'

function Label({ children, sub }) {
  return (
    <div className="flex items-baseline gap-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">{children}</p>
      {sub && <span className="text-[10px] text-black/25 dark:text-white/25 normal-case tracking-normal">{sub}</span>}
    </div>
  )
}

// ── Sección Estilo ────────────────────────────────────────────────────────────
function EstiloPanel({
  kits, activeKitId, onKitChange, onKitsUpdate,
  format, onFormatChange,
  onSlideUpdate, currentSlide, slides,
  onOpenKitPanel
}) {
  const activeKit     = kits.find(k => k.id === activeKitId)
  const slideData     = slides[currentSlide] || {}
  const bgOpacityPct  = Math.round((slideData.bgOpacity ?? 0.2) * 100)
  const kitBg         = activeKit?.colors?.secondary || '#f5f5f3'
  const currentBgCol  = slideData.bgColor || kitBg
  const stockImages   = activeKit?.images || []

  function handleNewKit() {
    if (kits.length >= 3) return
    const name = prompt('Nombre del nuevo kit:')
    if (!name?.trim()) return
    const kit = createKit(name.trim())
    if (kit) { onKitsUpdate([...kits, kit]); onKitChange(kit.id) }
  }

  function handleImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onSlideUpdate(currentSlide, { bgImage: ev.target.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="py-3">

      {/* Kit de marca */}
      <div className="px-3 mb-1">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">Kit de marca</span>
          <div className="flex gap-0.5">
            {activeKit && (
              <button onClick={onOpenKitPanel} title="Editar kit" className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors">
                <Pencil className="w-3 h-3 text-black/40 dark:text-white/40" />
              </button>
            )}
            {kits.length < 3 && (
              <button onClick={handleNewKit} title="Nuevo kit" className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors">
                <Plus className="w-3 h-3 text-black/40 dark:text-white/40" />
              </button>
            )}
          </div>
        </div>
        {kits.length === 0 && (
          <p className="px-2 py-1 text-[11px] text-black/30 dark:text-white/30">Creá tu primer kit.</p>
        )}
        {kits.map(k => (
          <button
            key={k.id}
            onClick={() => onKitChange(k.id)}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
              k.id === activeKitId
                ? 'bg-black/[0.07] dark:bg-white/[0.09] text-black dark:text-white'
                : 'text-black/55 dark:text-white/55 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white'
            }`}>
            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: k.colors?.accent || '#E8593C' }} />
            <span className="text-[13px] truncate">{k.name}</span>
          </button>
        ))}
      </div>

      <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.04]" />

      {/* Formato */}
      <div className="px-3 mb-1">
        <div className="px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">Formato</span>
        </div>
        <div className="flex gap-1 px-2">
          {FORMAT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => onFormatChange(o.value)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                format === o.value
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-black/45 dark:text-white/45'
              }`}>
              {o.value === 'portrait' ? '4:5' : o.value === 'square' ? '1:1' : '9:16'}
            </button>
          ))}
        </div>
      </div>

      <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.04]" />

      {/* Layout */}
      <div className="px-3 mb-1">
        <div className="px-2 py-1.5 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">Diseño</span>
          {slides.length > 1 && <span className="text-[10px] text-black/20 dark:text-white/20">· slide {currentSlide + 1}</span>}
        </div>
        <div className="flex gap-1 px-2">
          {[
            { value: 'a', label: 'Clásico', icon: (
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor" opacity="0.8"/>
                <rect x="2" y="7" width="20" height="3" rx="1" fill="currentColor" opacity="0.9"/>
                <rect x="2" y="12" width="16" height="2" rx="1" fill="currentColor" opacity="0.45"/>
                <rect x="2" y="17" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.3"/>
              </svg>
            )},
            { value: 'b', label: 'Titular', icon: (
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <rect x="2" y="3" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.3"/>
                <rect x="2" y="12" width="14" height="2" rx="1" fill="currentColor" opacity="0.6"/>
                <rect x="2" y="15" width="20" height="3" rx="1" fill="currentColor" opacity="0.9"/>
                <rect x="2" y="19" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.3"/>
                <rect x="22" y="19" width="4" height="1.5" rx="0.75" fill="currentColor" opacity="0.3"/>
              </svg>
            )},
            { value: 'c', label: 'Foto', icon: (
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <rect x="0" y="0" width="28" height="22" rx="2" fill="currentColor" opacity="0.12"/>
                <rect x="0" y="11" width="28" height="11" rx="1" fill="currentColor" opacity="0.18"/>
                <rect x="2" y="3" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.35"/>
                <rect x="2" y="13" width="14" height="2" rx="1" fill="currentColor" opacity="0.65"/>
                <rect x="2" y="16" width="20" height="3" rx="1" fill="currentColor" opacity="0.9"/>
                <rect x="2" y="20" width="6" height="1.2" rx="0.6" fill="currentColor" opacity="0.3"/>
              </svg>
            )},
          ].map(o => (
            <button
              key={o.value}
              onClick={() => onSlideUpdate(currentSlide, { layout: o.value })}
              title={o.label}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                (slideData.layout || 'a') === o.value
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-black/45 dark:text-white/45'
              }`}>
              {o.icon}
              <span className="text-[9px] font-medium">{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.04]" />

      {/* Color de fondo */}
      <div className="px-3 mb-1">
        <div className="px-2 py-1.5 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">Color de fondo</span>
          {slides.length > 1 && <span className="text-[10px] text-black/20 dark:text-white/20">· slide {currentSlide + 1}</span>}
        </div>
        <div className="px-2 py-1 flex items-center gap-3">
          <label className="relative w-7 h-7 overflow-hidden cursor-pointer shrink-0" style={{ borderRadius: 6 }}>
            <div className="absolute inset-0" style={{ backgroundColor: currentBgCol }} />
            <input
              type="color"
              value={currentBgCol}
              onChange={e => onSlideUpdate(currentSlide, { bgColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
          <span className="text-[11px] font-mono text-black/40 dark:text-white/40 flex-1">{currentBgCol}</span>
          {slideData.bgColor && (
            <button
              onClick={() => onSlideUpdate(currentSlide, { bgColor: undefined })}
              className="text-[11px] text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.04]" />

      {/* Imagen de fondo */}
      <div className="px-3 mb-1">
        <div className="px-2 py-1.5 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">Imagen de fondo</span>
          {slides.length > 1 && <span className="text-[10px] text-black/20 dark:text-white/20">· slide {currentSlide + 1}</span>}
        </div>
        <div className="px-2 space-y-2.5">
          <label className="w-full flex items-center gap-2.5 py-2 rounded-lg text-[13px] text-black/55 dark:text-white/55 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            <ExternalLink className="w-3.5 h-3.5 rotate-45 shrink-0" />
            Cargar imagen
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageFile} />
          </label>

          {stockImages.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] text-black/30 dark:text-white/30">
                <ImageIcon className="w-3 h-3" />
                Stock del kit
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stockImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => onSlideUpdate(currentSlide, { bgImage: img })}
                    className={`w-11 h-11 overflow-hidden transition-all ${
                      slideData.bgImage === img
                        ? 'ring-2 ring-black dark:ring-white ring-offset-1'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderRadius: 4 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {slideData.bgImage && (
                  <button
                    onClick={() => onSlideUpdate(currentSlide, { bgImage: null })}
                    className="w-11 h-11 flex items-center justify-center text-[10px] text-black/30 dark:text-white/30 hover:text-red-400 transition-colors"
                    style={{ borderRadius: 4, border: '1px dashed currentColor' }}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pb-1">
            <span className="text-[11px] text-black/35 dark:text-white/35 w-14 shrink-0">Opacidad</span>
            <input
              type="range" min={0} max={100} value={bgOpacityPct}
              onChange={e => onSlideUpdate(currentSlide, { bgOpacity: Number(e.target.value) / 100 })}
              className="flex-1 accent-black dark:accent-white h-1"
            />
            <span className="text-[11px] text-black/35 dark:text-white/35 w-7 text-right tabular-nums">{bgOpacityPct}%</span>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Sección Contenido ─────────────────────────────────────────────────────────
function ContenidoPanel({
  kits, activeKitId, onKitsUpdate,
  format, onFormatChange, onSlidesChange,
  currentSlide, slides,
  topic, onTopicChange,
  tipo,  onTipoChange,
  json,  onJsonChange
}) {
  const activeKit = kits.find(k => k.id === activeKitId)

  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError]         = useState('')
  const [showContext, setShowContext]   = useState(false)
  const [brandContext, setBrandContext] = useState(
    () => localStorage.getItem('crealos-brand-context') || ''
  )
  const [jsonError, setJsonError]       = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateName, setTemplateName]   = useState('')
  const [templateMsg, setTemplateMsg]     = useState('')

  function saveBrandContext(val) {
    setBrandContext(val)
    localStorage.setItem('crealos-brand-context', val)
  }

  function handleContextFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => saveBrandContext(ev.target.result)
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  async function handleGenerate() {
    if (!topic.trim() || isGenerating) return
    setIsGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          tipo,
          brandContext,
          kitName:   activeKit?.name   || '',
          kitColors: activeKit?.colors || null,
          kitFonts:  activeKit?.fonts  || null
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setGenError(data.error || 'Error al generar.')
      } else {
        onJsonChange(JSON.stringify(JSON.parse(data.result), null, 2))
        setJsonError('')
      }
    } catch {
      setGenError('No se pudo conectar. Revisá que la app esté desplegada en Netlify.')
    } finally {
      setIsGenerating(false)
    }
  }

  const templates = activeKitId ? getTemplates(activeKitId) : []
  const slideData = slides[currentSlide] || {}

  function executeJSON() {
    setJsonError('')
    let data
    try { data = JSON.parse(json) }
    catch { setJsonError('JSON inválido. Revisá la sintaxis.'); return }

    if (!['post', 'story', 'carousel'].includes(data.format)) {
      setJsonError('Campo "format" debe ser: post, story o carousel.')
      return
    }

    if (data.format === 'carousel') {
      const raw = Array.isArray(data.slides) ? data.slides.slice(0, 10) : []
      onSlidesChange(raw.length > 0 ? raw : [{}])
    } else {
      onSlidesChange([{
        category: data.category, title: data.title,
        subtitle: data.subtitle, footer: data.footer,
        accentColor: data.accentColor
      }])
    }
  }

  function handleSaveTemplate() {
    if (!activeKitId || !templateName.trim()) return
    const result = saveTemplate(activeKitId, templateName.trim(), { format, slides: [slideData] })
    setTemplateName('')
    if (result === true) {
      setTemplateMsg('Guardada.')
    } else if (result === 'no_bg') {
      setTemplateMsg('Guardada sin fondo (imagen demasiado pesada).')
    } else {
      setTemplateMsg('Límite alcanzado (10).')
    }
    setTimeout(() => setTemplateMsg(''), 3000)
  }

  function loadTemplate(tmpl) {
    onFormatChange(tmpl.format)
    onSlidesChange(tmpl.slides || [{}])
  }

  function removeTemplate(tmplId) {
    if (!activeKitId) return
    deleteTemplate(activeKitId, tmplId)
    onKitsUpdate([...kits])
  }

  return (
    <div className="py-3">

      {/* Generar con IA */}
      <div className="px-3 mb-1">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">Generar con IA</span>
          {activeKit && (
            <span className="text-[10px] text-black/25 dark:text-white/25 truncate max-w-[100px]">{activeKit.name}</span>
          )}
        </div>

        {/* Contexto de marca */}
        <div className="px-2 mb-2">
          <div className="flex items-center justify-between py-1.5">
            <button
              onClick={() => setShowContext(v => !v)}
              className="flex items-center gap-1.5 text-left group flex-1 min-w-0">
              <Plus className={`w-3 h-3 text-black/30 dark:text-white/30 transition-transform shrink-0 ${showContext ? 'rotate-45' : ''}`} />
              <span className="text-[11px] text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors truncate">
                {brandContext.trim() ? 'Contexto de marca ✓' : 'Contexto de marca…'}
              </span>
            </button>
            <label title="Cargar archivo .md" className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors cursor-pointer shrink-0">
              <ExternalLink className="w-3 h-3 text-black/30 dark:text-white/30 rotate-180" />
              <input type="file" accept=".md,.txt" className="hidden" onChange={handleContextFile} />
            </label>
          </div>
          {showContext && (
            <textarea
              rows={5}
              value={brandContext}
              onChange={e => saveBrandContext(e.target.value)}
              placeholder={'Describí tu marca: rubro, tono de voz, pilares de contenido, audiencia, lo que no decir...\n\nEj: Estudio de arquitectura premium. Tono profesional y cercano. Pilares: diseño sostenible, eficiencia energética, bienestar. Audiencia: propietarios ABC1.'}
              className="w-full mt-0.5 rounded-lg p-2.5 text-[11px] bg-black/[0.04] dark:bg-white/[0.05] resize-none focus:outline-none placeholder:text-black/20 dark:placeholder:text-white/20 leading-relaxed"
            />
          )}
        </div>

        <div className="px-2 space-y-2 pb-3">
          {/* Tipo */}
          <div className="flex gap-1">
            {['carousel', 'post', 'story'].map(t => (
              <button key={t} onClick={() => onTipoChange(t)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  tipo === t
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-black/45 dark:text-white/45'
                }`}>
                {t === 'carousel' ? 'Carrusel' : t === 'post' ? 'Post' : 'Historia'}
              </button>
            ))}
          </div>

          {/* Brief */}
          <textarea
            rows={4}
            value={topic}
            onChange={e => { onTopicChange(e.target.value); setGenError('') }}
            placeholder={tipo === 'carousel'
              ? 'Brief. Podés pedir cantidad de slides: "5 slides sobre cómo el diseño reduce costos en obra"'
              : 'Brief del contenido. Ej: Cómo la planificación reduce costos y retrasos en obra'}
            className="w-full rounded-lg p-2.5 text-[11px] bg-black/[0.04] dark:bg-white/[0.05] resize-none focus:outline-none placeholder:text-black/20 dark:placeholder:text-white/20 leading-relaxed"
          />

          {genError && <p className="text-[11px] text-red-500">{genError}</p>}

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className={`w-full ${btnBlack} disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
            {isGenerating
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generando...</>
              : <><Wand2 className="w-3.5 h-3.5" />Generar</>}
          </button>
        </div>
      </div>

      <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.04]" />

      {/* JSON manual */}
      <div className="px-3 mb-1">
        <div className="px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">JSON</span>
        </div>
      </div>

      <div className="px-5 pb-3 space-y-2">
        <textarea
          rows={7}
          value={json}
          onChange={e => { onJsonChange(e.target.value); setJsonError('') }}
          placeholder={'{\n  "format": "post",\n  "title": "...",\n  "subtitle": "...",\n  "footer": "@marca"\n}'}
          className="w-full rounded-lg p-3 text-[11px] bg-black/[0.04] dark:bg-white/[0.05] resize-none focus:outline-none font-mono leading-relaxed placeholder:text-black/20 dark:placeholder:text-white/20"
        />
        {jsonError && <p className="text-[11px] text-red-500">{jsonError}</p>}
        <button onClick={executeJSON} className={`w-full ${btnBlack}`}>
          Aplicar contenido
        </button>
      </div>

      <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.04]" />

      {/* Plantillas */}
      <div className="px-3">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35 font-medium">
            Plantillas <span className="normal-case tracking-normal text-black/20 dark:text-white/20">{templates.length}/10</span>
          </span>
          <button
            onClick={() => setShowTemplates(v => !v)}
            title={showTemplates ? 'Ocultar plantillas' : 'Ver plantillas'}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors">
            <Plus className={`w-3 h-3 text-black/40 dark:text-white/40 transition-transform ${showTemplates ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {showTemplates && (
          <div className="space-y-0.5 mb-2">
            {templates.length === 0 && (
              <p className="px-2 py-1 text-[11px] text-black/30 dark:text-white/30">Sin plantillas guardadas.</p>
            )}
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-0.5 group">
                <button
                  onClick={() => loadTemplate(t)}
                  className="flex-1 flex items-center gap-2.5 px-2 py-2 rounded-lg text-left text-[13px] text-black/55 dark:text-white/55 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white transition-colors min-w-0">
                  <BookTemplate className="w-3.5 h-3.5 shrink-0 text-black/25 dark:text-white/25" />
                  <span className="truncate">{t.name}</span>
                </button>
                <button
                  onClick={() => removeTemplate(t.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-500 transition-all shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {activeKitId && templates.length < 10 && (
              <div className="flex gap-1.5 px-2 pt-2">
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
                  placeholder={slides.length > 1 ? 'Guardar slide actual…' : 'Nombre…'}
                  className="flex-1 h-8 rounded-lg px-2.5 text-[11px] bg-black/[0.04] dark:bg-white/[0.05] focus:outline-none placeholder:text-black/20 dark:placeholder:text-white/20"
                />
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  title="Guardar plantilla"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-black dark:bg-white text-white dark:text-black disabled:opacity-30">
                  <BookTemplate className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {templateMsg && (
              <p className="px-2 text-[11px] text-black/40 dark:text-white/40">{templateMsg}</p>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Sidebar principal ─────────────────────────────────────────────────────────
function Sidebar({
  kits, activeKitId, onKitChange, onKitsUpdate,
  format, onFormatChange,
  onSlidesChange, onSlideUpdate,
  currentSlide, slides
}) {
  const [tab, setTab] = useState('estilo')
  const [showKitPanel, setShowKitPanel] = useState(false)
  const [genTopic, setGenTopic] = useState('')
  const [genTipo, setGenTipo]   = useState('carousel')
  const [genJson, setGenJson]   = useState('')
  const activeKit = kits.find(k => k.id === activeKitId)

  return (
    <>
      <aside className="w-[300px] shrink-0 border-r border-black/[0.06] dark:border-white/[0.04] bg-[#fafafa] dark:bg-[#181818] flex flex-col">

        <div className="flex shrink-0 border-b border-black/[0.06] dark:border-white/[0.04]">
          {['estilo', 'contenido'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                tab === t
                  ? 'text-black dark:text-white border-b-2 border-black dark:border-white -mb-px'
                  : 'text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'estilo' && (
            <EstiloPanel
              kits={kits}
              activeKitId={activeKitId}
              onKitChange={onKitChange}
              onKitsUpdate={onKitsUpdate}
              format={format}
              onFormatChange={onFormatChange}
              onSlideUpdate={onSlideUpdate}
              currentSlide={currentSlide}
              slides={slides}
              onOpenKitPanel={() => setShowKitPanel(true)}
            />
          )}
          {tab === 'contenido' && (
            <ContenidoPanel
              kits={kits}
              activeKitId={activeKitId}
              onKitsUpdate={onKitsUpdate}
              format={format}
              onFormatChange={onFormatChange}
              onSlidesChange={onSlidesChange}
              currentSlide={currentSlide}
              slides={slides}
              topic={genTopic}      onTopicChange={setGenTopic}
              tipo={genTipo}        onTipoChange={setGenTipo}
              json={genJson}        onJsonChange={setGenJson}
            />
          )}
        </div>
      </aside>

      {showKitPanel && activeKit && (
        <KitPanel
          kit={activeKit}
          onClose={() => setShowKitPanel(false)}
          onUpdate={kit => onKitsUpdate(kits.map(k => k.id === kit.id ? kit : k))}
          onDelete={id => {
            const remaining = kits.filter(k => k.id !== id)
            onKitsUpdate(remaining)
            if (activeKitId === id) onKitChange(remaining[0]?.id || null)
            setShowKitPanel(false)
          }}
        />
      )}
    </>
  )
}

export default Sidebar
