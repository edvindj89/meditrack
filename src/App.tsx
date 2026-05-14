import { ArchitectureNote } from './components/ArchitectureNote'
import { MedicineCard } from './components/MedicineCard'
import { useAppState } from './state/useAppState'
import './App.css'

function App() {
  const { appState, isUsingPreviewData } = useAppState()
  const now = new Date()

  return (
    <main className="app-shell">
      <section className="app-hero">
        <div>
          <p className="eyebrow">Meditrack</p>
          <h1>Medicine cooldowns at a glance.</h1>
          <p className="lead">
            This is the Phase 2 app shell: PWA support, data model, local
            storage layer, and the initial mobile-first overview screen.
          </p>
        </div>

        {isUsingPreviewData ? (
          <p className="preview-badge">
            Preview data is shown until CRUD flows are built.
          </p>
        ) : null}
      </section>

      <section
        className="medicine-list-section"
        aria-labelledby="medicine-list-title"
      >
        <div className="section-heading">
          <div>
            <p className="section-label">Overview</p>
            <h2 id="medicine-list-title">Tracked medicines</h2>
          </div>
          <span className="medicine-count">
            {appState.medicines.length} items
          </span>
        </div>

        <div className="medicine-list">
          {appState.medicines.map((medicine) => (
            <MedicineCard key={medicine.id} medicine={medicine} now={now} />
          ))}
        </div>
      </section>

      <ArchitectureNote />
    </main>
  )
}

export default App
