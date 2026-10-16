import type { EmailHistoryItem } from '../hooks/useEmailHistory'

interface HistoryListProps {
  items: EmailHistoryItem[]
  onSelect: (item: EmailHistoryItem) => void
  onUseRequest: (item: EmailHistoryItem) => void
  onDelete: (id: string) => void
  onClear: () => void
}

export function HistoryList({ items, onSelect, onUseRequest, onDelete, onClear }: HistoryListProps) {
  function handleClear() {
    if (window.confirm('Are you sure?')) {
      onClear()
    }
  }

  return (
    <div className="panel history-panel">
      <div className="history-header">
        <h3>History</h3>
        {items.length > 0 && (
          <button type="button" className="ghost danger" onClick={handleClear}>
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="history-empty">No emails yet. Generated emails will show up here.</p>
      ) : (
        <ul className="history-list">
          {items.map((item) => (
            <li key={item.id} className="history-item">
              <button type="button" className="history-item-main" onClick={() => onSelect(item)}>
                <span className="history-item-subject">{item.subject || '(no subject)'}</span>
                <span className="history-item-meta">
                  <span className="history-item-tag">{item.emailType}</span>
                  <span className="history-item-tag">{item.tone}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </span>
              </button>
              <div className="history-item-actions">
                <button type="button" className="ghost" onClick={() => onUseRequest(item)}>
                  Use this request again
                </button>
                <button type="button" className="danger" onClick={() => onDelete(item.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
