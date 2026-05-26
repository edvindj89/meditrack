import { describe, expect, it } from 'vitest'
import type { Medicine } from '../types/medicine'
import {
  addDoseRecord,
  canRecordNewDose,
  createBackfillTakenAt,
  createDoseRecordFromBackfill,
  createDoseRecordNow,
  getMedicineStatus,
  normalizeMedicine,
  removeDoseRecord,
  updateDoseRecord,
  updateDoseRecordFromBackfill,
} from './medicine'

function createMedicine(overrides: Partial<Medicine> = {}): Medicine {
  return {
    id: 'medicine-1',
    name: 'Test medicine',
    cooldownMinutes: 360,
    doses: [],
    activeDoseId: null,
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
    expect(status.activeDose).toBeUndefined()
    expect(status.nextAllowedAt).toBeUndefined()
    expect(status.elapsedMs).toBeNull()
    expect(status.remainingMs).toBe(0)
  })

  it('returns waiting status when cooldown has not elapsed', () => {
    const medicine = createMedicine({
      activeDoseId: 'dose-1',
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

  it('allows a new dose only when the medicine is ready', () => {
    expect(
      canRecordNewDose(createMedicine(), new Date('2026-05-14T10:00:00.000Z')),
    ).toBe(true)

    expect(
      canRecordNewDose(
        createMedicine({
          activeDoseId: 'dose-1',
          doses: [
            {
              id: 'dose-1',
              takenAt: '2026-05-14T08:00:00.000Z',
              recordedAt: '2026-05-14T08:00:00.000Z',
              source: 'now',
            },
          ],
        }),
        new Date('2026-05-14T10:00:00.000Z'),
      ),
    ).toBe(false)
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

  it('sets a new dose as the active cooldown anchor', () => {
    const medicine = createMedicine({
      activeDoseId: 'dose-1',
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
    expect(updated.activeDoseId).toBe('dose-2')
  })

  it('keeps the same active dose after editing it earlier than another dose', () => {
    const medicine = createMedicine({
      activeDoseId: 'dose-1',
      doses: [
        {
          id: 'dose-2',
          takenAt: '2026-05-14T10:00:00.000Z',
          recordedAt: '2026-05-14T10:00:00.000Z',
          source: 'backfill',
        },
        {
          id: 'dose-1',
          takenAt: '2026-05-14T11:00:00.000Z',
          recordedAt: '2026-05-14T11:00:00.000Z',
          source: 'now',
        },
      ],
    })

    const updatedDose = updateDoseRecordFromBackfill(
      medicine.doses[1],
      { hoursAgo: 2, minutesAgo: 0 },
      new Date('2026-05-14T12:00:00.000Z'),
    )
    const updatedMedicine = updateDoseRecord(medicine, 'dose-1', updatedDose)
    const status = getMedicineStatus(
      updatedMedicine,
      new Date('2026-05-14T12:05:00.000Z'),
    )

    expect(updatedMedicine.activeDoseId).toBe('dose-1')
    expect(status.activeDose?.id).toBe('dose-1')
  })

  it('falls back to the latest remaining dose when the active dose is removed', () => {
    const medicine = createMedicine({
      activeDoseId: 'dose-2',
      doses: [
        {
          id: 'dose-2',
          takenAt: '2026-05-14T11:00:00.000Z',
          recordedAt: '2026-05-14T11:00:00.000Z',
          source: 'override',
        },
        {
          id: 'dose-1',
          takenAt: '2026-05-14T10:00:00.000Z',
          recordedAt: '2026-05-14T10:00:00.000Z',
          source: 'now',
        },
      ],
    })

    const updatedMedicine = removeDoseRecord(medicine, 'dose-2')

    expect(updatedMedicine.doses.map((dose) => dose.id)).toEqual(['dose-1'])
    expect(updatedMedicine.activeDoseId).toBe('dose-1')
  })

  it('normalizes cooldown values and drops invalid dose timestamps', () => {
    const medicine = normalizeMedicine(
      createMedicine({
        cooldownMinutes: 90.8,
        activeDoseId: 'bad-dose',
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
    expect(medicine.activeDoseId).toBe('good-dose')
  })
})
