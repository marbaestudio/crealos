import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import CarouselNav from './components/CarouselNav'
import GridPreview from './components/GridPreview'
import { getKits } from './store/kitStore'
import { useExport } from './hooks/useExport'

const CANVAS_ID = 'crealos-canvas'

const DEFAULT_SLIDE = {
  category: 'ARQUITECTURA',
  title: 'Diseñar bien reduce costos.',
  subtitle: 'La planificación correcta evita errores, retrasos y sobrecostos.',
  footer: '@crealos'
}

function loadFonts(kit) {
  if (!kit) return
  ;[kit.fonts?.title, kit.fonts?.body, kit.fonts?.aux].forEach(f => {
    if (!f?.name || !f?.dataUrl) return
    if ([...document.fonts].some(x => x.family === f.name)) return
    const face = new FontFace(f.name, `url(${f.dataUrl})`)
    face.load().then(x => {
      document.fonts.add(x)
      // Inject @font-face in a <style> tag so html2canvas finds it in the cloned document
      const styleId = `crealos-font-${f.name.replace(/\s+/g, '-')}`
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `@font-face { font-family: '${f.name}'; src: url('${f.dataUrl}'); }`
        document.head.appendChild(style)
      }
    }).catch(() => {})
  })
}

function App() {
  const [theme, setTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [kits, setKits]           = useState(() => getKits())
  const [activeKitId, setActiveKitId] = useState(() => getKits()[0]?.id || null)
  const [format, setFormat]       = useState('portrait')
  const [slides, setSlides]       = useState([{ ...DEFAULT_SLIDE }])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showGrid, setShowGrid]   = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { exportPNG, exportAllPNG } = useExport()

  const activeKit = kits.find(k => k.id === activeKitId) || null
  const slide     = slides[currentSlide] || slides[0] || {}

  useEffect(() => { loadFonts(activeKit) }, [activeKit])

  // ── Kit ──────────────────────────────────────────────────────────────────
  function handleKitChange(id) {
    setActiveKitId(id)
    // Clear per-slide bgImages when switching kit (images belong to each kit)
    setSlides(prev => prev.map(s => ({ ...s, bgImage: null })))
  }

  function handleKitsUpdate(updated) { setKits(updated) }

  // ── Slides ────────────────────────────────────────────────────────────────
  function handleSlidesChange(newSlides) {
    setSlides(newSlides)
    setCurrentSlide(0)
  }

  function handleSlideUpdate(index, updates) {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s))
  }

  function handleDuplicate() {
    const copy = { ...slides[currentSlide] }
    setSlides(prev => {
      const next = [...prev]
      next.splice(currentSlide + 1, 0, copy)
      return next
    })
    setCurrentSlide(currentSlide + 1)
  }

  function handleDelete() {
    if (slides.length <= 1) return
    const next = slides.filter((_, i) => i !== currentSlide)
    setSlides(next)
    setCurrentSlide(Math.min(currentSlide, next.length - 1))
  }

  function handleReorder(from, to) {
    setSlides(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setCurrentSlide(to)
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function buildFilename() {
    const kitName = activeKit?.name || 'crealos'
    const suffix = slides.length > 1
      ? `-slide${String(currentSlide + 1).padStart(2, '0')}`
      : ''
    return `${kitName}-${format}${suffix}`.toLowerCase().replace(/\s+/g, '-')
  }

  function handleExport() {
    exportPNG(CANVAS_ID, buildFilename(), format)
  }

  async function handleExportAll() {
    if (isExporting) return
    setIsExporting(true)
    const saved   = currentSlide
    const kitName = activeKit?.name || 'crealos'

    const cleanSlide = ({ bgImage, ...rest }) => rest
    const data    = { format: 'carousel', slides: slides.map(cleanSlide) }
    const jsonText = JSON.stringify(data, null, 2)

    await exportAllPNG(CANVAS_ID, slides, format, kitName, setCurrentSlide, jsonText)
    setCurrentSlide(saved)
    setIsExporting(false)
  }

  function handleExportJSON() {
    const kitName  = activeKit?.name || 'crealos'
    const cleanSlide = ({ bgImage, ...rest }) => rest
    const data     = slides.length === 1
      ? { format: format === 'story' ? 'story' : 'post', ...cleanSlide(slides[0]) }
      : { format: 'carousel', slides: slides.map(cleanSlide) }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' })
    const link = document.createElement('a')
    link.download = `${kitName.toLowerCase().replace(/\s+/g, '-')}-content.txt`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className={theme}>
      <div className="w-full h-screen flex flex-col bg-[#efefed] dark:bg-[#111111] text-black dark:text-white overflow-hidden">

        <Header
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          onExport={handleExport}
          onExportAll={handleExportAll}
          onExportJSON={handleExportJSON}
          isExporting={isExporting}
          hasMultipleSlides={slides.length > 1}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            kits={kits}
            activeKitId={activeKitId}
            onKitChange={handleKitChange}
            onKitsUpdate={handleKitsUpdate}
            format={format}
            onFormatChange={setFormat}
            onSlidesChange={handleSlidesChange}
            onSlideUpdate={handleSlideUpdate}
            currentSlide={currentSlide}
            slides={slides}
          />

          {/* Canvas area */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-auto bg-[#e4e4e2] dark:bg-[#0c0c0c] p-10 gap-0 min-w-0">
            <Canvas
              id={CANVAS_ID}
              data={slide}
              format={format}
              kit={activeKit}
            />
            <CarouselNav
              current={currentSlide}
              total={slides.length}
              onChange={setCurrentSlide}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReorder={handleReorder}
              onShowGrid={() => setShowGrid(true)}
            />
          </div>

        </div>

        {showGrid && (
          <GridPreview
            slides={slides}
            format={format}
            kit={activeKit}
            currentSlide={currentSlide}
            onSelect={setCurrentSlide}
            onClose={() => setShowGrid(false)}
          />
        )}

      </div>
    </div>
  )
}

export default App
