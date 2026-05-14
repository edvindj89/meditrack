import { describe, expect, it } from 'vitest'
import type { Medicine } from '../types/medicine'
import {
  addDoseRecord,
  createBackfillTakenAt,
  createDoseRecordFromBackfill,
  createDoseRecordNow,
  getMedicineStatus,
  normalizeMedicine,
} from './medicine'

function createMedicine(overrides: Partial<Medicine> = {}): Medicine {
  return {
    id: 'medicine-1',
    name: 'Test medicine',
    cooldownMinutes: 360,
    doses: [],
    ...overrides,
  }
}

describe('medicine domain logic', () => {
  it('returns ready status when there is no previous dose', () => {
    const medicine = createMedicine()
    const status = getMedicineStatus(
      medicine,
      new Date('2026-05-14T10:00:00.000Z'),
    )

    expect(status.state).toBe('ready')
    expect(status.latestDose).toBeUndefined()
    expect(status.nextAllowedAt).toBeUndefined()
    expect(status.elapsedMs).toBeNull()
    expect(status.remainingMs).toBe(0)
  })

  it('returns waiting status when cooldown has not elapsed', () => {
    const medicine = createMedicine({
      doses: [
        {
          id: 'dose-1',
          takenAt: '2026-05-14T08:00:00.000Z',
          recordedAt: '2026-05-14T08:00:00.000Z',
          source: 'now',
        },
      ],
    })

    const status = getMedicineStatus(
      medicine,
      new Date('2026-05-14T10:00:00.000Z'),
    )

    expect(status.state).toBe('waiting')
    expect(status.remainingMs).toBe(4 * 60 * 60 * 1000)
    expect(status.nextAllowedAt?.toISOString()).toBe('2026-05-14T14:00:00.000Z')
  })

  it('creates a backfilled dose timestamp from hours and minutes ago', () => {
    const takenAt = createBackfillTakenAt(
      { hoursAgo: 1, minutesAgo: 10 },
      new Date('2026-05-14T10:00:00.000Z'),
    )

    expect(takenAt.toISOString()).toBe('2026-05-14T08:50:00.000Z')
  })

  it('rejects negative backfill values', () => {
    expect(() =>
      createBackfillTakenAt({ hoursAgo: -1, minutesAgo: 0 }),
    ).toThrow('Back-registration values must be non-negative integers.')
  })

  it('creates a now dose with matching timestamps', () => {
    const now = new Date('2026-05-14T10:00:00.000Z')
    const dose = createDoseRecordNow('dose-now', now)

    expect(dose).toEqual({
      id: 'dose-now',
      takenAt: '2026-05-14T10:00:00.000Z',
      recordedAt: '2026-05-14T10:00:00.000Z',
      source: 'now',
    })
  })

  it('keeps doses sorted newest first when adding a dose', () => {
    const medicine = createMedicine({
      doses: [
        {
          id: 'dose-1',
          takenAt: '2026-05-14T08:00:00.000Z',
          recordedAt: '2026-05-14T08:00:00.000Z',
          source: 'now',
        },
      ],
    })

    const updated = addDoseRecord(
      medicine,
      createDoseRecordFromBackfill(
        { hoursAgo: 0, minutesAgo: 30 },
        {
          id: 'dose-2',
          recordedAt: new Date('2026-05-14T10:00:00.000Z'),
        },
      ),
    )

    expect(updated.doses.map((dose) => dose.id)).toEqual(['dose-2', 'dose-1'])
  })

  it('normalizes cooldown values and drops invalid dose timestamps', () => {
    const medicine = normalizeMedicine(
      createMedicine({
        cooldownMinutes: 90.8,
        doses: [
          {
            id: 'bad-dose',
            takenAt: 'not-a-date',
            recordedAt: '2026-05-14T08:00:00.000Z',
            source: 'now',
          },
          {
            id: 'good-dose',
            takenAt: '2026-05-14T07:00:00.000Z',
            recordedAt: '2026-05-14T07:00:00.000Z',
            source: 'now',
          },
        ],
      }),
    )

    expect(medicine.cooldownMinutes).toBe(90)
    expect(medicine.doses.map((dose) => dose.id)).toEqual(['good-dose'])
  })
})
