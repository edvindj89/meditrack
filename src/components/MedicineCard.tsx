import { useState } from 'react'
import { MINUTE_IN_MS, getMedicineStatus } from '../domain/medicine'
import type { BackfillDoseInput, Medicine } from '../types/medicine'
import {
  formatCooldown,
  formatDoseSource,
  formatRelativeDuration,
  formatTakenAt,
} from '../utils/time'

type DoseEditorMode = 'backfill-new' | 'edit-latest' | null

interface MedicineCardProps {
  medicine: Medicine
  now: Date
  onEdit: (medicine: Medicine) => void
  onDelete: (medicine: Medicine) => void
  onTakeNow: (medicine: Medicine) => void
  onBackfill: (medicine: Medicine, input: BackfillDoseInput) => void
  onEditLatestDose: (medicine: Medicine, input: BackfillDoseInput) => void
  onRemoveLatestDose: (medicine: Medicine) => void
}

export function MedicineCard({
  medicine,
  now,
  onEdit,
  onDelete,
  onTakeNow,
  onBackfill,
  onEditLatestDose,
  onRemoveLatestDose,
}: MedicineCardProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [doseEditorMode, setDoseEditorMode] = useState<DoseEditorMode>(null)
  const [hoursAgo, setHoursAgo] = useState('1')
  const [minutesAgo, setMinutesAgo] = useState('0')
  const [backfillError, setBackfillError] = useState<string | null>(null)
  const status = getMedicineStatus(medicine, now)
  const isCoolingDown = status.state === 'waiting'
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

  const compactWaitLabel =
    status.remainingMs > 0 && status.remainingMs < MINUTE_IN_MS
      ? 'under 1 min'
      : formatRelativeDuration(status.remainingMs)

  const primaryMeta = status.latestDose
    ? `Cooldown ${formatCooldown(medicine.cooldownMinutes)} • Next ${status.nextAllowedAt ? formatTakenAt(status.nextAllowedAt) : 'now'}`
    : `Cooldown ${formatCooldown(medicine.cooldownMinutes)} • Can take now`

  const secondaryMeta = status.latestDose
    ? `Last ${formatTakenAt(status.latestDose.takenAt)} • ${formatDoseSource(status.latestDose.source)}`
    : 'No dose recorded yet'

  function setDoseEditorFromElapsed(elapsedMs: number | null) {
    const totalMinutes =
      elapsedMs === null
        ? 60
        : Math.max(0, Math.floor(elapsedMs / MINUTE_IN_MS))
    setHoursAgo(String(Math.floor(totalMinutes / 60)))
    setMinutesAgo(String(totalMinutes % 60))
  }

  function closeDoseEditor() {
    setHoursAgo('1')
    setMinutesAgo('0')
    setBackfillError(null)
    setDoseEditorMode(null)
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

    if (
      doseEditorMode === 'backfill-new' &&
      parsedHours === 0 &&
      parsedMinutes === 0
    ) {
      setBackfillError('Use Take now for a dose taken just now.')
      return
    }

    try {
      const input = {
        hoursAgo: parsedHours,
        minutesAgo: parsedMinutes,
      }

      if (doseEditorMode === 'edit-latest') {
        onEditLatestDose(medicine, input)
      } else {
        onBackfill(medicine, input)
      }

      closeDoseEditor()
    } catch (error) {
      setBackfillError(
        error instanceof Error ? error.message : 'Could not save dose.',
      )
    }
  }

  return (
    <article className="medicine-card">
      <div className="medicine-card__top">
        <div className="medicine-card__main">
          <h3 className="medicine-card__title">{medicine.name}</h3>
          <p className="medicine-card__meta">{primaryMeta}</p>
          <p className="medicine-card__meta medicine-card__meta--secondary">
            {secondaryMeta}
          </p>
        </div>

        <div className="medicine-card__top-right">
          <span
            className={`medicine-card__status ${status.state === 'ready' ? 'medicine-card__status--ready' : 'medicine-card__status--waiting'}`}
          >
            {status.state === 'ready'
              ? 'Ready now'
              : `Wait ${compactWaitLabel}`}
          </span>

          <div className="medicine-card__menu">
            <button
              className="button button--ghost button--small button--icon"
              type="button"
              aria-label={`More actions for ${medicine.name}`}
              onClick={() => setIsActionMenuOpen((current) => !current)}
            >
              ⋯
            </button>

            {isActionMenuOpen ? (
              <div className="medicine-card__menu-popover">
                {status.latestDose && !isCoolingDown ? (
                  <button
                    className="medicine-card__menu-item"
                    type="button"
                    onClick={() => {
                      setIsActionMenuOpen(false)
                      setBackfillError(null)
                      setDoseEditorFromElapsed(status.elapsedMs)
                      setDoseEditorMode('edit-latest')
                    }}
                  >
                    Edit last dose
                  </button>
                ) : null}
                {status.latestDose ? (
                  <button
                    className="medicine-card__menu-item medicine-card__menu-item--danger"
                    type="button"
                    onClick={() => {
                      setIsActionMenuOpen(false)
                      if (
                        window.confirm(
                          `Remove the latest dose for ${medicine.name}?`,
                        )
                      ) {
                        onRemoveLatestDose(medicine)
                        closeDoseEditor()
                      }
                    }}
                  >
                    Remove last dose
                  </button>
                ) : null}
                <button
                  className="medicine-card__menu-item"
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false)
                    onEdit(medicine)
                  }}
                >
                  Edit medicine
                </button>
                <button
                  className="medicine-card__menu-item medicine-card__menu-item--danger"
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false)
                    onDelete(medicine)
                  }}
                >
                  Delete medicine
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {status.latestDose ? (
        <div className="medicine-card__progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className="medicine-card__dose-actions">
        <button
          className="button button--small"
          type="button"
          disabled={isCoolingDown}
          onClick={() => {
            if (isCoolingDown) {
              return
            }

            onTakeNow(medicine)
            closeDoseEditor()
            setIsActionMenuOpen(false)
          }}
        >
          Take now
        </button>
        <button
          className="button button--ghost button--small"
          type="button"
          onClick={() => {
            setBackfillError(null)

            if (isCoolingDown) {
              setDoseEditorMode((current) => {
                if (current === 'edit-latest') {
                  return null
                }

                setDoseEditorFromElapsed(status.elapsedMs)
                return 'edit-latest'
              })
              return
            }

            setDoseEditorMode((current) =>
              current === 'backfill-new' ? null : 'backfill-new',
            )
            if (doseEditorMode !== 'backfill-new') {
              setHoursAgo('1')
              setMinutesAgo('0')
            }
          }}
        >
          {isCoolingDown
            ? doseEditorMode === 'edit-latest'
              ? 'Close edit'
              : 'Edit'
            : doseEditorMode === 'backfill-new'
              ? 'Close backdate'
              : 'Backdate'}
        </button>
      </div>

      {doseEditorMode ? (
        <form
          className="backfill-form backfill-form--compact"
          onSubmit={handleBackfillSubmit}
        >
          <div className="backfill-form__inline-fields">
            <label className="medicine-form__field medicine-form__field--compact">
              <span>Hours</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={hoursAgo}
                onChange={(event) => setHoursAgo(event.target.value)}
              />
            </label>
            <label className="medicine-form__field medicine-form__field--compact">
              <span>Minutes</span>
              <input
                type="number"
                min="0"
                max="59"
                inputMode="numeric"
                value={minutesAgo}
                onChange={(event) => setMinutesAgo(event.target.value)}
              />
            </label>
            <button className="button button--small" type="submit">
              Save
            </button>
            <button
              className="button button--ghost button--small"
              type="button"
              onClick={closeDoseEditor}
            >
              Cancel
            </button>
          </div>
          <p className="backfill-form__label">
            {doseEditorMode === 'edit-latest'
              ? 'Edit the latest recorded dose.'
              : 'Record an older dose.'}
          </p>
          {backfillError ? (
            <p className="medicine-form__error">{backfillError}</p>
          ) : null}
        </form>
      ) : null}
    </article>
  )
}
