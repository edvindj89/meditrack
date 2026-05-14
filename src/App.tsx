import { useMemo } from 'react'
import { MedicineCard } from './components/MedicineCard'
import { MedicineSection } from './components/MedicineSection'
import { OverviewSummary } from './components/OverviewSummary'
import { getMedicineStatus } from './domain/medicine'
import { useAppState } from './state/useAppState'
import { useNow } from './state/useNow'
import { formatTakenAt } from './utils/time'
import './App.css'

function App() {
  const { appState, isUsingPreviewData } = useAppState()
  const now = useNow()

  const { readyMedicines, waitingMedicines, nextReadyLabel } = useMemo(() => {
    const entries = appState.medicines.map((medicine) => ({
      medicine,
      status: getMedicineStatus(medicine, now),
    }))

    const readyMedicines = entries
      .filter((entry) => entry.status.state === 'ready')
      .sort((left, right) =>
        left.medicine.name.localeCompare(right.medicine.name),
      )

    const waitingMedicines = entries
      .filter((entry) => entry.status.state === 'waiting')
      .sort((left, right) => left.status.remainingMs - right.status.remainingMs)

    const nextReady = waitingMedicines[0]?.status.nextAllowedAt

    return {
      readyMedicines,
      waitingMedicines,
      nextReadyLabel: nextReady ? formatTakenAt(nextReady) : 'Now',
    }
  }, [appState.medicines, now])

  return (
    <main className="app-shell">
      <section className="app-hero">
        <div>
          <p className="eyebrow">Meditrack</p>
          <h1>Medicine cooldowns at a glance.</h1>
          <p className="lead">
            See what is ready right now, what is still cooling down, and when
            the next dose is allowed.
          </p>
        </div>

        <div className="hero-meta">
          <p className="hero-timestamp">Updated {formatTakenAt(now)}</p>
          {isUsingPreviewData ? (
            <p className="preview-badge">
              Preview data is shown until CRUD flows are built.
            </p>
          ) : null}
        </div>
      </section>

      <OverviewSummary
        total={appState.medicines.length}
        readyCount={readyMedicines.length}
        waitingCount={waitingMedicines.length}
        nextReadyLabel={nextReadyLabel}
      />

      {readyMedicines.length > 0 ? (
        <MedicineSection
          title="Ready now"
          subtitle="Available"
          badge={`${readyMedicines.length} ready`}
        >
          {readyMedicines.map(({ medicine }) => (
            <MedicineCard key={medicine.id} medicine={medicine} now={now} />
          ))}
        </MedicineSection>
      ) : null}

      {waitingMedicines.length > 0 ? (
        <MedicineSection
          title="Cooling down"
          subtitle="Wait before next dose"
          badge={`${waitingMedicines.length} waiting`}
        >
          {waitingMedicines.map(({ medicine }) => (
            <MedicineCard key={medicine.id} medicine={medicine} now={now} />
          ))}
        </MedicineSection>
      ) : null}
    </main>
  )
}

export default App
