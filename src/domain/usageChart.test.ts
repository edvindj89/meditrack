import { describe, expect, it } from 'vitest'
import type { Medicine } from '../types/medicine'
import { getUsageChartData } from './usageChart'

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

describe('usage chart data', () => {
  it('groups doses by day', () => {
    const medicine = createMedicine({
      doses: [
        {
          id: 'dose-1',
          takenAt: '2026-05-14T09:00:00.000Z',
          recordedAt: '2026-05-14T09:00:00.000Z',
          source: 'now',
        },
        {
          id: 'dose-2',
          takenAt: '2026-05-14T12:00:00.000Z',
          recordedAt: '2026-05-14T12:00:00.000Z',
          source: 'override',
        },
        {
          id: 'dose-3',
          takenAt: '2026-05-13T08:00:00.000Z',
          recordedAt: '2026-05-13T08:00:00.000Z',
          source: 'backfill',
        },
      ],
    })

    const data = getUsageChartData(
      medicine,
      'day',
      new Date('2026-05-14T15:00:00.000Z'),
    )

    expect(data).toHaveLength(14)
    expect(data.at(-1)?.count).toBe(2)
    expect(data.at(-2)?.count).toBe(1)
  })

  it('groups doses by week', () => {
    const medicine = createMedicine({
      doses: [
        {
          id: 'dose-1',
          takenAt: '2026-05-14T09:00:00.000Z',
          recordedAt: '2026-05-14T09:00:00.000Z',
          source: 'now',
        },
        {
          id: 'dose-2',
          takenAt: '2026-05-12T12:00:00.000Z',
          recordedAt: '2026-05-12T12:00:00.000Z',
          source: 'override',
        },
        {
          id: 'dose-3',
          takenAt: '2026-05-05T08:00:00.000Z',
          recordedAt: '2026-05-05T08:00:00.000Z',
          source: 'backfill',
        },
      ],
    })

    const data = getUsageChartData(
      medicine,
      'week',
      new Date('2026-05-14T15:00:00.000Z'),
    )

    expect(data).toHaveLength(8)
    expect(data.at(-1)?.count).toBe(2)
    expect(data.at(-2)?.count).toBe(1)
  })

  it('groups doses by month', () => {
    const medicine = createMedicine({
      doses: [
        {
          id: 'dose-1',
          takenAt: '2026-05-14T09:00:00.000Z',
          recordedAt: '2026-05-14T09:00:00.000Z',
          source: 'now',
        },
        {
          id: 'dose-2',
          takenAt: '2026-05-12T12:00:00.000Z',
          recordedAt: '2026-05-12T12:00:00.000Z',
          source: 'override',
        },
        {
          id: 'dose-3',
          takenAt: '2026-04-05T08:00:00.000Z',
          recordedAt: '2026-04-05T08:00:00.000Z',
          source: 'backfill',
        },
      ],
    })

    const data = getUsageChartData(
      medicine,
      'month',
      new Date('2026-05-14T15:00:00.000Z'),
    )

    expect(data).toHaveLength(12)
    expect(data.at(-1)?.count).toBe(2)
    expect(data.at(-2)?.count).toBe(1)
  })
})
