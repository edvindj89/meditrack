import { useMemo, useState } from 'react'

interface MedicineFormValues {
  name: string
  cooldownMinutes: number
}

interface MedicineFormProps {
  mode: 'add' | 'edit'
  initialValues?: MedicineFormValues
  onCancel: () => void
  onSubmit: (values: MedicineFormValues) => void
}

function splitCooldown(totalMinutes: number) {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  }
}

export function MedicineForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: MedicineFormProps) {
  const initialCooldown = useMemo(
    () => splitCooldown(initialValues?.cooldownMinutes ?? 6 * 60),
    [initialValues?.cooldownMinutes],
  )
  const [name, setName] = useState(initialValues?.name ?? '')
  const [hours, setHours] = useState(String(initialCooldown.hours))
  const [minutes, setMinutes] = useState(String(initialCooldown.minutes))
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const parsedHours = Number(hours)
    const parsedMinutes = Number(minutes)

    if (!trimmedName) {
      setError('Enter a medicine name.')
      return
    }

    if (
      !Number.isInteger(parsedHours) ||
      !Number.isInteger(parsedMinutes) ||
      parsedHours < 0 ||
      parsedMinutes < 0 ||
      parsedMinutes > 59
    ) {
      setError('Enter a valid cooldown using hours and 0–59 minutes.')
      return
    }

    const cooldownMinutes = parsedHours * 60 + parsedMinutes
    if (cooldownMinutes < 1) {
      setError('Cooldown must be at least 1 minute.')
      return
    }

    setError(null)
    onSubmit({
      name: trimmedName,
      cooldownMinutes,
    })
  }

  return (
    <section
      className="medicine-form-card"
      aria-label={mode === 'add' ? 'Add medicine' : 'Edit medicine'}
    >
      <div className="medicine-form-card__header">
        <div>
          <p className="section-label">
            {mode === 'add' ? 'New medicine' : 'Edit medicine'}
          </p>
          <h2>{mode === 'add' ? 'Add medicine' : 'Update medicine'}</h2>
        </div>
      </div>

      <form className="medicine-form" onSubmit={handleSubmit}>
        <label className="medicine-form__field">
          <span>Name</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ibuprofen"
          />
        </label>

        <div className="medicine-form__cooldown-group">
          <label className="medicine-form__field">
            <span>Cooldown hours</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </label>

          <label className="medicine-form__field">
            <span>Cooldown minutes</span>
            <input
              type="number"
              min="0"
              max="59"
              inputMode="numeric"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </label>
        </div>

        {error ? <p className="medicine-form__error">{error}</p> : null}

        <div className="medicine-form__actions">
          <button
            className="button button--ghost"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="button" type="submit">
            {mode === 'add' ? 'Save medicine' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
