import { useState } from 'react'
import { normalizeAppState } from '../domain/appState'
import {
  addDoseRecord,
  createDoseRecordFromBackfill,
  createDoseRecordNow,
  getLatestDose,
  normalizeMedicine,
  removeDoseRecord,
  updateDoseRecord,
  updateDoseRecordFromBackfill,
} from '../domain/medicine'
import {
  clearAppState,
  createEmptyAppState,
  loadAppState,
  saveAppState,
  type StorageNotice,
} from '../storage/appStorage'
import type { AppState, BackfillDoseInput, Medicine } from '../types/medicine'

function createEntityId(prefix: 'medicine' | 'dose') {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useAppState() {
  const [initialLoadResult] = useState(loadAppState)
  const [appState, setAppState] = useState<AppState>(initialLoadResult.appState)
  const [storageNotice, setStorageNotice] = useState<StorageNotice | null>(
    initialLoadResult.notice,
  )
  const [storageError, setStorageError] = useState<string | null>(null)

  const normalizedAppState = normalizeAppState(appState)

  function commitAppState(nextState: AppState) {
    const normalizedNextState = normalizeAppState(nextState)
    setAppState(normalizedNextState)

    const result = saveAppState(normalizedNextState)
    setStorageError(result.ok ? null : result.message)
  }

  function addMedicine(input: { name: string; cooldownMinutes: number }) {
    const medicine: Medicine = normalizeMedicine({
      id: createEntityId('medicine'),
      name: input.name,
      cooldownMinutes: input.cooldownMinutes,
      doses: [],
    })

    commitAppState({
      ...normalizedAppState,
      medicines: [...normalizedAppState.medicines, medicine],
    })
  }

  function updateMedicine(
    medicineId: string,
    input: { name: string; cooldownMinutes: number },
  ) {
    commitAppState({
      ...normalizedAppState,
      medicines: normalizedAppState.medicines.map((medicine) =>
        medicine.id === medicineId
          ? normalizeMedicine({
              ...medicine,
              name: input.name,
              cooldownMinutes: input.cooldownMinutes,
            })
          : medicine,
      ),
    })
  }

  function deleteMedicine(medicineId: string) {
    commitAppState({
      ...normalizedAppState,
      medicines: normalizedAppState.medicines.filter(
        (medicine) => medicine.id !== medicineId,
      ),
    })
  }

  function recordDoseNow(medicineId: string) {
    commitAppState({
      ...normalizedAppState,
      medicines: normalizedAppState.medicines.map((medicine) =>
        medicine.id === medicineId
          ? addDoseRecord(medicine, createDoseRecordNow(createEntityId('dose')))
          : medicine,
      ),
    })
  }

  function recordBackfilledDose(medicineId: string, input: BackfillDoseInput) {
    commitAppState({
      ...normalizedAppState,
      medicines: normalizedAppState.medicines.map((medicine) =>
        medicine.id === medicineId
          ? addDoseRecord(
              medicine,
              createDoseRecordFromBackfill(input, {
                id: createEntityId('dose'),
              }),
            )
          : medicine,
      ),
    })
  }

  function updateLatestDoseTime(medicineId: string, input: BackfillDoseInput) {
    commitAppState({
      ...normalizedAppState,
      medicines: normalizedAppState.medicines.map((medicine) => {
        if (medicine.id !== medicineId) {
          return medicine
        }

        const latestDose = getLatestDose(medicine)
        if (!latestDose) {
          return medicine
        }

        return updateDoseRecord(
          medicine,
          latestDose.id,
          updateDoseRecordFromBackfill(latestDose, input),
        )
      }),
    })
  }

  function removeLatestDose(medicineId: string) {
    commitAppState({
      ...normalizedAppState,
      medicines: normalizedAppState.medicines.map((medicine) => {
        if (medicine.id !== medicineId) {
          return medicine
        }

        const latestDose = getLatestDose(medicine)
        return latestDose ? removeDoseRecord(medicine, latestDose.id) : medicine
      }),
    })
  }

  function resetAllData() {
    const result = clearAppState()
    setAppState(createEmptyAppState())
    setStorageNotice(
      result.ok
        ? {
            kind: 'info',
            message: 'Saved data was cleared on this device.',
          }
        : {
            kind: 'warning',
            message:
              result.message ??
              'Saved data could not be cleared on this device.',
          },
    )
    setStorageError(result.ok ? null : result.message)
  }

  return {
    appState: normalizedAppState,
    storageMessage: storageError ?? storageNotice?.message ?? null,
    dismissStorageMessage: () => {
      setStorageNotice(null)
      setStorageError(null)
    },
    addMedicine,
    updateMedicine,
    deleteMedicine,
    recordDoseNow,
    recordBackfilledDose,
    updateLatestDoseTime,
    removeLatestDose,
    resetAllData,
  }
}
