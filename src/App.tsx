import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { InstallHelp } from './components/InstallHelp'
import { MedicineCard } from './components/MedicineCard'
import { MedicineForm } from './components/MedicineForm'
import { MedicineSection } from './components/MedicineSection'
import { OverviewSummary } from './components/OverviewSummary'
import { PersistenceNotice } from './components/PersistenceNotice'
import { PwaPanel } from './components/PwaPanel'
import { getMedicineStatus } from './domain/medicine'
import { useAppState } from './state/useAppState'
import { useNow } from './state/useNow'
import { usePwaStatus } from './state/usePwaStatus'
import type { Medicine } from './types/medicine'
import { formatTakenAt } from './utils/time'
import './App.css'

function App() {
  const {
    appState,
    storageMessage,
    dismissStorageMessage,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    recordDoseNow,
    recordBackfilledDose,
    resetAllData,
  } = useAppState()
  const {
    canInstall,
    installHint,
    isOnline,
    isStandalone,
    needRefresh,
    offlineReady,
    dismissOfflineReady,
    dismissNeedRefresh,
    promptInstall,
    refreshApp,
  } = usePwaStatus()
  const now = useNow()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isInstallHelpOpen, setIsInstallHelpOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)

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

  function handleDeleteMedicine(medicine: Medicine) {
    const confirmed = window.confirm(`Delete ${medicine.name}?`)
    if (!confirmed) {
      return
    }

    deleteMedicine(medicine.id)
    if (editingMedicine?.id === medicine.id) {
      setEditingMedicine(null)
    }
  }

  function handleResetAllData() {
    const confirmed = window.confirm(
      'Clear all medicines and recorded doses from this device?',
    )
    if (!confirmed) {
      return
    }

    setIsAddOpen(false)
    setEditingMedicine(null)
    resetAllData()
  }

  function closeForms() {
    setIsAddOpen(false)
    setEditingMedicine(null)
  }

  return (
    <main className="app-shell">
      <section className="app-hero">
        <div>
          <p className="eyebrow">Meditrack</p>
          <h1>Medicine cooldowns at a glance.</h1>
          <p className="lead">
            Add medicines, record doses now or in retrospect, and keep the
            overview easy to scan on a phone.
          </p>
        </div>

        <div className="hero-meta">
          <p className="hero-timestamp">Updated {formatTakenAt(now)}</p>
          <button
            className="button"
            type="button"
            onClick={() => {
              setIsAddOpen(true)
              setEditingMedicine(null)
            }}
          >
            Add medicine
          </button>
          {appState.medicines.length > 0 ? (
            <button
              className="button button--ghost"
              type="button"
              onClick={handleResetAllData}
            >
              Reset data
            </button>
          ) : null}
        </div>
      </section>

      <PwaPanel
        canInstall={canInstall}
        installHint={installHint}
        isOnline={isOnline}
        isStandalone={isStandalone}
        needRefresh={needRefresh}
        offlineReady={offlineReady}
        onInstall={promptInstall}
        onOpenInstallHelp={() => setIsInstallHelpOpen(true)}
        onRefresh={refreshApp}
        onDismissOfflineReady={dismissOfflineReady}
        onDismissNeedRefresh={dismissNeedRefresh}
      />

      {isInstallHelpOpen ? (
        <InstallHelp onClose={() => setIsInstallHelpOpen(false)} />
      ) : null}

      {storageMessage ? (
        <PersistenceNotice
          message={storageMessage}
          onDismiss={dismissStorageMessage}
        />
      ) : null}

      {isAddOpen ? (
        <MedicineForm
          mode="add"
          onCancel={closeForms}
          onSubmit={(values) => {
            addMedicine(values)
            setIsAddOpen(false)
          }}
        />
      ) : null}

      {editingMedicine ? (
        <MedicineForm
          mode="edit"
          initialValues={{
            name: editingMedicine.name,
            cooldownMinutes: editingMedicine.cooldownMinutes,
          }}
          onCancel={closeForms}
          onSubmit={(values) => {
            updateMedicine(editingMedicine.id, values)
            setEditingMedicine(null)
          }}
        />
      ) : null}

      {appState.medicines.length === 0 ? (
        <EmptyState onAddMedicine={() => setIsAddOpen(true)} />
      ) : (
        <>
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
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  now={now}
                  onEdit={setEditingMedicine}
                  onDelete={handleDeleteMedicine}
                  onTakeNow={(currentMedicine) =>
                    recordDoseNow(currentMedicine.id)
                  }
                  onBackfill={(currentMedicine, input) =>
                    recordBackfilledDose(currentMedicine.id, input)
                  }
                />
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
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  now={now}
                  onEdit={setEditingMedicine}
                  onDelete={handleDeleteMedicine}
                  onTakeNow={(currentMedicine) =>
                    recordDoseNow(currentMedicine.id)
                  }
                  onBackfill={(currentMedicine, input) =>
                    recordBackfilledDose(currentMedicine.id, input)
                  }
                />
              ))}
            </MedicineSection>
          ) : null}
        </>
      )}
    </main>
  )
}

export default App
