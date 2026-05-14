interface OverviewSummaryProps {
  total: number
  readyCount: number
  waitingCount: number
  nextReadyLabel: string
}

export function OverviewSummary({
  total,
  readyCount,
  waitingCount,
  nextReadyLabel,
}: OverviewSummaryProps) {
  return (
    <section className="summary-grid" aria-label="Medicine overview summary">
      <article className="summary-card">
        <p className="summary-card__label">Tracked</p>
        <p className="summary-card__value">{total}</p>
      </article>
      <article className="summary-card summary-card--ready">
        <p className="summary-card__label">Ready now</p>
        <p className="summary-card__value">{readyCount}</p>
      </article>
      <article className="summary-card summary-card--waiting">
        <p className="summary-card__label">Cooling down</p>
        <p className="summary-card__value">{waitingCount}</p>
      </article>
      <article className="summary-card">
        <p className="summary-card__label">Soonest ready</p>
        <p className="summary-card__value summary-card__value--small">
          {nextReadyLabel}
        </p>
      </article>
    </section>
  )
}
