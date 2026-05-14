import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { InstallHelp } from './components/InstallHelp'
import { MedicineCard } from './components/MedicineCard'
import { MedicineForm } from './components/MedicineForm'
import { MedicineSection } from './components/MedicineSection'
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
    updateLatestDoseTime,
    removeLatestDose,
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

  const { readyMedicines, waitingMedicines } = useMemo(() => {
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

    return {
      readyMedicines,
      waitingMedicines,
    }
  }, [appState.medicines, now])

  const medicineCount = appState.medicines.length
  const medicineCountLabel = `${medicineCount} ${medicineCount === 1 ? 'medicine' : 'medicines'}`

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
      <section className="app-hero app-hero--compact">
        <div>
          <p className="eyebrow">Meditrack</p>
          <h1>Meditrack</h1>
          <p className="hero-subtitle">
            {medicineCountLabel} • Updated {formatTakenAt(now)}
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="button button--small"
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
              className="button button--ghost button--small"
              type="button"
              onClick={handleResetAllData}
            >
              Reset data
            </button>
          ) : null}
        </div>
      </section>

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
          {readyMedicines.length > 0 ? (
            <MedicineSection
              title="Ready now"
              badge={`${readyMedicines.length}`}
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
                  onEditLatestDose={(currentMedicine, input) =>
                    updateLatestDoseTime(currentMedicine.id, input)
                  }
                  onRemoveLatestDose={(currentMedicine) =>
                    removeLatestDose(currentMedicine.id)
                  }
                />
              ))}
            </MedicineSection>
          ) : null}

          {waitingMedicines.length > 0 ? (
            <MedicineSection
              title="Cooling down"
              badge={`${waitingMedicines.length}`}
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
                  onEditLatestDose={(currentMedicine, input) =>
                    updateLatestDoseTime(currentMedicine.id, input)
                  }
                  onRemoveLatestDose={(currentMedicine) =>
                    removeLatestDose(currentMedicine.id)
                  }
                />
              ))}
            </MedicineSection>
          ) : null}
        </>
      )}

      {isInstallHelpOpen ? (
        <InstallHelp onClose={() => setIsInstallHelpOpen(false)} />
      ) : null}

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
    </main>
  )
}

export default App
