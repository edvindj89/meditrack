import { useEffect, useState } from 'react'
import { normalizeAppState } from '../domain/appState'
import { normalizeMedicine } from '../domain/medicine'
import {
  createEmptyAppState,
  loadAppState,
  saveAppState,
} from '../storage/appStorage'
import type { AppState, Medicine } from '../types/medicine'

function createMedicineId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `medicine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useAppState() {
  const [appState, setAppState] = useState<AppState>(
    () => loadAppState() ?? createEmptyAppState(),
  )

  useEffect(() => {
    saveAppState(normalizeAppState(appState))
  }, [appState])

  function addMedicine(input: { name: string; cooldownMinutes: number }) {
    const medicine: Medicine = normalizeMedicine({
      id: createMedicineId(),
      name: input.name,
      cooldownMinutes: input.cooldownMinutes,
      doses: [],
    })

    setAppState((current) => ({
      ...current,
      medicines: [...current.medicines, medicine],
    }))
  }

  function updateMedicine(
    medicineId: string,
    input: { name: string; cooldownMinutes: number },
  ) {
    setAppState((current) => ({
      ...current,
      medicines: current.medicines.map((medicine) =>
        medicine.id === medicineId
          ? normalizeMedicine({
              ...medicine,
              name: input.name,
              cooldownMinutes: input.cooldownMinutes,
            })
          : medicine,
      ),
    }))
  }

  function deleteMedicine(medicineId: string) {
    setAppState((current) => ({
      ...current,
      medicines: current.medicines.filter(
        (medicine) => medicine.id !== medicineId,
      ),
    }))
  }

  return {
    appState: normalizeAppState(appState),
    addMedicine,
    updateMedicine,
    deleteMedicine,
  }
}
