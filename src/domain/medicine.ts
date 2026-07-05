import type {
  BackfillDoseInput,
  DoseRecord,
  DoseSource,
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

export function getActiveDose(medicine: Medicine): DoseRecord | undefined {
  const doses = getSortedValidDoses(medicine)

  if (!medicine.activeDoseId) {
    return doses[0]
  }

  return doses.find((dose) => dose.id === medicine.activeDoseId) ?? doses[0]
}

export function getElapsedMsSinceActiveDose(
  medicine: Medicine,
  now = new Date(),
): number | null {
  const activeDose = getActiveDose(medicine)
  if (!activeDose) {
    return null
  }

  const activeDoseTime = parseDate(activeDose.takenAt)
  if (!activeDoseTime) {
    return null
  }

  return Math.max(0, now.getTime() - activeDoseTime.getTime())
}

export function getNextAllowedAt(medicine: Medicine): Date | undefined {
  const activeDose = getActiveDose(medicine)
  if (!activeDose) {
    return undefined
  }

  const activeDoseTime = parseDate(activeDose.takenAt)
  if (!activeDoseTime) {
    return undefined
  }

  return new Date(
    activeDoseTime.getTime() + medicine.cooldownMinutes * MINUTE_IN_MS,
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
  const activeDose = getActiveDose(medicine)
  const nextAllowedAt = getNextAllowedAt(medicine)
  const elapsedMs = getElapsedMsSinceActiveDose(medicine, now)
  const remainingMs = getRemainingMs(medicine, now)

  return {
    state: remainingMs === 0 ? 'ready' : 'waiting',
    activeDose,
    nextAllowedAt,
    elapsedMs,
    remainingMs,
  }
}

export function canRecordNewDose(medicine: Medicine, now = new Date()) {
  return getMedicineStatus(medicine, now).state === 'ready'
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

export function createDoseRecordNow(
  id: string,
  now = new Date(),
  source: DoseSource = 'now',
): DoseRecord {
  const timestamp = now.toISOString()

  return {
    id,
    takenAt: timestamp,
    recordedAt: timestamp,
    source,
  }
}

export function addDoseRecord(medicine: Medicine, dose: DoseRecord): Medicine {
  return normalizeMedicine({
    ...medicine,
    activeDoseId: dose.id,
    doses: [...medicine.doses, dose],
  })
}

export function updateDoseRecord(
  medicine: Medicine,
  doseId: string,
  nextDose: DoseRecord,
): Medicine {
  return normalizeMedicine({
    ...medicine,
    doses: medicine.doses.map((dose) => (dose.id === doseId ? nextDose : dose)),
  })
}

export function removeDoseRecord(medicine: Medicine, doseId: string): Medicine {
  const remainingDoses = medicine.doses.filter((dose) => dose.id !== doseId)

  return normalizeMedicine({
    ...medicine,
    activeDoseId:
      medicine.activeDoseId === doseId ? null : medicine.activeDoseId,
    doses: remainingDoses,
  })
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
    source: dose.source === 'override' ? 'override' : 'backfill',
  }
}

export function normalizeMedicine(medicine: Medicine): Medicine {
  const cooldownMinutes = Number.isFinite(medicine.cooldownMinutes)
    ? Math.max(1, Math.floor(medicine.cooldownMinutes))
    : 1
  const doses = getSortedValidDoses(medicine)
  const hasActiveDose = doses.some((dose) => dose.id === medicine.activeDoseId)
  const createdAt =
    parseDate(medicine.createdAt ?? '')?.toISOString() ??
    new Date(0).toISOString()
  const manualOrder = Number.isFinite(medicine.manualOrder)
    ? Number(medicine.manualOrder)
    : 0

  return {
    ...medicine,
    name: medicine.name.trim(),
    cooldownMinutes,
    doses,
    activeDoseId: hasActiveDose
      ? medicine.activeDoseId
      : (doses[0]?.id ?? null),
    createdAt,
    manualOrder,
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

  if (
    medicine.activeDoseId !== null &&
    typeof medicine.activeDoseId !== 'string'
  ) {
    errors.push('Active dose id must be a string or null.')
  }

  for (const dose of medicine.doses) {
    if (!dose.id.trim()) {
      errors.push('Dose id is required.')
    }

    if (!parseDate(dose.takenAt) || !parseDate(dose.recordedAt)) {
      errors.push(`Dose ${dose.id || '(missing id)'} has an invalid timestamp.`)
    }
  }

  if (
    medicine.activeDoseId !== null &&
    !medicine.doses.some((dose) => dose.id === medicine.activeDoseId)
  ) {
    errors.push('Active dose id must point to an existing dose.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
