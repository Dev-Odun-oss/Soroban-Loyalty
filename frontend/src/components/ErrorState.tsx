interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state-container" role="alert">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="28" fill="#1a1d27" stroke="#ef4444" strokeWidth="2" />
        <path d="M32 20v16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="42" r="2" fill="#ef4444" />
      </svg>
      <p className="empty-state-description" style={{ color: "var(--text-primary)" }}>{message}</p>
      <button onClick={onRetry} className="btn btn-primary empty-state-cta">
        Try again
      </button>
    </div>
  );
}
