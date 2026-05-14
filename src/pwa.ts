import { registerSW } from 'virtual:pwa-register'

export const PWA_OFFLINE_READY_EVENT = 'meditrack:pwa-offline-ready'
export const PWA_NEED_REFRESH_EVENT = 'meditrack:pwa-need-refresh'

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null

export function registerPwa() {
  updateServiceWorker = registerSW({
    immediate: true,
    onOfflineReady() {
      window.dispatchEvent(new Event(PWA_OFFLINE_READY_EVENT))
    },
    onNeedRefresh() {
      window.dispatchEvent(new Event(PWA_NEED_REFRESH_EVENT))
    },
  })
}

export async function updatePwa() {
  if (!updateServiceWorker) {
    return
  }

  await updateServiceWorker(true)
}
