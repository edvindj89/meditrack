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
      <div className="pwa-panel__content pwa-panel__content--compact">
        <div className="pwa-panel__summary">
          <p className="section-label">Install</p>
          <p className="pwa-panel__hint">{installHint}</p>
          <p className="pwa-panel__status">
            {isOnline ? 'Online' : 'Offline'} ·{' '}
            {isStandalone ? 'Standalone' : 'Browser'}
          </p>
        </div>
        <div className="pwa-panel__actions">
          {canInstall ? (
            <button
              className="button button--small"
              type="button"
              onClick={() => void onInstall()}
            >
              Install
            </button>
          ) : null}
          <button
            className="button button--ghost button--small"
            type="button"
            onClick={onOpenInstallHelp}
          >
            Help
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
