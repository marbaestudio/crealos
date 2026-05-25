const fs = require('fs')

const content = `import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

function Sidebar({ onRender, onFormatChange, onImageChange, onOpacityChange }) {
  const [json, setJson] = useState('')
  const [opacity, setOpacity] = useState(20)

  return (
    <aside className="w-[340px] border-r p-5 overflow-y-auto bg-white/40 dark:bg-[#11141b]/40">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40 font-semibold">Formato</p>
          <select onChange={e => onFormatChange(e.target.value)} className="w-full h-11 rounded-2xl px-4 bg-white dark:bg-[#151821] border border-black/5 text-sm">
            <option value="portrait">Vertical 4:5</option>
            <option value="square">Cuadrado 1:1</option>
            <option value="story">Historia 9:16</option>
          </select>
        </div>
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40 font-semibold">JSON Content</p>
          <textarea rows={10} value={json} onChange={e => setJson(e.target.value)} placeholder="Pega tu JSON aca" className="w-full rounded-3xl p-5 text-xs bg-white dark:bg-[#151821] border border-black/5 resize-none focus:outline-none" />
          <button onClick={() => onRender(json)} className="w-full h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-medium">Actualizar contenido</button>
        </div>
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40 font-semibold">Imagen de fondo</p>
          <input type="file" accept="image/png,image/jpeg" onChange={e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => onImageChange(ev.target.result); reader.readAsDataURL(file) }} className="block w-full text-sm text-black/50 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:bg-black file:text-white file:text-sm" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Transparencia</p>
            <span className="text-sm text-black/40 dark:text-white/40">{opacity}%</span>
          </div>
          <input type="range" min="0" max="100" value={opacity} onChange={e => { setOpacity(e.target.value); onOpacityChange(e.target.value / 100) }} className="w-full" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar`

fs.writeFileSync('src/components/Sidebar.jsx', content)
console.log('Sidebar.jsx creado correctamente')