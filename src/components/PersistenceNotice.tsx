interface PersistenceNoticeProps {
  message: string
  onDismiss: () => void
}

export function PersistenceNotice({
  message,
  onDismiss,
}: PersistenceNoticeProps) {
  return (
    <section className="persistence-notice" role="status" aria-live="polite">
      <p>{message}</p>
      <button
        className="button button--ghost button--small"
        type="button"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </section>
  )
}
