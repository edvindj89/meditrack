import { useState } from 'react'
import {
  DEFAULT_READY_SORT,
  DEFAULT_WAITING_SORT,
  type ReadySortKey,
  type SortDirection,
  type SortSetting,
  type WaitingSortKey,
} from '../domain/sorting'

const SORT_STORAGE_KEY = 'meditrack.sort-preferences'

interface SortPreferences {
  ready: SortSetting<ReadySortKey>
  waiting: SortSetting<WaitingSortKey>
}

const READY_SORT_KEYS: ReadySortKey[] = [
  'name',
  'createdAt',
  'lastTaken',
  'manualOrder',
]
const WAITING_SORT_KEYS: WaitingSortKey[] = [
  'remainingTime',
  'elapsedTime',
  'name',
]

function isSortDirection(value: unknown): value is SortDirection {
  return value === 'asc' || value === 'desc'
}

function isReadySortKey(value: unknown): value is ReadySortKey {
  return (
    typeof value === 'string' && READY_SORT_KEYS.includes(value as ReadySortKey)
  )
}

function isWaitingSortKey(value: unknown): value is WaitingSortKey {
  return (
    typeof value === 'string' &&
    WAITING_SORT_KEYS.includes(value as WaitingSortKey)
  )
}

function normalizeSortPreferences(value: unknown): SortPreferences {
  if (!value || typeof value !== 'object') {
    return {
      ready: DEFAULT_READY_SORT,
      waiting: DEFAULT_WAITING_SORT,
    }
  }

  const candidate = value as Partial<{
    ready: Partial<SortSetting<ReadySortKey>>
    waiting: Partial<SortSetting<WaitingSortKey>>
  }>

  return {
    ready: {
      key: isReadySortKey(candidate.ready?.key)
        ? candidate.ready.key
        : DEFAULT_READY_SORT.key,
      direction: isSortDirection(candidate.ready?.direction)
        ? candidate.ready.direction
        : DEFAULT_READY_SORT.direction,
    },
    waiting: {
      key: isWaitingSortKey(candidate.waiting?.key)
        ? candidate.waiting.key
        : DEFAULT_WAITING_SORT.key,
      direction: isSortDirection(candidate.waiting?.direction)
        ? candidate.waiting.direction
        : DEFAULT_WAITING_SORT.direction,
    },
  }
}

function loadSortPreferences(): SortPreferences {
  if (typeof window === 'undefined') {
    return {
      ready: DEFAULT_READY_SORT,
      waiting: DEFAULT_WAITING_SORT,
    }
  }

  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY)
    return raw
      ? normalizeSortPreferences(JSON.parse(raw))
      : normalizeSortPreferences(null)
  } catch {
    return normalizeSortPreferences(null)
  }
}

function saveSortPreferences(preferences: SortPreferences) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Sorting preferences are non-critical; keep the in-memory selection.
  }
}

export function useSortPreferences() {
  const [preferences, setPreferences] = useState(loadSortPreferences)

  function commitPreferences(
    updater: (current: SortPreferences) => SortPreferences,
  ) {
    setPreferences((current) => {
      const nextPreferences = updater(current)
      saveSortPreferences(nextPreferences)
      return nextPreferences
    })
  }

  return {
    readySort: preferences.ready,
    waitingSort: preferences.waiting,
    setReadySort: (ready: SortSetting<ReadySortKey>) =>
      commitPreferences((current) => ({ ...current, ready })),
    setWaitingSort: (waiting: SortSetting<WaitingSortKey>) =>
      commitPreferences((current) => ({ ...current, waiting })),
  }
}
