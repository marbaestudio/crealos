import { useCallback } from 'react'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'

// Portrait 1080x1350 | Square 1080x1080 | Story 1080x1920
const OUTPUT_DIMS = {
  portrait: { w: 1080, h: 1350 },
  square:   { w: 1080, h: 1080 },
  story:    { w: 1080, h: 1920 },
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgAR = img.naturalWidth / img.naturalHeight
  const canvasAR = w / h
  let dw, dh, dx, dy
  if (imgAR > canvasAR) {
    dh = h; dw = img.naturalWidth * (h / img.naturalHeight)
    dx = x + (w - dw) / 2; dy = y
  } else {
    dw = w; dh = img.naturalHeight * (w / img.naturalWidth)
    dx = x; dy = y + (h - dh) / 2
  }
  ctx.drawImage(img, dx, dy, dw, dh)
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function cleanContentEditable(cloned) {
  // 1. Remove browser-inserted spans (Chrome adds invisible spans inside contentEditable
  //    for spell-check, IME, and internal text layout). They have no meaningful styles
  //    and their boundaries cause html2canvas to drop adjacent spaces.
  //    Keep only spans that carry an intentional color (highlight feature).
  cloned.querySelectorAll('[contenteditable] span').forEach(span => {
    if (!span.style.color) {
      while (span.firstChild) span.parentNode.insertBefore(span.firstChild, span)
      span.parentNode.removeChild(span)
    }
  })

  // 2. Merge adjacent text nodes left by the unwrap pass above.
  cloned.querySelectorAll('[contenteditable]').forEach(el => el.normalize())

  // 3. For intentional highlight spans that remain, replace the space at their borders
  //    with a non-breaking space ( ) so html2canvas does not collapse it.
  cloned.querySelectorAll('[contenteditable] span[style*="color"]').forEach(span => {
    const prev = span.previousSibling
    const next = span.nextSibling
    if (prev && prev.nodeType === 3 && prev.textContent.endsWith(' '))
      prev.textContent = prev.textContent.slice(0, -1) + ' '
    if (next && next.nodeType === 3 && next.textContent.startsWith(' '))
      next.textContent = ' ' + next.textContent.slice(1)
  })
}

async function captureCanvas(elementId, format) {
  const el = document.getElementById(elementId)
  if (!el) return null

  await document.fonts.ready

  const { w: outW, h: outH } = OUTPUT_DIMS[format] || OUTPUT_DIMS.portrait
  const scale = outW / el.offsetWidth

  const bgDiv = el.querySelector('[data-layer="bg"]')
  let bgImageSrc = null
  let bgOpacity = 0.2
  if (bgDiv) {
    const match = bgDiv.style.backgroundImage?.match(/url\("?([^"]+)"?\)/)
    bgImageSrc = match?.[1] || null
    bgOpacity = parseFloat(bgDiv.style.opacity) ?? 0.2
  }

  const textCanvas = await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    imageTimeout: 0,
    onclone: (_doc, cloned) => {
      const clonedBg = cloned.querySelector('[data-layer="bg"]')
      if (clonedBg) clonedBg.style.display = 'none'
      cloned.style.backgroundColor = 'transparent'
      cleanContentEditable(cloned)
    }
  })

  if (!bgImageSrc) {
    const out = document.createElement('canvas')
    out.width = outW; out.height = outH
    const ctx = out.getContext('2d')
    ctx.fillStyle = el.style.backgroundColor || '#f5f5f3'
    ctx.fillRect(0, 0, outW, outH)
    ctx.drawImage(textCanvas, 0, 0)
    return out
  }

  const out = document.createElement('canvas')
  out.width = outW; out.height = outH
  const ctx = out.getContext('2d')

  ctx.fillStyle = el.style.backgroundColor || '#f5f5f3'
  ctx.fillRect(0, 0, outW, outH)

  try {
    const img = await loadImage(bgImageSrc)
    ctx.globalAlpha = bgOpacity
    drawImageCover(ctx, img, 0, 0, outW, outH)
    ctx.globalAlpha = 1
  } catch {
    // continue without background image
  }

  ctx.drawImage(textCanvas, 0, 0)
  return out
}

export function useExport() {
  const exportPNG = useCallback(async (elementId, filename, format) => {
    const canvas = await captureCanvas(elementId, format)
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const exportAllPNG = useCallback(async (elementId, slides, format, kitName, onSlideChange, jsonText) => {
    const zip = new JSZip()
    const prefix = kitName.toLowerCase().replace(/\s+/g, '-')

    for (let i = 0; i < slides.length; i++) {
      onSlideChange(i)
      await new Promise(r => requestAnimationFrame(() => setTimeout(r, 150)))
      const canvas = await captureCanvas(elementId, format)
      if (!canvas) continue
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
      zip.file(`${prefix}-${format}-slide${String(i + 1).padStart(2, '0')}.png`, blob)
    }

    if (jsonText) zip.file('content.txt', jsonText)

    const content = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.download = `${prefix}-${format}-lote.zip`
    link.href = URL.createObjectURL(content)
    link.click()
    URL.revokeObjectURL(link.href)
  }, [])

  return { exportPNG, exportAllPNG }
}
