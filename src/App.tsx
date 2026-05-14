import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Meditrack</p>
        <h1>Phase 1 is ready.</h1>
        <p className="lead">
          The local development environment is set up and the app scaffold is
          running.
        </p>

        <ul className="checklist" aria-label="Phase 1 status">
          <li>React + TypeScript + Vite project scaffolded</li>
          <li>npm-based local workflow verified</li>
          <li>Linting, formatting, and type-checking scripts added</li>
          <li>NeoVim workflow documented for this project</li>
        </ul>

        <div className="command-list">
          <code>npm run dev</code>
          <code>npm run dev:host</code>
          <code>npm run build</code>
          <code>npm run lint</code>
        </div>
      </section>
    </main>
  )
}

export default App
