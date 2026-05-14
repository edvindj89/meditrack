interface EmptyStateProps {
  onAddMedicine: () => void
}

export function EmptyState({ onAddMedicine }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <p className="section-label">No medicines yet</p>
      <h2>Add your first medicine</h2>
      <p className="lead lead--compact">
        Start by adding a medicine and setting the minimum time between doses.
      </p>
      <button className="button" type="button" onClick={onAddMedicine}>
        Add medicine
      </button>
    </section>
  )
}
