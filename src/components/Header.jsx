import { Moon, Sun, Download, FileText, FolderDown, Loader2 } from 'lucide-react'

const iconBtn = 'w-8 h-8 rounded flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.07] hover:bg-black/[0.09] dark:hover:bg-white/[0.1] transition-colors'

function Header({ theme, onToggleTheme, onExport, onExportAll, onExportJSON, isExporting, hasMultipleSlides }) {
  return (
    <header className="h-[60px] shrink-0 border-b border-black/[0.08] dark:border-white/[0.06] flex items-center justify-between px-6 bg-white dark:bg-[#161616]">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/isotipo.svg" alt="" className="h-6 dark:invert" />
        <svg viewBox="0 0 265 56" height="18" aria-label="CREALOS"
             className="fill-black dark:fill-white overflow-visible">
          <text fontFamily="'Montserrat', sans-serif" fontWeight="500" fontSize="48">
            <tspan x="0"   y="50">C</tspan>
            <tspan x="38"  y="50">R</tspan>
            <tspan x="76"  y="50">E</tspan>
            <tspan x="157" y="50">L</tspan>
            <tspan x="189" y="50">O</tspan>
            <tspan x="231" y="50">S</tspan>
          </text>
          <path d="M 117 50 L 134 16 L 152 50 Z M 123 50 L 134 27 L 146 50 Z" fillRule="evenodd"/>
        </svg>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">

        <button onClick={onToggleTheme} title="Cambiar tema" className={iconBtn}>
          {theme === 'dark'
            ? <Sun className="w-3.5 h-3.5" />
            : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* TXT solo cuando es slide único */}
        {!hasMultipleSlides && (
          <button onClick={onExportJSON} title="Descargar contenido (.txt)" className={iconBtn}>
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}

        {/* ZIP lote solo cuando hay carrusel */}
        {hasMultipleSlides && (
          <button
            onClick={onExportAll}
            disabled={isExporting}
            title="Exportar lote ZIP (incluye content.txt)"
            className={`${iconBtn} disabled:opacity-35 disabled:cursor-not-allowed`}>
            {isExporting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <FolderDown className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          onClick={onExport}
          className="h-8 px-4 text-[12px] font-medium flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-85 transition-opacity"
          style={{ borderRadius: 4 }}>
          <Download className="w-3.5 h-3.5" />
          Exportar PNG
        </button>

      </div>
    </header>
  )
}

export default Header
