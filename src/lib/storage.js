export function loadStoredValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function storeValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Storage can fail in private browsing; the UI should keep working.
    return false
  }
}

export function clearAutoShowroomStorage() {
  try {
    const keys = Object.keys(window.localStorage)
    const autoShowroomKeys = keys.filter(key => key.startsWith('auto-showroom-'))

    autoShowroomKeys.forEach(key => {
      window.localStorage.removeItem(key)
    })

    return { success: true, clearedCount: autoShowroomKeys.length, keys: autoShowroomKeys }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
