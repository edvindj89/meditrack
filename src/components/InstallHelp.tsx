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
            <li>
              Tap <strong>Install</strong> if Chrome offers it.
            </li>
            <li>
              If not, open the Chrome menu, tap{' '}
              <strong>Add to Home screen</strong>, then <strong>Install</strong>
              .
            </li>
            <li>Follow the on-screen steps.</li>
            <li>Launch Meditrack from its new app icon.</li>
          </ol>
        </article>

        <article className="install-help__card">
          <h3>iPhone</h3>
          <ol>
            <li>Open Meditrack in Safari.</li>
            <li>
              Tap <strong>Share</strong>. If needed, tap <strong>More</strong>{' '}
              first.
            </li>
            <li>
              Choose <strong>Add to Home Screen</strong>. If you do not see it,
              scroll down, tap <strong>Edit Actions</strong>, and add it.
            </li>
            <li>
              Make sure <strong>Open as Web App</strong> is on, then tap{' '}
              <strong>Add</strong>.
            </li>
            <li>Launch Meditrack from the new Home Screen icon.</li>
          </ol>
        </article>
      </div>

      <div className="install-help__note">
        <p>
          For real install and offline testing on a phone, open Meditrack from
          an <strong>HTTPS</strong> address.
        </p>
        <p>
          After the first successful load, the app should keep opening even when
          the phone is offline.
        </p>
      </div>
    </section>
  )
}
