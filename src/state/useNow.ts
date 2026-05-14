import { useEffect, useState } from 'react'

export function useNow(updateIntervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, updateIntervalMs)

    return () => window.clearInterval(intervalId)
  }, [updateIntervalMs])

  return now
}
