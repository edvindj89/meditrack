import type { ReactNode } from 'react'

interface MedicineSectionProps {
  title: string
  subtitle: string
  badge: string
  children: ReactNode
}

export function MedicineSection({
  title,
  subtitle,
  badge,
  children,
}: MedicineSectionProps) {
  return (
    <section className="medicine-section">
      <div className="section-heading">
        <div>
          <p className="section-label">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <span className="medicine-count">{badge}</span>
      </div>

      <div className="medicine-list">{children}</div>
    </section>
  )
}
