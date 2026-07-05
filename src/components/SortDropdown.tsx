import { useState } from 'react'
import type { SortDirection } from '../domain/sorting'

export interface SortDropdownOption<TSortKey extends string> {
  value: TSortKey
  label: string
  description: string
  defaultDirection: SortDirection
  directionLabels: Record<SortDirection, string>
}

interface SortDropdownProps<TSortKey extends string> {
  ariaLabel: string
  value: TSortKey
  direction: SortDirection
  options: SortDropdownOption<TSortKey>[]
  onChange: (value: TSortKey, direction: SortDirection) => void
  onDirectionChange: (direction: SortDirection) => void
  onArrangeManualOrder?: () => void
}

export function SortDropdown<TSortKey extends string>({
  ariaLabel,
  value,
  direction,
  options,
  onChange,
  onDirectionChange,
  onArrangeManualOrder,
}: SortDropdownProps<TSortKey>) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0]

  return (
    <div className="sort-dropdown">
      <button
        className="button button--ghost button--small sort-dropdown__trigger"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>Sort</span>
        <strong>{selectedOption.directionLabels[direction]}</strong>
        <span aria-hidden="true">▾</span>
      </button>

      {isOpen ? (
        <div className="sort-dropdown__menu" role="menu">
          <p className="sort-dropdown__label">Sort by</p>
          <div className="sort-dropdown__options">
            {options.map((option) => {
              const isSelected = option.value === value

              return (
                <button
                  key={option.value}
                  className={`sort-dropdown__item${isSelected ? ' sort-dropdown__item--selected' : ''}`}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onChange(
                      option.value,
                      isSelected ? direction : option.defaultDirection,
                    )
                  }}
                >
                  <span className="sort-dropdown__check" aria-hidden="true">
                    {isSelected ? '✓' : ''}
                  </span>
                  <span>
                    <span className="sort-dropdown__item-title">
                      {option.label}
                    </span>
                    <span className="sort-dropdown__item-description">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="sort-dropdown__divider" />
          <p className="sort-dropdown__label">Direction</p>
          <div className="sort-dropdown__direction" role="group">
            {(['asc', 'desc'] as SortDirection[]).map((nextDirection) => (
              <button
                key={nextDirection}
                className={`sort-dropdown__direction-button${direction === nextDirection ? ' sort-dropdown__direction-button--selected' : ''}`}
                type="button"
                onClick={() => onDirectionChange(nextDirection)}
              >
                {selectedOption.directionLabels[nextDirection]}
              </button>
            ))}
          </div>

          {onArrangeManualOrder ? (
            <>
              <div className="sort-dropdown__divider" />
              <button
                className="sort-dropdown__arrange"
                type="button"
                onClick={() => {
                  onArrangeManualOrder()
                  setIsOpen(false)
                }}
              >
                Arrange manual order
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
