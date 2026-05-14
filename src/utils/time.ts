import type { DoseRecord, Medicine } from '../types/medicine'

const MINUTE_IN_MS = 60 * 1000
const HOUR_IN_MS = 60 * MINUTE_IN_MS

export function getLatestDose(medicine: Medicine): DoseRecord | undefined {
  return medicine.doses.reduce<DoseRecord | undefined>((latest, dose) => {
    if (!latest) {
      return dose
    }

    return new Date(dose.takenAt).getTime() > new Date(latest.takenAt).getTime()
      ? dose
      : latest
  }, undefined)
}

export function getNextAllowedAt(medicine: Medicine): Date | undefined {
  const latestDose = getLatestDose(medicine)
  if (!latestDose) {
    return undefined
  }

  return new Date(
    new Date(latestDose.takenAt).getTime() +
      medicine.cooldownMinutes * MINUTE_IN_MS,
  )
}

export function getRemainingMs(medicine: Medicine, now = new Date()): number {
  const nextAllowedAt = getNextAllowedAt(medicine)
  if (!nextAllowedAt) {
    return 0
  }

  return Math.max(0, nextAllowedAt.getTime() - now.getTime())
}

export function isMedicineReady(medicine: Medicine, now = new Date()): boolean {
  return getRemainingMs(medicine, now) === 0
}

export function formatCooldown(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} min`
  }

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

export function formatRelativeDuration(ms: number): string {
  if (ms <= 0) {
    return '0 min'
  }

  const hours = Math.floor(ms / HOUR_IN_MS)
  const minutes = Math.floor((ms % HOUR_IN_MS) / MINUTE_IN_MS)

  if (hours === 0) {
    return `${minutes} min`
  }

  if (minutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${minutes} min`
}

export function formatTakenAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function getElapsedSinceLatestDose(
  medicine: Medicine,
  now = new Date(),
): string {
  const latestDose = getLatestDose(medicine)
  if (!latestDose) {
    return 'Not taken yet'
  }

  const elapsedMs = Math.max(
    0,
    now.getTime() - new Date(latestDose.takenAt).getTime(),
  )
  return formatRelativeDuration(elapsedMs)
}
