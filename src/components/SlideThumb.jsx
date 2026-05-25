import { FORMAT_DIMS } from './Canvas'

const THUMB_W = 148

export function SlideThumb({ data = {}, format = 'portrait', kit, isActive, onClick, index }) {
  const dims   = FORMAT_DIMS[format] || FORMAT_DIMS.portrait
  const layout = data.layout || 'a'
  const isStory = format === 'story'
  const scale  = THUMB_W / dims.w
  const thumbH = Math.round(dims.h * scale)

  const accent       = data.accentColor || kit?.colors?.accent || '#E8593C'
  const primaryColor = kit?.colors?.primary                    || '#0f0f0f'
  const bgColor      = data.bgColor || kit?.colors?.secondary  || '#f5f5f3'
  const bgImage      = data.bgImage  || null
  const bgOpacity    = data.bgOpacity ?? 0.2

  const titleFont = kit?.fonts?.title?.name ? `'${kit.fonts.title.name}', sans-serif` : 'sans-serif'
  const bodyFont  = kit?.fonts?.body?.name  ? `'${kit.fonts.body.name}', sans-serif`  : 'sans-serif'
  const auxFont   = kit?.fonts?.aux?.name   ? `'${kit.fonts.aux.name}', sans-serif`   : 'sans-serif'

  const pad = isStory ? '36px 28px' : '44px 40px'

  // Mirrors Canvas shared styles exactly
  const sCategory = { color: accent, fontFamily: auxFont, fontSize: '10px', letterSpacing: '0.22em', fontWeight: 600, textTransform: 'uppercase' }
  const sTitle    = { color: primaryColor, fontFamily: titleFont, fontSize: isStory ? '36px' : '44px', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.04em', maxWidth: '92%', wordBreak: 'break-word', overflowWrap: 'break-word' }
  const sBody     = { color: primaryColor, opacity: 0.55, fontFamily: bodyFont, fontSize: isStory ? '13px' : '15px', lineHeight: 1.6, maxWidth: '90%', wordBreak: 'break-word', overflowWrap: 'break-word' }
  const sFooter   = { color: primaryColor, opacity: 0.4, fontFamily: auxFont, fontSize: '12px', letterSpacing: '0.04em', wordBreak: 'break-word' }

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden shrink-0 transition-all ${
        isActive
          ? 'ring-2 ring-white ring-offset-1 ring-offset-black/80'
          : 'opacity-60 hover:opacity-90'
      }`}
      style={{ width: THUMB_W, height: thumbH, backgroundColor: bgColor }}>

      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: dims.w, height: dims.h, position: 'relative', pointerEvents: 'none' }}>

        {bgImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: bgOpacity }} />
        )}

        {(layout === 'a' || layout === 'b') && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />
        )}

        {/* ── Layout A ── */}
        {layout === 'a' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: pad }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={sCategory}>{data.category || ''}</p>
              <h1 style={{ ...sTitle, marginTop: '20px' }}>{data.title || ''}</h1>
              <p style={{ ...sBody, marginTop: '20px' }}>{data.subtitle || ''}</p>
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <p style={sFooter}>{data.footer || ''}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {kit?.logo && <img src={kit.logo} alt="" style={{ height: 24, objectFit: 'contain', opacity: 0.7 }} />}
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accent }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accent, opacity: 0.25 }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accent, opacity: 0.25 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Layout B ── */}
        {layout === 'b' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: pad }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={sCategory}>{data.category || ''}</p>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ ...sBody, marginBottom: '16px' }}>{data.subtitle || ''}</p>
              <h1 style={sTitle}>{data.title || ''}</h1>
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <p style={sFooter}>{data.footer || ''}</p>
              <span style={{ ...sFooter, fontSize: '18px', opacity: 0.35 }}>→</span>
            </div>
          </div>
        )}

        {/* ── Layout C ── */}
        {layout === 'c' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: pad }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={sCategory}>{data.category || ''}</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <h1 style={{ ...sTitle, marginBottom: '16px' }}>{data.title || ''}</h1>
              <p style={sBody}>{data.subtitle || ''}</p>
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <p style={sFooter}>{data.footer || ''}</p>
              {kit?.logo && <img src={kit.logo} alt="" style={{ height: 24, objectFit: 'contain', opacity: 0.7 }} />}
            </div>
          </div>
        )}

      </div>

      <div
        className="absolute top-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-px"
        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 2 }}>
        {(index ?? 0) + 1}
      </div>
    </button>
  )
}
