import { describe, expect, it } from 'vitest'
import type { Medicine } from '../types/medicine'
import { getMedicineStatus } from './medicine'
import {
  sortReadyMedicineEntries,
  sortWaitingMedicineEntries,
  type MedicineSortEntry,
} from './sorting'

function createMedicine(overrides: Partial<Medicine>): Medicine {
  return {
    id: overrides.id ?? 'medicine-1',
    name: overrides.name ?? 'Medicine',
    cooldownMinutes: overrides.cooldownMinutes ?? 60,
    doses: overrides.doses ?? [],
    activeDoseId: overrides.activeDoseId ?? null,
    createdAt: overrides.createdAt ?? '2026-05-14T10:00:00.000Z',
    manualOrder: overrides.manualOrder ?? 0,
  }
}

function createEntry(medicine: Medicine, now: Date): MedicineSortEntry {
  return {
    medicine,
    status: getMedicineStatus(medicine, now),
  }
}

describe('medicine sorting', () => {
  it('sorts ready medicines by manual order and can reverse it', () => {
    const now = new Date('2026-05-14T12:00:00.000Z')
    const entries = [
      createEntry(
        createMedicine({ id: 'b', name: 'Beta', manualOrder: 2 }),
        now,
      ),
      createEntry(
        createMedicine({ id: 'a', name: 'Alpha', manualOrder: 1 }),
        now,
      ),
    ]

    expect(
      sortReadyMedicineEntries(entries, {
        key: 'manualOrder',
        direction: 'asc',
      }).map(({ medicine }) => medicine.id),
    ).toEqual(['a', 'b'])

    expect(
      sortReadyMedicineEntries(entries, {
        key: 'manualOrder',
        direction: 'desc',
      }).map(({ medicine }) => medicine.id),
    ).toEqual(['b', 'a'])
  })

  it('sorts ready medicines by last taken with untaken medicines last', () => {
    const now = new Date('2026-05-14T12:00:00.000Z')
    const entries = [
      createEntry(createMedicine({ id: 'none', name: 'None' }), now),
      createEntry(
        createMedicine({
          id: 'old',
          name: 'Old',
          activeDoseId: 'dose-old',
          doses: [
            {
              id: 'dose-old',
              takenAt: '2026-05-14T08:00:00.000Z',
              recordedAt: '2026-05-14T08:00:00.000Z',
              source: 'now',
            },
          ],
        }),
        now,
      ),
      createEntry(
        createMedicine({
          id: 'recent',
          name: 'Recent',
          activeDoseId: 'dose-recent',
          doses: [
            {
              id: 'dose-recent',
              takenAt: '2026-05-14T10:00:00.000Z',
              recordedAt: '2026-05-14T10:00:00.000Z',
              source: 'now',
            },
          ],
        }),
        now,
      ),
    ]

    expect(
      sortReadyMedicineEntries(entries, {
        key: 'lastTaken',
        direction: 'desc',
      }).map(({ medicine }) => medicine.id),
    ).toEqual(['recent', 'old', 'none'])
  })

  it('sorts cooling medicines by time remaining and can reverse it', () => {
    const now = new Date('2026-05-14T12:00:00.000Z')
    const entries = [
      createEntry(
        createMedicine({
          id: 'later',
          name: 'Later',
          cooldownMinutes: 240,
          activeDoseId: 'dose-later',
          doses: [
            {
              id: 'dose-later',
              takenAt: '2026-05-14T10:00:00.000Z',
              recordedAt: '2026-05-14T10:00:00.000Z',
              source: 'now',
            },
          ],
        }),
        now,
      ),
      createEntry(
        createMedicine({
          id: 'soon',
          name: 'Soon',
          cooldownMinutes: 180,
          activeDoseId: 'dose-soon',
          doses: [
            {
              id: 'dose-soon',
              takenAt: '2026-05-14T10:00:00.000Z',
              recordedAt: '2026-05-14T10:00:00.000Z',
              source: 'now',
            },
          ],
        }),
        now,
      ),
    ]

    expect(
      sortWaitingMedicineEntries(entries, {
        key: 'remainingTime',
        direction: 'asc',
      }).map(({ medicine }) => medicine.id),
    ).toEqual(['soon', 'later'])

    expect(
      sortWaitingMedicineEntries(entries, {
        key: 'remainingTime',
        direction: 'desc',
      }).map(({ medicine }) => medicine.id),
    ).toEqual(['later', 'soon'])
  })
})
