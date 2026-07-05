export type DoseSource = 'now' | 'backfill' | 'override'
export type MedicineAvailability = 'ready' | 'waiting'

export interface DoseRecord {
  id: string
  takenAt: string
  recordedAt: string
  source: DoseSource
}

export interface BackfillDoseInput {
  hoursAgo: number
  minutesAgo: number
}

export interface Medicine {
  id: string
  name: string
  cooldownMinutes: number
  doses: DoseRecord[]
  activeDoseId: string | null
  createdAt?: string
  manualOrder?: number
}

export interface MedicineStatus {
  state: MedicineAvailability
  activeDose?: DoseRecord
  nextAllowedAt?: Date
  elapsedMs: number | null
  remainingMs: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface AppState {
  version: 1
  medicines: Medicine[]
}
