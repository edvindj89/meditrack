import type { AppState } from '../types/medicine'
import { normalizeMedicine, validateMedicine } from './medicine'

export function normalizeAppState(appState: AppState): AppState {
  return {
    ...appState,
    medicines: appState.medicines
      .map((medicine, index) =>
        normalizeMedicine({
          ...medicine,
          manualOrder: Number.isFinite(medicine.manualOrder)
            ? medicine.manualOrder
            : index,
        }),
      )
      .filter((medicine) => validateMedicine(medicine).isValid),
  }
}
