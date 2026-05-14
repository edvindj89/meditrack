import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppState } from '../types/medicine'
import {
  APP_STORAGE_KEY,
  APP_STORAGE_RECOVERY_KEY,
  clearAppState,
  createEmptyAppState,
  loadAppState,
  readRecoverySnapshot,
  saveAppState,
} from './appStorage'

interface StorageMock {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function createStorageMock(): StorageMock {
  const storage = new Map<string, string>()

  return {
    getItem(key) {
      return storage.has(key) ? (storage.get(key) ?? null) : null
    },
    setItem(key, value) {
      storage.set(key, value)
    },
    removeItem(key) {
      storage.delete(key)
    },
  }
}

function stubWindow(localStorage: StorageMock) {
  vi.stubGlobal('window', { localStorage })
}

describe('appStorage', () => {
  beforeEach(() => {
    stubWindow(createStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves and loads normalized app state', () => {
    const appState: AppState = {
      version: 1,
      medicines: [
        {
          id: 'medicine-1',
          name: '  Ibuprofen  ',
          cooldownMinutes: 90.9,
          doses: [],
        },
      ],
    }

    expect(saveAppState(appState).ok).toBe(true)

    const result = loadAppState()

    expect(result.notice).toBeNull()
    expect(result.appState.medicines).toEqual([
      {
        id: 'medicine-1',
        name: 'Ibuprofen',
        cooldownMinutes: 90,
        doses: [],
      },
    ])
  })

  it('recovers from invalid json in local storage', () => {
    window.localStorage.setItem(APP_STORAGE_KEY, '{broken-json')

    const result = loadAppState()

    expect(result.appState).toEqual(createEmptyAppState())
    expect(result.notice?.message).toContain('invalid')
    expect(window.localStorage.getItem(APP_STORAGE_KEY)).toBeNull()
    expect(readRecoverySnapshot()).toEqual({
      recoveredAt: expect.any(String),
      reason: 'invalid-json',
      raw: '{broken-json',
    })
  })

  it('recovers from invalid app-state shape in local storage', () => {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({ version: 1 }))

    const result = loadAppState()

    expect(result.appState).toEqual(createEmptyAppState())
    expect(result.notice?.message).toContain('invalid')
    expect(readRecoverySnapshot()).toEqual({
      recoveredAt: expect.any(String),
      reason: 'invalid-shape',
      raw: JSON.stringify({ version: 1 }),
    })
  })

  it('clears saved app state without removing recovery data', () => {
    window.localStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify(createEmptyAppState()),
    )
    window.localStorage.setItem(
      APP_STORAGE_RECOVERY_KEY,
      JSON.stringify({
        recoveredAt: '2026-05-14T10:00:00.000Z',
        reason: 'invalid-json',
        raw: '{bad',
      }),
    )

    expect(clearAppState().ok).toBe(true)
    expect(window.localStorage.getItem(APP_STORAGE_KEY)).toBeNull()
    expect(readRecoverySnapshot()?.reason).toBe('invalid-json')
  })
})
