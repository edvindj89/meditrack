import { useEffect, useMemo, useState } from 'react'
import {
  PWA_NEED_REFRESH_EVENT,
  PWA_OFFLINE_READY_EVENT,
  updatePwa,
} from '../pwa'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

function getStandaloneState() {
  const isStandaloneDisplayMode = window.matchMedia(
    '(display-mode: standalone)',
  ).matches
  const isIosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

  return isStandaloneDisplayMode || isIosStandalone
}

export function usePwaStatus() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [offlineReady, setOfflineReady] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  const [isStandalone, setIsStandalone] = useState(() =>
    typeof window === 'undefined' ? false : getStandaloneState(),
  )

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setInstallEvent(null)
      setIsStandalone(true)
    }

    function handleOfflineReady() {
      setOfflineReady(true)
    }

    function handleNeedRefresh() {
      setNeedRefresh(true)
    }

    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener(PWA_OFFLINE_READY_EVENT, handleOfflineReady)
    window.addEventListener(PWA_NEED_REFRESH_EVENT, handleNeedRefresh)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener(PWA_OFFLINE_READY_EVENT, handleOfflineReady)
      window.removeEventListener(PWA_NEED_REFRESH_EVENT, handleNeedRefresh)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installHint = useMemo(() => {
    if (isStandalone) {
      return 'Installed on this device.'
    }

    if (installEvent) {
      return 'Install Meditrack for quick access from your home screen.'
    }

    return 'On iPhone, open in Safari and use Share → Add to Home Screen.'
  }, [installEvent, isStandalone])

  async function promptInstall() {
    if (!installEvent) {
      return
    }

    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  return {
    canInstall: installEvent !== null,
    installHint,
    isOnline,
    isStandalone,
    needRefresh,
    offlineReady,
    dismissOfflineReady: () => setOfflineReady(false),
    dismissNeedRefresh: () => setNeedRefresh(false),
    promptInstall,
    refreshApp: updatePwa,
  }
}
