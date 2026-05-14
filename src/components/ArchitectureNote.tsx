export function ArchitectureNote() {
  return (
    <section className="architecture-note" aria-label="Architecture decisions">
      <h2>Phase 2 foundation</h2>
      <ul>
        <li>PWA support is enabled for installability and offline caching.</li>
        <li>Data is modeled as medicines with cooldowns and dose records.</li>
        <li>Local persistence is set up around browser localStorage.</li>
        <li>The current list uses preview data until CRUD flows are built.</li>
      </ul>
    </section>
  )
}
