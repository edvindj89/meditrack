export type DoseSource = 'now' | 'backfill'

export interface DoseRecord {
  id: string
  takenAt: string
  recordedAt: string
  source: DoseSource
}

export interface Medicine {
  id: string
  name: string
  cooldownMinutes: number
  doses: DoseRecord[]
}

export interface AppState {
  version: 1
  medicines: Medicine[]
}
