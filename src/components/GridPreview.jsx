import { X } from 'lucide-react'
import { SlideThumb } from './SlideThumb'

function GridPreview({ slides, format, kit, currentSlide, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.07] shrink-0">
        <div>
          <p className="text-[13px] font-semibold text-white">Vista de carrusel</p>
          <p className="text-[11px] text-white/35 mt-0.5">{slides.length} slides · {format}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded flex items-center justify-center bg-white/[0.06] border border-white/[0.07] hover:bg-white/[0.1] transition-colors">
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex flex-wrap gap-4">
          {slides.map((slide, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SlideThumb
                data={slide}
                format={format}
                kit={kit}
                isActive={i === currentSlide}
                index={i}
                onClick={() => { onSelect(i); onClose() }}
              />
              <span className="text-[10px] text-white/35">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GridPreview
