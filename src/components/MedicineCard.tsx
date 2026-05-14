import { getMedicineStatus } from '../domain/medicine'
import type { Medicine } from '../types/medicine'
import {
  formatCooldown,
  formatRelativeDuration,
  formatTakenAt,
} from '../utils/time'

interface MedicineCardProps {
  medicine: Medicine
  now: Date
}

export function MedicineCard({ medicine, now }: MedicineCardProps) {
  const status = getMedicineStatus(medicine, now)

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
          className={`medicine-card__status ${status.state === 'ready' ? 'medicine-card__status--ready' : 'medicine-card__status--waiting'}`}
        >
          {status.state === 'ready'
            ? 'Ready'
            : `Wait ${formatRelativeDuration(status.remainingMs)}`}
        </span>
      </div>

      <dl className="medicine-card__details">
        <div>
          <dt>Last taken</dt>
          <dd>
            {status.latestDose
              ? formatTakenAt(status.latestDose.takenAt)
              : 'Not taken yet'}
          </dd>
        </div>
        <div>
          <dt>Time since dose</dt>
          <dd>
            {status.elapsedMs === null
              ? 'Not taken yet'
              : formatRelativeDuration(status.elapsedMs)}
          </dd>
        </div>
        <div>
          <dt>Next allowed</dt>
          <dd>
            {status.nextAllowedAt
              ? formatTakenAt(status.nextAllowedAt)
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
