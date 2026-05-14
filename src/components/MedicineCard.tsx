import { useState } from 'react'
import { MINUTE_IN_MS, getMedicineStatus } from '../domain/medicine'
import type { BackfillDoseInput, Medicine } from '../types/medicine'
import {
  formatCooldown,
  formatDoseSource,
  formatRelativeDuration,
  formatTakenAt,
} from '../utils/time'

interface MedicineCardProps {
  medicine: Medicine
  now: Date
  onEdit: (medicine: Medicine) => void
  onDelete: (medicine: Medicine) => void
  onTakeNow: (medicine: Medicine) => void
  onBackfill: (medicine: Medicine, input: BackfillDoseInput) => void
}

export function MedicineCard({
  medicine,
  now,
  onEdit,
  onDelete,
  onTakeNow,
  onBackfill,
}: MedicineCardProps) {
  const [isBackfillOpen, setIsBackfillOpen] = useState(false)
  const [hoursAgo, setHoursAgo] = useState('1')
  const [minutesAgo, setMinutesAgo] = useState('0')
  const [backfillError, setBackfillError] = useState<string | null>(null)
  const status = getMedicineStatus(medicine, now)
  const progress =
    status.elapsedMs === null
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            (status.elapsedMs / (medicine.cooldownMinutes * MINUTE_IN_MS)) *
              100,
          ),
        )

  function resetBackfill() {
    setHoursAgo('1')
    setMinutesAgo('0')
    setBackfillError(null)
    setIsBackfillOpen(false)
  }

  function handleBackfillSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedHours = Number(hoursAgo)
    const parsedMinutes = Number(minutesAgo)

    if (
      !Number.isInteger(parsedHours) ||
      !Number.isInteger(parsedMinutes) ||
      parsedHours < 0 ||
      parsedMinutes < 0 ||
      parsedMinutes > 59
    ) {
      setBackfillError('Enter hours and 0–59 minutes ago.')
      return
    }

    if (parsedHours === 0 && parsedMinutes === 0) {
      setBackfillError('Use Take now for a dose taken just now.')
      return
    }

    try {
      onBackfill(medicine, {
        hoursAgo: parsedHours,
        minutesAgo: parsedMinutes,
      })
      resetBackfill()
    } catch (error) {
      setBackfillError(
        error instanceof Error ? error.message : 'Could not save dose.',
      )
    }
  }

  return (
    <article className="medicine-card">
      <div className="medicine-card__header">
        <div>
          <p className="medicine-card__eyebrow">
            Cooldown {formatCooldown(medicine.cooldownMinutes)}
          </p>
          <h2>{medicine.name}</h2>
        </div>
        <div className="medicine-card__header-actions">
          <span
            className={`medicine-card__status ${status.state === 'ready' ? 'medicine-card__status--ready' : 'medicine-card__status--waiting'}`}
          >
            {status.state === 'ready' ? 'Ready now' : 'Cooling down'}
          </span>
          <div className="medicine-card__action-row">
            <button
              className="button button--ghost button--small"
              type="button"
              onClick={() => onEdit(medicine)}
            >
              Edit
            </button>
            <button
              className="button button--danger button--small"
              type="button"
              onClick={() => onDelete(medicine)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="medicine-card__highlight">
        <div className="medicine-card__dose-actions">
          <button
            className="button"
            type="button"
            onClick={() => {
              onTakeNow(medicine)
              resetBackfill()
            }}
          >
            Take now
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setIsBackfillOpen((current) => !current)
              setBackfillError(null)
            }}
          >
            {isBackfillOpen ? 'Close back-register' : 'Back-register'}
          </button>
        </div>

        <p className="medicine-card__headline">
          {status.state === 'ready'
            ? 'Can take another dose now'
            : `Available in ${formatRelativeDuration(status.remainingMs)}`}
        </p>
        <p className="medicine-card__subline">
          {status.nextAllowedAt
            ? `Next allowed ${formatTakenAt(status.nextAllowedAt)}`
            : 'No recorded dose yet'}
        </p>
        <div className="medicine-card__progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        {isBackfillOpen ? (
          <form className="backfill-form" onSubmit={handleBackfillSubmit}>
            <div className="backfill-form__fields">
              <label className="medicine-form__field">
                <span>Hours ago</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={hoursAgo}
                  onChange={(event) => setHoursAgo(event.target.value)}
                />
              </label>
              <label className="medicine-form__field">
                <span>Minutes ago</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  value={minutesAgo}
                  onChange={(event) => setMinutesAgo(event.target.value)}
                />
              </label>
            </div>
            {backfillError ? (
              <p className="medicine-form__error">{backfillError}</p>
            ) : null}
            <div className="medicine-form__actions">
              <button
                className="button button--ghost"
                type="button"
                onClick={resetBackfill}
              >
                Cancel
              </button>
              <button className="button" type="submit">
                Save back-registered dose
              </button>
            </div>
          </form>
        ) : null}
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
          <dt>Last source</dt>
          <dd>
            {status.latestDose
              ? formatDoseSource(status.latestDose.source)
              : 'No doses yet'}
          </dd>
        </div>
        <div>
          <dt>Recorded doses</dt>
          <dd>{medicine.doses.length}</dd>
        </div>
      </dl>
    </article>
  )
}
