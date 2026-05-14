import type {
  BackfillDoseInput,
  DoseRecord,
  Medicine,
  MedicineStatus,
  ValidationResult,
} from '../types/medicine'

export const MINUTE_IN_MS = 60 * 1000
export const HOUR_IN_MS = 60 * MINUTE_IN_MS

function parseDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0
}

export function compareDoseRecordsByTakenAt(
  left: DoseRecord,
  right: DoseRecord,
): number {
  const leftTime =
    parseDate(left.takenAt)?.getTime() ?? Number.NEGATIVE_INFINITY
  const rightTime =
    parseDate(right.takenAt)?.getTime() ?? Number.NEGATIVE_INFINITY

  return rightTime - leftTime
}

export function getSortedValidDoses(medicine: Medicine): DoseRecord[] {
  return medicine.doses
    .filter((dose) => parseDate(dose.takenAt) && parseDate(dose.recordedAt))
    .sort(compareDoseRecordsByTakenAt)
}

export function getLatestDose(medicine: Medicine): DoseRecord | undefined {
  return getSortedValidDoses(medicine)[0]
}

export function getElapsedMsSinceLatestDose(
  medicine: Medicine,
  now = new Date(),
): number | null {
  const latestDose = getLatestDose(medicine)
  if (!latestDose) {
    return null
  }

  const latestDoseTime = parseDate(latestDose.takenAt)
  if (!latestDoseTime) {
    return null
  }

  return Math.max(0, now.getTime() - latestDoseTime.getTime())
}

export function getNextAllowedAt(medicine: Medicine): Date | undefined {
  const latestDose = getLatestDose(medicine)
  if (!latestDose) {
    return undefined
  }

  const latestDoseTime = parseDate(latestDose.takenAt)
  if (!latestDoseTime) {
    return undefined
  }

  return new Date(
    latestDoseTime.getTime() + medicine.cooldownMinutes * MINUTE_IN_MS,
  )
}

export function getRemainingMs(medicine: Medicine, now = new Date()): number {
  const nextAllowedAt = getNextAllowedAt(medicine)
  if (!nextAllowedAt) {
    return 0
  }

  return Math.max(0, nextAllowedAt.getTime() - now.getTime())
}

export function getMedicineStatus(
  medicine: Medicine,
  now = new Date(),
): MedicineStatus {
  const latestDose = getLatestDose(medicine)
  const nextAllowedAt = getNextAllowedAt(medicine)
  const elapsedMs = getElapsedMsSinceLatestDose(medicine, now)
  const remainingMs = getRemainingMs(medicine, now)

  return {
    state: remainingMs === 0 ? 'ready' : 'waiting',
    latestDose,
    nextAllowedAt,
    elapsedMs,
    remainingMs,
  }
}

export function createBackfillTakenAt(
  input: BackfillDoseInput,
  recordedAt = new Date(),
): Date {
  const { hoursAgo, minutesAgo } = input

  if (!isNonNegativeInteger(hoursAgo) || !isNonNegativeInteger(minutesAgo)) {
    throw new Error('Back-registration values must be non-negative integers.')
  }

  const totalMinutesAgo = hoursAgo * 60 + minutesAgo
  const takenAt = new Date(
    recordedAt.getTime() - totalMinutesAgo * MINUTE_IN_MS,
  )

  if (Number.isNaN(takenAt.getTime())) {
    throw new Error('Back-registered dose is out of the supported date range.')
  }

  return takenAt
}

export function createDoseRecordFromBackfill(
  input: BackfillDoseInput,
  options: {
    id: string
    recordedAt?: Date
  },
): DoseRecord {
  const recordedAt = options.recordedAt ?? new Date()
  const takenAt = createBackfillTakenAt(input, recordedAt)

  if (takenAt.getTime() > recordedAt.getTime()) {
    throw new Error('Back-registered dose cannot be in the future.')
  }

  return {
    id: options.id,
    takenAt: takenAt.toISOString(),
    recordedAt: recordedAt.toISOString(),
    source: 'backfill',
  }
}

export function createDoseRecordNow(id: string, now = new Date()): DoseRecord {
  const timestamp = now.toISOString()

  return {
    id,
    takenAt: timestamp,
    recordedAt: timestamp,
    source: 'now',
  }
}

export function addDoseRecord(medicine: Medicine, dose: DoseRecord): Medicine {
  return {
    ...medicine,
    doses: [...medicine.doses, dose].sort(compareDoseRecordsByTakenAt),
  }
}

export function updateDoseRecord(
  medicine: Medicine,
  doseId: string,
  nextDose: DoseRecord,
): Medicine {
  return {
    ...medicine,
    doses: medicine.doses
      .map((dose) => (dose.id === doseId ? nextDose : dose))
      .sort(compareDoseRecordsByTakenAt),
  }
}

export function removeDoseRecord(medicine: Medicine, doseId: string): Medicine {
  return {
    ...medicine,
    doses: medicine.doses.filter((dose) => dose.id !== doseId),
  }
}

export function updateDoseRecordFromBackfill(
  dose: DoseRecord,
  input: BackfillDoseInput,
  recordedAt = new Date(),
): DoseRecord {
  const takenAt = createBackfillTakenAt(input, recordedAt)

  return {
    ...dose,
    takenAt: takenAt.toISOString(),
    recordedAt: recordedAt.toISOString(),
    source: 'backfill',
  }
}

export function normalizeMedicine(medicine: Medicine): Medicine {
  const cooldownMinutes = Number.isFinite(medicine.cooldownMinutes)
    ? Math.max(1, Math.floor(medicine.cooldownMinutes))
    : 1

  return {
    ...medicine,
    name: medicine.name.trim(),
    cooldownMinutes,
    doses: getSortedValidDoses(medicine),
  }
}

export function validateMedicine(medicine: Medicine): ValidationResult {
  const errors: string[] = []

  if (!medicine.id.trim()) {
    errors.push('Medicine id is required.')
  }

  if (!medicine.name.trim()) {
    errors.push('Medicine name is required.')
  }

  if (
    !Number.isFinite(medicine.cooldownMinutes) ||
    medicine.cooldownMinutes < 1
  ) {
    errors.push('Cooldown must be at least 1 minute.')
  }

  for (const dose of medicine.doses) {
    if (!dose.id.trim()) {
      errors.push('Dose id is required.')
    }

    if (!parseDate(dose.takenAt) || !parseDate(dose.recordedAt)) {
      errors.push(`Dose ${dose.id || '(missing id)'} has an invalid timestamp.`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
