import type { ReactNode } from 'react'

interface MedicineSectionProps {
  title: string
  badge: string
  children: ReactNode
}

export function MedicineSection({
  title,
  badge,
  children,
}: MedicineSectionProps) {
  return (
    <section className="medicine-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <span className="medicine-count">{badge}</span>
      </div>

      <div className="medicine-list">{children}</div>
    </section>
  )
}
