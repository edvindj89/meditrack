import { useState, type DragEvent } from 'react'
import type { Medicine } from '../types/medicine'

interface ManualOrderListProps {
  medicines: Medicine[]
  onReorder: (orderedMedicineIds: string[]) => void
}

function moveItem(ids: string[], fromIndex: number, toIndex: number): string[] {
  const nextIds = [...ids]
  const [movedId] = nextIds.splice(fromIndex, 1)
  nextIds.splice(toIndex, 0, movedId)
  return nextIds
}

export function ManualOrderList({
  medicines,
  onReorder,
}: ManualOrderListProps) {
  const [draggedMedicineId, setDraggedMedicineId] = useState<string | null>(
    null,
  )

  function handleMove(medicineId: string, offset: -1 | 1) {
    const ids = medicines.map((medicine) => medicine.id)
    const currentIndex = ids.indexOf(medicineId)
    const nextIndex = currentIndex + offset

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ids.length) {
      return
    }

    onReorder(moveItem(ids, currentIndex, nextIndex))
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    targetMedicineId: string,
  ) {
    event.preventDefault()

    if (!draggedMedicineId || draggedMedicineId === targetMedicineId) {
      setDraggedMedicineId(null)
      return
    }

    const ids = medicines.map((medicine) => medicine.id)
    const fromIndex = ids.indexOf(draggedMedicineId)
    const toIndex = ids.indexOf(targetMedicineId)

    if (fromIndex >= 0 && toIndex >= 0) {
      onReorder(moveItem(ids, fromIndex, toIndex))
    }

    setDraggedMedicineId(null)
  }

  return (
    <div className="manual-order-list" aria-label="Arrange ready medicines">
      <p className="manual-order-list__hint">
        Drag from the handle, or use the arrow buttons, then tap Done.
      </p>

      {medicines.map((medicine, index) => (
        <div
          key={medicine.id}
          className={`manual-order-row${draggedMedicineId === medicine.id ? ' manual-order-row--dragging' : ''}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, medicine.id)}
        >
          <button
            className="manual-order-row__handle"
            type="button"
            draggable
            aria-label={`Drag ${medicine.name} to reorder`}
            onDragStart={() => setDraggedMedicineId(medicine.id)}
            onDragEnd={() => setDraggedMedicineId(null)}
          >
            ☰
          </button>

          <div className="manual-order-row__content">
            <h3>{medicine.name}</h3>
            <p>Manual position {index + 1}</p>
          </div>

          <div className="manual-order-row__actions">
            <button
              className="button button--ghost button--small button--icon"
              type="button"
              aria-label={`Move ${medicine.name} up`}
              disabled={index === 0}
              onClick={() => handleMove(medicine.id, -1)}
            >
              ↑
            </button>
            <button
              className="button button--ghost button--small button--icon"
              type="button"
              aria-label={`Move ${medicine.name} down`}
              disabled={index === medicines.length - 1}
              onClick={() => handleMove(medicine.id, 1)}
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
