const STORAGE_KEY = 'crealos_kits'
const MAX_KITS = 3

const DEFAULT_KIT = {
  colors: { primary: '#0f0f0f', secondary: '#f5f5f3', secondary2: '#e0dbd2', accent: '#E8593C', accent2: '#2A4858' },
  fonts: {
    title: { name: '', dataUrl: null },
    body: { name: '', dataUrl: null },
    aux: { name: '', dataUrl: null }
  },
  logo: null,
  images: []
}

export function getKits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function persist(kits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kits))
}

export function createKit(name) {
  const kits = getKits()
  if (kits.length >= MAX_KITS) return null
  const kit = { id: `kit_${Date.now()}`, name, ...DEFAULT_KIT,
    colors: { ...DEFAULT_KIT.colors },
    fonts: {
      title: { ...DEFAULT_KIT.fonts.title },
      body: { ...DEFAULT_KIT.fonts.body },
      aux: { ...DEFAULT_KIT.fonts.aux }
    }
  }
  persist([...kits, kit])
  return kit
}

export function updateKit(id, updates) {
  const kits = getKits().map(k => k.id === id ? { ...k, ...updates } : k)
  persist(kits)
  return kits.find(k => k.id === id)
}

export function deleteKit(id) {
  persist(getKits().filter(k => k.id !== id))
}
