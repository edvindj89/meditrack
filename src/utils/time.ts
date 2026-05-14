const MINUTE_IN_MS = 60 * 1000
const HOUR_IN_MS = 60 * MINUTE_IN_MS

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

export function formatTakenAt(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
