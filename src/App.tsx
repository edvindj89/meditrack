import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { InstallHelp } from './components/InstallHelp'
import { ManualOrderList } from './components/ManualOrderList'
import { MedicineCard } from './components/MedicineCard'
import { MedicineForm } from './components/MedicineForm'
import { MedicineSection } from './components/MedicineSection'
import { PersistenceNotice } from './components/PersistenceNotice'
import { PwaPanel } from './components/PwaPanel'
import {
  SortDropdown,
  type SortDropdownOption,
} from './components/SortDropdown'
import { getMedicineStatus } from './domain/medicine'
import {
  sortReadyMedicineEntries,
  sortWaitingMedicineEntries,
  type ReadySortKey,
  type WaitingSortKey,
} from './domain/sorting'
import { useAppState } from './state/useAppState'
import { useNow } from './state/useNow'
import { usePwaStatus } from './state/usePwaStatus'
import { useSortPreferences } from './state/useSortPreferences'
import type { Medicine } from './types/medicine'
import { formatTakenAt } from './utils/time'
import './App.css'

const READY_SORT_OPTIONS: SortDropdownOption<ReadySortKey>[] = [
  {
    value: 'name',
    label: 'Name',
    description: 'Find medicines alphabetically.',
    defaultDirection: 'asc',
    directionLabels: { asc: 'Name A–Z', desc: 'Name Z–A' },
  },
  {
    value: 'createdAt',
    label: 'Date added',
    description: 'Prioritize recently created medicines.',
    defaultDirection: 'desc',
    directionLabels: { asc: 'Oldest first', desc: 'Newest first' },
  },
  {
    value: 'lastTaken',
    label: 'Last taken',
    description: 'Order by the latest recorded dose.',
    defaultDirection: 'desc',
    directionLabels: { asc: 'Least recent', desc: 'Most recent' },
  },
  {
    value: 'manualOrder',
    label: 'Manual order',
    description: 'Use your custom medicine order.',
    defaultDirection: 'asc',
    directionLabels: { asc: 'Custom order', desc: 'Reverse order' },
  },
]

const WAITING_SORT_OPTIONS: SortDropdownOption<WaitingSortKey>[] = [
  {
    value: 'remainingTime',
    label: 'Time remaining',
    description: 'Show what becomes available next.',
    defaultDirection: 'asc',
    directionLabels: { asc: 'Ready soonest', desc: 'Ready latest' },
  },
  {
    value: 'elapsedTime',
    label: 'Time since last dose',
    description: 'Order by how long ago it was taken.',
    defaultDirection: 'asc',
    directionLabels: { asc: 'Taken most recently', desc: 'Taken longest ago' },
  },
  {
    value: 'name',
    label: 'Name',
    description: 'Find medicines alphabetically.',
    defaultDirection: 'asc',
    directionLabels: { asc: 'Name A–Z', desc: 'Name Z–A' },
  },
]

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
    updateActiveDoseTime,
    removeActiveDose,
    updateManualOrder,
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
  const { readySort, waitingSort, setReadySort, setWaitingSort } =
    useSortPreferences()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isInstallHelpOpen, setIsInstallHelpOpen] = useState(false)
  const [isArrangingReady, setIsArrangingReady] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)

  const { readyMedicines, waitingMedicines } = useMemo(() => {
    const entries = appState.medicines.map((medicine) => ({
      medicine,
      status: getMedicineStatus(medicine, now),
    }))

    const readyMedicines = sortReadyMedicineEntries(
      entries.filter((entry) => entry.status.state === 'ready'),
      readySort,
    )

    const waitingMedicines = sortWaitingMedicineEntries(
      entries.filter((entry) => entry.status.state === 'waiting'),
      waitingSort,
    )

    return {
      readyMedicines,
      waitingMedicines,
    }
  }, [appState.medicines, now, readySort, waitingSort])

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
    setIsArrangingReady(false)
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
              title={isArrangingReady ? 'Arrange ready medicines' : 'Ready now'}
              badge={`${readyMedicines.length}`}
              actions={
                isArrangingReady ? (
                  <button
                    className="button button--small"
                    type="button"
                    onClick={() => setIsArrangingReady(false)}
                  >
                    Done
                  </button>
                ) : (
                  <SortDropdown
                    ariaLabel="Sort ready medicines"
                    value={readySort.key}
                    direction={readySort.direction}
                    options={READY_SORT_OPTIONS}
                    onChange={(key, direction) =>
                      setReadySort({ key, direction })
                    }
                    onDirectionChange={(direction) =>
                      setReadySort({ ...readySort, direction })
                    }
                    onArrangeManualOrder={() => {
                      setReadySort({ key: 'manualOrder', direction: 'asc' })
                      setIsArrangingReady(true)
                    }}
                  />
                )
              }
            >
              {isArrangingReady ? (
                <ManualOrderList
                  medicines={readyMedicines.map(({ medicine }) => medicine)}
                  onReorder={updateManualOrder}
                />
              ) : (
                readyMedicines.map(({ medicine }) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    now={now}
                    onEdit={setEditingMedicine}
                    onDelete={handleDeleteMedicine}
                    onTakeNow={(currentMedicine, options) =>
                      recordDoseNow(currentMedicine.id, options)
                    }
                    onBackfill={(currentMedicine, input) =>
                      recordBackfilledDose(currentMedicine.id, input)
                    }
                    onEditActiveDose={(currentMedicine, input) =>
                      updateActiveDoseTime(currentMedicine.id, input)
                    }
                    onRemoveActiveDose={(currentMedicine) =>
                      removeActiveDose(currentMedicine.id)
                    }
                  />
                ))
              )}
            </MedicineSection>
          ) : null}

          {waitingMedicines.length > 0 ? (
            <MedicineSection
              title="Cooling down"
              badge={`${waitingMedicines.length}`}
              actions={
                <SortDropdown
                  ariaLabel="Sort cooling down medicines"
                  value={waitingSort.key}
                  direction={waitingSort.direction}
                  options={WAITING_SORT_OPTIONS}
                  onChange={(key, direction) =>
                    setWaitingSort({ key, direction })
                  }
                  onDirectionChange={(direction) =>
                    setWaitingSort({ ...waitingSort, direction })
                  }
                />
              }
            >
              {waitingMedicines.map(({ medicine }) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  now={now}
                  onEdit={setEditingMedicine}
                  onDelete={handleDeleteMedicine}
                  onTakeNow={(currentMedicine, options) =>
                    recordDoseNow(currentMedicine.id, options)
                  }
                  onBackfill={(currentMedicine, input) =>
                    recordBackfilledDose(currentMedicine.id, input)
                  }
                  onEditActiveDose={(currentMedicine, input) =>
                    updateActiveDoseTime(currentMedicine.id, input)
                  }
                  onRemoveActiveDose={(currentMedicine) =>
                    removeActiveDose(currentMedicine.id)
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
