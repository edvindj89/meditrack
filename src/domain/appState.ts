import type { AppState } from '../types/medicine'
import { normalizeMedicine, validateMedicine } from './medicine'

export function normalizeAppState(appState: AppState): AppState {
  return {
    ...appState,
    medicines: appState.medicines
      .map(normalizeMedicine)
      .filter((medicine) => validateMedicine(medicine).isValid),
  }
}
