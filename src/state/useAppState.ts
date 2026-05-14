import { useEffect, useMemo, useState } from 'react'
import { createSampleAppState } from '../data/sampleState'
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

    saveAppState(storedState)
  }, [storedState])

  const previewState = useMemo(() => createSampleAppState(), [])
  const appState = storedState ?? previewState

  return {
    appState,
    isUsingPreviewData: storedState === null,
    setAppState: setStoredState,
  }
}
