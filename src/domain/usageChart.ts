import { getSortedValidDoses } from './medicine'
import type { Medicine } from '../types/medicine'

export type UsageChartTimeframe = 'day' | 'week' | 'month'

export interface UsageChartPoint {
  id: string
  count: number
  label: string
  secondaryLabel?: string
  title: string
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfWeek(date: Date): Date {
  const start = startOfDay(date)
  const dayOffset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dayOffset)
  return start
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function formatMonthDay(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
  }).format(date)
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
  }).format(date)
}

export function getUsageChartData(
  medicine: Medicine,
  timeframe: UsageChartTimeframe,
  now = new Date(),
): UsageChartPoint[] {
  if (timeframe === 'day') {
    return getDailyUsageChartData(medicine, now)
  }

  if (timeframe === 'week') {
    return getWeeklyUsageChartData(medicine, now)
  }

  return getMonthlyUsageChartData(medicine, now)
}

function getDailyUsageChartData(
  medicine: Medicine,
  now: Date,
): UsageChartPoint[] {
  const currentStart = startOfDay(now)
  const starts = Array.from({ length: 14 }, (_, index) =>
    addDays(currentStart, index - 13),
  )
  const counts = new Map(starts.map((start) => [start.getTime(), 0]))

  for (const dose of getSortedValidDoses(medicine)) {
    const bucketStart = startOfDay(new Date(dose.takenAt)).getTime()
    if (counts.has(bucketStart)) {
      counts.set(bucketStart, (counts.get(bucketStart) ?? 0) + 1)
    }
  }

  return starts.map((start) => ({
    id: start.toISOString(),
    count: counts.get(start.getTime()) ?? 0,
    label: String(start.getDate()),
    secondaryLabel: formatWeekday(start).slice(0, 1),
    title: formatMonthDay(start),
  }))
}

function getWeeklyUsageChartData(
  medicine: Medicine,
  now: Date,
): UsageChartPoint[] {
  const currentStart = startOfWeek(now)
  const starts = Array.from({ length: 8 }, (_, index) =>
    addWeeks(currentStart, index - 7),
  )
  const counts = new Map(starts.map((start) => [start.getTime(), 0]))

  for (const dose of getSortedValidDoses(medicine)) {
    const bucketStart = startOfWeek(new Date(dose.takenAt)).getTime()
    if (counts.has(bucketStart)) {
      counts.set(bucketStart, (counts.get(bucketStart) ?? 0) + 1)
    }
  }

  return starts.map((start) => ({
    id: start.toISOString(),
    count: counts.get(start.getTime()) ?? 0,
    label: formatMonthDay(start),
    title: `${formatMonthDay(start)} week`,
  }))
}

function getMonthlyUsageChartData(
  medicine: Medicine,
  now: Date,
): UsageChartPoint[] {
  const currentStart = startOfMonth(now)
  const starts = Array.from({ length: 12 }, (_, index) =>
    addMonths(currentStart, index - 11),
  )
  const counts = new Map(starts.map((start) => [start.getTime(), 0]))

  for (const dose of getSortedValidDoses(medicine)) {
    const bucketStart = startOfMonth(new Date(dose.takenAt)).getTime()
    if (counts.has(bucketStart)) {
      counts.set(bucketStart, (counts.get(bucketStart) ?? 0) + 1)
    }
  }

  return starts.map((start) => ({
    id: start.toISOString(),
    count: counts.get(start.getTime()) ?? 0,
    label: formatMonth(start),
    title: formatMonthYear(start),
  }))
}
