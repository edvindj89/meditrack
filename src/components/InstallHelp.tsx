interface InstallHelpProps {
  onClose: () => void
}

export function InstallHelp({ onClose }: InstallHelpProps) {
  return (
    <section className="install-help" aria-label="Install help">
      <div className="install-help__header">
        <div>
          <p className="section-label">Install help</p>
          <h2>Install Meditrack on your phone</h2>
        </div>
        <button
          className="button button--ghost button--small"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="install-help__grid">
        <article className="install-help__card">
          <h3>Android</h3>
          <ol>
            <li>Open Meditrack in Chrome.</li>
            <li>Wait until the page fully loads.</li>
            <li>
              Tap <strong>Install app</strong> if Chrome offers it.
            </li>
            <li>
              If not, open the Chrome menu and choose{' '}
              <strong>Install app</strong> or{' '}
              <strong>Add to Home screen</strong>.
            </li>
            <li>Confirm the install.</li>
            <li>Launch Meditrack from its new app icon.</li>
          </ol>
        </article>

        <article className="install-help__card">
          <h3>iPhone</h3>
          <ol>
            <li>Open Meditrack in Safari.</li>
            <li>
              Tap the <strong>Share</strong> button.
            </li>
            <li>
              Choose <strong>Add to Home Screen</strong>.
            </li>
            <li>Confirm the name and add it.</li>
            <li>Launch Meditrack from the new home screen icon.</li>
          </ol>
        </article>
      </div>

      <div className="install-help__note">
        <p>
          For real install and offline testing, open Meditrack from an
          <strong> HTTPS </strong>
          address.
        </p>
        <p>
          After the first successful load, the app should keep opening even when
          the phone is offline.
        </p>
      </div>
    </section>
  )
}
