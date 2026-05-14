interface PwaPanelProps {
  canInstall: boolean
  installHint: string
  isOnline: boolean
  isStandalone: boolean
  needRefresh: boolean
  offlineReady: boolean
  onInstall: () => void | Promise<void>
  onOpenInstallHelp: () => void
  onRefresh: () => void | Promise<void>
  onDismissOfflineReady: () => void
  onDismissNeedRefresh: () => void
}

export function PwaPanel({
  canInstall,
  installHint,
  isOnline,
  isStandalone,
  needRefresh,
  offlineReady,
  onInstall,
  onOpenInstallHelp,
  onRefresh,
  onDismissOfflineReady,
  onDismissNeedRefresh,
}: PwaPanelProps) {
  return (
    <section className="pwa-panel" aria-label="App install and offline status">
      <div className="pwa-panel__content">
        <div>
          <p className="section-label">Install and offline</p>
          <h2>Use Meditrack like an app</h2>
          <p className="lead lead--compact">{installHint}</p>
          <p className="pwa-panel__status">
            {isOnline ? 'Online' : 'Offline'} ·{' '}
            {isStandalone ? 'Standalone mode' : 'Browser mode'}
          </p>
        </div>
        <div className="pwa-panel__actions">
          {canInstall ? (
            <button
              className="button"
              type="button"
              onClick={() => void onInstall()}
            >
              Install app
            </button>
          ) : null}
          <button
            className="button button--ghost"
            type="button"
            onClick={onOpenInstallHelp}
          >
            Install help
          </button>
        </div>
      </div>

      {offlineReady ? (
        <div className="pwa-panel__notice">
          <p>Offline support is ready after the first load on this device.</p>
          <button
            className="button button--ghost button--small"
            type="button"
            onClick={onDismissOfflineReady}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {needRefresh ? (
        <div className="pwa-panel__notice">
          <p>A newer app version is available.</p>
          <div className="pwa-panel__notice-actions">
            <button
              className="button button--small"
              type="button"
              onClick={() => void onRefresh()}
            >
              Update app
            </button>
            <button
              className="button button--ghost button--small"
              type="button"
              onClick={onDismissNeedRefresh}
            >
              Later
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
