import { useState } from 'react'
import { createPortal } from 'react-dom'

const FORMAT_DIMS = {
  portrait: { w: 432, h: 540 },
  square:   { w: 432, h: 432 },
  story:    { w: 324, h: 576 }
}

export { FORMAT_DIMS }

function Canvas({ id = 'crealos-canvas', data = {}, format = 'portrait', kit }) {
  const dims   = FORMAT_DIMS[format] || FORMAT_DIMS.portrait
  const layout = data.layout || 'a'
  const isStory = format === 'story'

  const accent       = data.accentColor || kit?.colors?.accent || '#E8593C'
  const primaryColor = kit?.colors?.primary                    || '#0f0f0f'
  const bgColor      = data.bgColor || kit?.colors?.secondary  || '#f5f5f3'
  const bgImage      = data.bgImage  || null
  const bgOpacity    = data.bgOpacity ?? 0.2

  const titleFont = kit?.fonts?.title?.name ? `'${kit.fonts.title.name}', sans-serif` : 'sans-serif'
  const bodyFont  = kit?.fonts?.body?.name  ? `'${kit.fonts.body.name}', sans-serif`  : 'sans-serif'
  const auxFont   = kit?.fonts?.aux?.name   ? `'${kit.fonts.aux.name}', sans-serif`   : 'sans-serif'

  const pad = isStory ? '36px 28px' : '44px 40px'

  // ── Highlight toolbar ─────────────────────────────────────────────────────
  const [toolbar, setToolbar] = useState(null) // { x, y } | null

  function handleMouseUp() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setToolbar(null)
      return
    }
    const canvasEl = document.getElementById(id)
    if (!canvasEl) return
    const range = sel.getRangeAt(0)
    if (!canvasEl.contains(range.commonAncestorContainer)) {
      setToolbar(null)
      return
    }
    const rect = range.getBoundingClientRect()
    setToolbar({ x: rect.left + rect.width / 2, y: rect.top })
  }

  function applyHighlight(e) {
    e.preventDefault()
    e.stopPropagation()
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const range = sel.getRangeAt(0).cloneRange()
    // Use plain text only — avoids dragging in browser-added spans (spell-check,
    // IME, etc.) that would introduce unexpected styles inside our span.
    const text = range.toString()
    if (!text) return
    const span = document.createElement('span')
    span.style.cssText = `color:${accent};font-weight:inherit;font-size:inherit;font-family:inherit;letter-spacing:inherit;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale`
    span.appendChild(document.createTextNode(text))
    range.deleteContents()
    range.insertNode(span)
    sel.removeAllRanges()
    setToolbar(null)
  }

  function clearHighlight(e) {
    e.preventDefault()
    e.stopPropagation()
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const canvasEl = document.getElementById(id)
    if (!canvasEl) return
    canvasEl.querySelectorAll('span[style*="color"]').forEach(span => {
      if (range.intersectsNode(span)) {
        const text = document.createTextNode(span.textContent)
        span.parentNode.replaceChild(text, span)
      }
    })
    // Merge adjacent text nodes left after unwrapping
    canvasEl.querySelectorAll('h1, p').forEach(el => el.normalize())
    sel.removeAllRanges()
    setToolbar(null)
  }

  // ── Shared text styles ─────────────────────────────────────────────────────────────────────────────────────────────────────
  const sCategory = {
    color: accent, fontFamily: auxFont,
    fontSize: '10px', letterSpacing: '0.22em', fontWeight: 600, textTransform: 'uppercase'
  }
  const sTitle = {
    color: primaryColor, fontFamily: titleFont,
    fontSize: isStory ? '36px' : '44px',
    fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.04em',
    maxWidth: '92%', wordBreak: 'break-word', overflowWrap: 'break-word',
    WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale'
  }
  const sBody = {
    color: primaryColor, opacity: 0.55, fontFamily: bodyFont,
    fontSize: isStory ? '13px' : '15px',
    lineHeight: 1.6, maxWidth: '90%',
    wordBreak: 'break-word', overflowWrap: 'break-word'
  }
  const sFooter = {
    color: primaryColor, opacity: 0.4, fontFamily: auxFont,
    fontSize: '12px', letterSpacing: '0.04em', wordBreak: 'break-word'
  }

  return (
    <>
    <div
      id={id}
      onMouseUp={handleMouseUp}
      className="relative overflow-hidden shrink-0"
      style={{ width: dims.w, height: dims.h, backgroundColor: bgColor }}>

      {bgImage && (
        <div
          data-layer="bg"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgOpacity
          }}
        />
      )}

      {(layout === 'a' || layout === 'b') && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
        />
      )}

      {/* ── Layout A: categoría + título + body arriba · footer abajo ── */}
      {layout === 'a' && (
        <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: pad }}>
          <div className="relative z-10 space-y-5">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sCategory}>
              {data.category || ''}
            </p>
            <h1 contentEditable suppressContentEditableWarning className="focus:outline-none" style={sTitle}>
              {data.title || 'Tu título aquí.'}
            </h1>
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sBody}>
              {data.subtitle || ''}
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sFooter}>
              {data.footer || ''}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              {kit?.logo && <img src={kit.logo} alt="" className="h-6 object-contain opacity-70" />}
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, opacity: 0.25 }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, opacity: 0.25 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Layout B: categoría arriba · body + título abajo · footer + flecha ── */}
      {layout === 'b' && (
        <div className="absolute inset-0 flex flex-col" style={{ padding: pad }}>
          <div className="relative z-10">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sCategory}>
              {data.category || ''}
            </p>
          </div>

          <div className="flex-1" />

          <div className="relative z-10 space-y-4">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sBody}>
              {data.subtitle || ''}
            </p>
            <h1 contentEditable suppressContentEditableWarning className="focus:outline-none" style={sTitle}>
              {data.title || 'Tu título aquí.'}
            </h1>
          </div>

          <div className="relative z-10 flex items-center justify-between mt-5">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sFooter}>
              {data.footer || ''}
            </p>
            <span style={{ ...sFooter, fontSize: '18px', opacity: 0.35 }}>→</span>
          </div>
        </div>
      )}

      {/* ── Layout C: categoría arriba · título + body centrado · footer abajo ── */}
      {layout === 'c' && (
        <div className="absolute inset-0 flex flex-col" style={{ padding: pad }}>
          <div className="relative z-10">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sCategory}>
              {data.category || ''}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center relative z-10 space-y-4">
            <h1 contentEditable suppressContentEditableWarning className="focus:outline-none" style={sTitle}>
              {data.title || 'Tu título aquí.'}
            </h1>
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sBody}>
              {data.subtitle || ''}
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <p contentEditable suppressContentEditableWarning className="focus:outline-none" style={sFooter}>
              {data.footer || ''}
            </p>
            {kit?.logo && <img src={kit.logo} alt="" className="h-6 object-contain opacity-70" />}
          </div>
        </div>
      )}
    </div>

    {toolbar && createPortal(
      <div
        style={{
          position: 'fixed',
          left: toolbar.x,
          top: toolbar.y - 8,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#1a1a1a',
          borderRadius: 20,
          padding: '5px 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}>
        <button
          onMouseDown={applyHighlight}
          style={{ color: accent, fontSize: 11, fontWeight: 700, fontFamily: 'system-ui', cursor: 'pointer' }}>
          Resaltar
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>|</span>
        <button
          onMouseDown={clearHighlight}
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'system-ui', cursor: 'pointer' }}>
          Quitar
        </button>
      </div>,
      document.body
    )}
    </>
  )
}

export default Canvas
