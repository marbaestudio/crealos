import { useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, LayoutGrid, Trash2 } from 'lucide-react'

function CarouselNav({ current, total, onChange, onDuplicate, onDelete, onReorder, onShowGrid }) {
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  if (total <= 1) return null

  function handleDragStart(i) {
    setDragFrom(i)
  }
  function handleDragEnter(i) {
    setDragOver(i)
  }
  function handleDragEnd() {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
      onReorder(dragFrom, dragOver)
    }
    setDragFrom(null)
    setDragOver(null)
  }

  const btnCls = 'w-7 h-7 rounded flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07] hover:bg-black/[0.09] dark:hover:bg-white/[0.1] transition-colors disabled:opacity-25'

  return (
    <div className="flex items-center gap-2.5 mt-4">
      <button
        onClick={() => onChange(Math.max(0, current - 1))}
        disabled={current === 0}
        className={btnCls}>
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Dots — draggable para reordenar */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={e => e.preventDefault()}
            onDragEnd={handleDragEnd}
            onClick={() => onChange(i)}
            title={`Slide ${i + 1}`}
            className={`rounded-full transition-all cursor-grab active:cursor-grabbing ${
              dragOver === i && dragFrom !== i ? 'scale-[1.8] bg-black/50 dark:bg-white/50' : ''
            } ${
              i === current
                ? 'w-5 h-[5px] bg-black dark:bg-white'
                : 'w-[5px] h-[5px] bg-black/25 dark:bg-white/25 hover:bg-black/50 dark:hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => onChange(Math.min(total - 1, current + 1))}
        disabled={current === total - 1}
        className={btnCls}>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      <span className="text-[11px] text-black/35 dark:text-white/35 tabular-nums w-8">
        {current + 1}/{total}
      </span>

      <div className="flex items-center gap-1">
        <button onClick={onDuplicate} title="Duplicar slide actual" className={btnCls}>
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          title="Eliminar slide actual"
          disabled={total <= 1}
          className={`${btnCls} hover:bg-red-500/10 hover:border-red-400/30 disabled:opacity-25`}>
          <Trash2 className="w-3 h-3" />
        </button>
        <button onClick={onShowGrid} title="Vista grilla del carrusel" className={btnCls}>
          <LayoutGrid className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default CarouselNav
