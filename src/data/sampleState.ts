import type { AppState } from '../types/medicine'

function isoMinutesAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
}

export function createSampleAppState(): AppState {
  return {
    version: 1,
    medicines: [
      {
        id: 'ibuprofen',
        name: 'Ibuprofen',
        cooldownMinutes: 6 * 60,
        doses: [
          {
            id: 'ibuprofen-dose-1',
            takenAt: isoMinutesAgo(185),
            recordedAt: isoMinutesAgo(185),
            source: 'backfill',
          },
        ],
      },
      {
        id: 'allergy-medicine',
        name: 'Allergy medicine',
        cooldownMinutes: 4 * 60,
        doses: [
          {
            id: 'allergy-dose-1',
            takenAt: isoMinutesAgo(315),
            recordedAt: isoMinutesAgo(315),
            source: 'now',
          },
        ],
      },
      {
        id: 'pain-gel',
        name: 'Pain gel',
        cooldownMinutes: 8 * 60,
        doses: [
          {
            id: 'pain-gel-dose-1',
            takenAt: isoMinutesAgo(40),
            recordedAt: isoMinutesAgo(5),
            source: 'backfill',
          },
        ],
      },
      {
        id: 'cough-drops',
        name: 'Cough drops',
        cooldownMinutes: 2 * 60,
        doses: [],
      },
    ],
  }
}
