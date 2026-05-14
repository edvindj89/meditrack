import type { Medicine } from '../types/medicine'
import {
  formatCooldown,
  formatRelativeDuration,
  formatTakenAt,
  getElapsedSinceLatestDose,
  getLatestDose,
  getNextAllowedAt,
  getRemainingMs,
  isMedicineReady,
} from '../utils/time'

interface MedicineCardProps {
  medicine: Medicine
  now: Date
}

export function MedicineCard({ medicine, now }: MedicineCardProps) {
  const latestDose = getLatestDose(medicine)
  const nextAllowedAt = getNextAllowedAt(medicine)
  const ready = isMedicineReady(medicine, now)
  const remainingMs = getRemainingMs(medicine, now)

  return (
    <article className="medicine-card">
      <div className="medicine-card__header">
        <div>
          <p className="medicine-card__eyebrow">
            Cooldown {formatCooldown(medicine.cooldownMinutes)}
          </p>
          <h2>{medicine.name}</h2>
        </div>
        <span
          className={`medicine-card__status ${ready ? 'medicine-card__status--ready' : 'medicine-card__status--waiting'}`}
        >
          {ready ? 'Ready' : `Wait ${formatRelativeDuration(remainingMs)}`}
        </span>
      </div>

      <dl className="medicine-card__details">
        <div>
          <dt>Last taken</dt>
          <dd>
            {latestDose ? formatTakenAt(latestDose.takenAt) : 'Not taken yet'}
          </dd>
        </div>
        <div>
          <dt>Time since dose</dt>
          <dd>{getElapsedSinceLatestDose(medicine, now)}</dd>
        </div>
        <div>
          <dt>Next allowed</dt>
          <dd>
            {nextAllowedAt
              ? formatTakenAt(nextAllowedAt.toISOString())
              : 'Any time'}
          </dd>
        </div>
        <div>
          <dt>Internal dose entries</dt>
          <dd>{medicine.doses.length}</dd>
        </div>
      </dl>
    </article>
  )
}
