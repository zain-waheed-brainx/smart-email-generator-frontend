import { splitEmail } from '../utils/splitEmail'

interface EmailOutputProps {
  text: string
  loading: boolean
  error: string | null
}

export function EmailOutput({ text, loading, error }: EmailOutputProps) {
  const { subject, body } = splitEmail(text)

  function handleCopy() {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
  }

  if (error) {
    return (
      <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem' }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {loading && <p>Writing...</p>}

      <div>
        <h3>Subject</h3>
        <p>{subject}</p>
      </div>

      <div>
        <h3>Body</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{body}</p>
      </div>

      <button type="button" onClick={handleCopy} disabled={!subject && !body}>
        Copy
      </button>
    </div>
  )
}
