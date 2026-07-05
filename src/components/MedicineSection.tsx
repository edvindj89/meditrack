import type { ReactNode } from 'react'

interface MedicineSectionProps {
  title: string
  badge: string
  actions?: ReactNode
  children: ReactNode
}

export function MedicineSection({
  title,
  badge,
  actions,
  children,
}: MedicineSectionProps) {
  return (
    <section className="medicine-section">
      <div className="section-heading">
        <div className="section-heading__title">
          <h2>{title}</h2>
          <span className="medicine-count">{badge}</span>
        </div>
        {actions ? (
          <div className="section-heading__actions">{actions}</div>
        ) : null}
      </div>

      <div className="medicine-list">{children}</div>
    </section>
  )
}
