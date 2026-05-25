const STORAGE_KEY = 'crealos_templates'
const MAX_PER_KIT = 10

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function getTemplates(kitId) {
  return loadAll()[kitId] || []
}

// Returns: true | false | 'no_bg' (saved but without bgImage due to quota)
export function saveTemplate(kitId, name, data) {
  const all = loadAll()
  const list = all[kitId] || []
  if (list.length >= MAX_PER_KIT) return false
  const entry = { id: `tmpl_${Date.now()}`, name, ...data }
  all[kitId] = [...list, entry]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return true
  } catch {
    // Quota exceeded — retry without bgImage
    const stripped = {
      ...entry,
      slides: (entry.slides || []).map(({ bgImage, ...s }) => s)
    }
    all[kitId] = [...list, stripped]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
      return 'no_bg'
    } catch {
      return false
    }
  }
}

export function deleteTemplate(kitId, templateId) {
  const all = loadAll()
  all[kitId] = (all[kitId] || []).filter(t => t.id !== templateId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
