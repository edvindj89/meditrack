import { normalizeAppState } from '../domain/appState'
import type { AppState } from '../types/medicine'

export const APP_STORAGE_KEY = 'meditrack.app-state'

export function createEmptyAppState(): AppState {
  return {
    version: 1,
    medicines: [],
  }
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AppState>
  return candidate.version === 1 && Array.isArray(candidate.medicines)
}

export function loadAppState(): AppState | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(APP_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isAppState(parsed) ? normalizeAppState(parsed) : null
  } catch {
    return null
  }
}

export function saveAppState(appState: AppState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    APP_STORAGE_KEY,
    JSON.stringify(normalizeAppState(appState)),
  )
}
