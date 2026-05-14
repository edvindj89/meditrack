import { useEffect, useMemo, useState } from 'react'
import { createSampleAppState } from '../data/sampleState'
import { normalizeAppState } from '../domain/appState'
import { loadAppState, saveAppState } from '../storage/appStorage'
import type { AppState } from '../types/medicine'

export function useAppState() {
  const [storedState, setStoredState] = useState<AppState | null>(() =>
    loadAppState(),
  )

  useEffect(() => {
    if (!storedState) {
      return
    }

    saveAppState(normalizeAppState(storedState))
  }, [storedState])

  const previewState = useMemo(
    () => normalizeAppState(createSampleAppState()),
    [],
  )
  const appState = storedState ? normalizeAppState(storedState) : previewState

  return {
    appState,
    isUsingPreviewData: storedState === null,
    setAppState: setStoredState,
  }
}
