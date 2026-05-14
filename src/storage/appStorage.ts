import { normalizeAppState } from '../domain/appState'
import type { AppState } from '../types/medicine'

export const APP_STORAGE_KEY = 'meditrack.app-state'
export const APP_STORAGE_RECOVERY_KEY = 'meditrack.app-state.recovery'

export type RecoveryReason = 'invalid-json' | 'invalid-shape'

export interface RecoverySnapshot {
  recoveredAt: string
  reason: RecoveryReason
  raw: string
}

export interface StorageNotice {
  kind: 'info' | 'warning'
  message: string
}

export interface LoadAppStateResult {
  appState: AppState
  notice: StorageNotice | null
}

export interface SaveAppStateResult {
  ok: boolean
  message: string | null
}

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

function getStorageNotice(message: string): StorageNotice {
  return {
    kind: 'warning',
    message,
  }
}

function recoverCorruptedState(
  raw: string,
  reason: RecoveryReason,
): StorageNotice {
  const snapshot: RecoverySnapshot = {
    recoveredAt: new Date().toISOString(),
    reason,
    raw,
  }

  try {
    window.localStorage.setItem(
      APP_STORAGE_RECOVERY_KEY,
      JSON.stringify(snapshot),
    )
    window.localStorage.removeItem(APP_STORAGE_KEY)
  } catch {
    return getStorageNotice(
      'Saved data was invalid and could not be fully recovered on this device.',
    )
  }

  return getStorageNotice(
    'Saved data was invalid, so Meditrack started from an empty state.',
  )
}

export function loadAppState(): LoadAppStateResult {
  if (typeof window === 'undefined') {
    return {
      appState: createEmptyAppState(),
      notice: null,
    }
  }

  let raw: string | null

  try {
    raw = window.localStorage.getItem(APP_STORAGE_KEY)
  } catch {
    return {
      appState: createEmptyAppState(),
      notice: getStorageNotice(
        'Saved data could not be accessed on this device.',
      ),
    }
  }

  if (!raw) {
    return {
      appState: createEmptyAppState(),
      notice: null,
    }
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isAppState(parsed)) {
      return {
        appState: createEmptyAppState(),
        notice: recoverCorruptedState(raw, 'invalid-shape'),
      }
    }

    return {
      appState: normalizeAppState(parsed),
      notice: null,
    }
  } catch {
    return {
      appState: createEmptyAppState(),
      notice: recoverCorruptedState(raw, 'invalid-json'),
    }
  }
}

export function saveAppState(appState: AppState): SaveAppStateResult {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      message: 'Saved data is unavailable outside the browser.',
    }
  }

  try {
    window.localStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify(normalizeAppState(appState)),
    )

    return {
      ok: true,
      message: null,
    }
  } catch {
    return {
      ok: false,
      message: 'Changes could not be saved on this device.',
    }
  }
}

export function clearAppState(): SaveAppStateResult {
  if (typeof window === 'undefined') {
    return {
      ok: false,
      message: 'Saved data is unavailable outside the browser.',
    }
  }

  try {
    window.localStorage.removeItem(APP_STORAGE_KEY)
    return {
      ok: true,
      message: null,
    }
  } catch {
    return {
      ok: false,
      message: 'Saved data could not be cleared on this device.',
    }
  }
}

export function readRecoverySnapshot(): RecoverySnapshot | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(APP_STORAGE_RECOVERY_KEY)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const snapshot = parsed as Partial<RecoverySnapshot>
    if (
      typeof snapshot.recoveredAt !== 'string' ||
      typeof snapshot.reason !== 'string' ||
      typeof snapshot.raw !== 'string'
    ) {
      return null
    }

    return {
      recoveredAt: snapshot.recoveredAt,
      reason:
        snapshot.reason === 'invalid-json' ? 'invalid-json' : 'invalid-shape',
      raw: snapshot.raw,
    }
  } catch {
    return null
  }
}
