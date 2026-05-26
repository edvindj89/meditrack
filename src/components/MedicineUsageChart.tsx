import { useMemo, useState } from 'react'
import {
  getUsageChartData,
  type UsageChartPoint,
  type UsageChartTimeframe,
} from '../domain/usageChart'
import type { Medicine } from '../types/medicine'

interface MedicineUsageChartProps {
  medicine: Medicine
  now: Date
}

function getAxisTicks(maxCount: number): number[] {
  if (maxCount <= 1) {
    return [0, 1]
  }

  if (maxCount <= 4) {
    return Array.from({ length: maxCount + 1 }, (_, index) => index)
  }

  const step = Math.ceil(maxCount / 4)
  const ticks = new Set<number>([0, maxCount])

  for (let value = step; value < maxCount; value += step) {
    ticks.add(Math.min(maxCount, value))
  }

  return [...ticks].sort((left, right) => left - right)
}

function formatValueLabel(
  point: UsageChartPoint,
  timeframe: UsageChartTimeframe,
) {
  if (timeframe === 'day' && point.secondaryLabel) {
    return `${point.secondaryLabel} ${point.label}`
  }

  return point.label
}

export function MedicineUsageChart({ medicine, now }: MedicineUsageChartProps) {
  const [timeframe, setTimeframe] = useState<UsageChartTimeframe>('day')
  const points = useMemo(
    () => getUsageChartData(medicine, timeframe, now),
    [medicine, now, timeframe],
  )
  const maxCount = Math.max(...points.map((point) => point.count), 0)
  const chartMax = Math.max(maxCount, 1)
  const axisTicks = getAxisTicks(chartMax)
  const hasAnyData = points.some((point) => point.count > 0)

  return (
    <section
      className="usage-chart"
      aria-label={`Usage chart for ${medicine.name}`}
    >
      <div className="usage-chart__header">
        <div>
          <p className="section-label">Usage</p>
          <p className="usage-chart__axis-note">X-axis time • Y-axis doses</p>
        </div>
        <div
          className="usage-chart__timeframes"
          role="tablist"
          aria-label="Usage timeframes"
        >
          {(['day', 'week', 'month'] as const).map((option) => (
            <button
              key={option}
              className={`button button--ghost button--small usage-chart__timeframe ${timeframe === option ? 'usage-chart__timeframe--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={timeframe === option}
              onClick={() => setTimeframe(option)}
            >
              {option === 'day' ? 'Day' : option === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {!hasAnyData ? (
        <p className="usage-chart__empty">
          No recorded doses in this timeframe yet.
        </p>
      ) : null}

      <div className="usage-chart__scroll">
        <div className="usage-chart__plot">
          <div className="usage-chart__y-axis" aria-hidden="true">
            {[...axisTicks].reverse().map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>

          <div className="usage-chart__canvas">
            <div className="usage-chart__grid" aria-hidden="true">
              {[...axisTicks].reverse().map((tick) => {
                const position = (tick / chartMax) * 100
                return (
                  <span
                    key={tick}
                    className="usage-chart__grid-line"
                    style={{ bottom: `${position}%` }}
                  />
                )
              })}
            </div>

            <div className="usage-chart__bars">
              {points.map((point) => {
                const barHeight = `${(point.count / chartMax) * 100}%`
                return (
                  <div
                    key={point.id}
                    className="usage-chart__bar-group"
                    title={`${point.title}: ${point.count} ${point.count === 1 ? 'dose' : 'doses'}`}
                  >
                    <span className="usage-chart__bar-value">
                      {point.count}
                    </span>
                    <div className="usage-chart__bar-track">
                      <span
                        className="usage-chart__bar"
                        style={{ height: barHeight }}
                      />
                    </div>
                    <span className="usage-chart__bar-label">
                      {formatValueLabel(point, timeframe)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
