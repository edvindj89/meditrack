import { describe, expect, it } from 'vitest'
import { formatDoseSource, formatRelativeDuration } from './time'

describe('time formatting helpers', () => {
  it('formats durations under one minute as just now', () => {
    expect(formatRelativeDuration(0)).toBe('Just now')
    expect(formatRelativeDuration(30_000)).toBe('Just now')
  })

  it('formats mixed hour and minute durations', () => {
    expect(formatRelativeDuration(65 * 60 * 1000)).toBe('1 h 5 min')
  })

  it('formats dose sources clearly', () => {
    expect(formatDoseSource('now')).toBe('Taken now')
    expect(formatDoseSource('backfill')).toBe('Back-registered')
  })
})
