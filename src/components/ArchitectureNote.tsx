export function ArchitectureNote() {
  return (
    <section className="architecture-note" aria-label="Architecture decisions">
      <h2>Phase 3 domain logic</h2>
      <ul>
        <li>
          Cooldown status is derived from a reusable medicine domain module.
        </li>
        <li>Back-registration is handled from hours/minutes-ago input.</li>
        <li>Stored data is normalized before use and before saving.</li>
        <li>Domain tests cover cooldown state, sorting, and backfill rules.</li>
      </ul>
    </section>
  )
}
