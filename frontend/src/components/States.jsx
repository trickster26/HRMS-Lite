export function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">{text}</p>
        </div>
    );
}

export function EmptyState({ icon, title, description, action }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                {icon || (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
                    </svg>
                )}
            </div>
            <h3>{title || 'No data found'}</h3>
            <p>{description || 'There are no records to display yet.'}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    return (
        <div className="error-state">
            <div className="error-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h3>Something went wrong</h3>
            <p>{message || 'An error occurred while loading data.'}</p>
            {onRetry && (
                <button className="btn btn-primary" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}
