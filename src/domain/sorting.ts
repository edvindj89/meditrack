import { getLatestDose } from './medicine'
import type { Medicine, MedicineStatus } from '../types/medicine'

export type SortDirection = 'asc' | 'desc'

export type ReadySortKey = 'name' | 'createdAt' | 'lastTaken' | 'manualOrder'
export type WaitingSortKey = 'remainingTime' | 'elapsedTime' | 'name'

export interface SortSetting<TSortKey extends string> {
  key: TSortKey
  direction: SortDirection
}

export interface MedicineSortEntry {
  medicine: Medicine
  status: MedicineStatus
}

export const DEFAULT_READY_SORT: SortSetting<ReadySortKey> = {
  key: 'name',
  direction: 'asc',
}

export const DEFAULT_WAITING_SORT: SortSetting<WaitingSortKey> = {
  key: 'remainingTime',
  direction: 'asc',
}

function parseTimestamp(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

function compareNames(left: Medicine, right: Medicine): number {
  return left.name.localeCompare(right.name, undefined, {
    sensitivity: 'base',
    numeric: true,
  })
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
  direction: SortDirection,
): number {
  if (left === null && right === null) {
    return 0
  }

  if (left === null) {
    return 1
  }

  if (right === null) {
    return -1
  }

  return direction === 'asc' ? left - right : right - left
}

function getManualOrder(medicine: Medicine): number | null {
  return Number.isFinite(medicine.manualOrder)
    ? Number(medicine.manualOrder)
    : null
}

function getLastTakenTime(medicine: Medicine): number | null {
  return parseTimestamp(getLatestDose(medicine)?.takenAt)
}

function stableSortEntries(
  entries: MedicineSortEntry[],
  compare: (left: MedicineSortEntry, right: MedicineSortEntry) => number,
): MedicineSortEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort(
      (left, right) =>
        compare(left.entry, right.entry) || left.index - right.index,
    )
    .map(({ entry }) => entry)
}

export function compareMedicinesByManualOrder(
  left: Medicine,
  right: Medicine,
): number {
  return (
    compareNullableNumbers(
      getManualOrder(left),
      getManualOrder(right),
      'asc',
    ) || compareNames(left, right)
  )
}

export function sortReadyMedicineEntries(
  entries: MedicineSortEntry[],
  sort: SortSetting<ReadySortKey>,
): MedicineSortEntry[] {
  return stableSortEntries(entries, (left, right) => {
    switch (sort.key) {
      case 'createdAt':
        return (
          compareNullableNumbers(
            parseTimestamp(left.medicine.createdAt),
            parseTimestamp(right.medicine.createdAt),
            sort.direction,
          ) || compareNames(left.medicine, right.medicine)
        )
      case 'lastTaken':
        return (
          compareNullableNumbers(
            getLastTakenTime(left.medicine),
            getLastTakenTime(right.medicine),
            sort.direction,
          ) || compareNames(left.medicine, right.medicine)
        )
      case 'manualOrder': {
        const comparison = compareMedicinesByManualOrder(
          left.medicine,
          right.medicine,
        )
        return sort.direction === 'asc' ? comparison : -comparison
      }
      case 'name':
      default: {
        const comparison = compareNames(left.medicine, right.medicine)
        return sort.direction === 'asc' ? comparison : -comparison
      }
    }
  })
}

export function sortWaitingMedicineEntries(
  entries: MedicineSortEntry[],
  sort: SortSetting<WaitingSortKey>,
): MedicineSortEntry[] {
  return stableSortEntries(entries, (left, right) => {
    switch (sort.key) {
      case 'elapsedTime':
        return (
          compareNullableNumbers(
            left.status.elapsedMs,
            right.status.elapsedMs,
            sort.direction,
          ) || compareNames(left.medicine, right.medicine)
        )
      case 'name': {
        const comparison = compareNames(left.medicine, right.medicine)
        return sort.direction === 'asc' ? comparison : -comparison
      }
      case 'remainingTime':
      default:
        return (
          compareNullableNumbers(
            left.status.remainingMs,
            right.status.remainingMs,
            sort.direction,
          ) || compareNames(left.medicine, right.medicine)
        )
    }
  })
}
