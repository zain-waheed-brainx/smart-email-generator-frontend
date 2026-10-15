import { useState } from 'react'
import type { GenerateEmailRequest } from '../api/emailApi'

const EMAIL_TYPES = [
  'leave request',
  'invoice reminder',
  'job application',
  'follow-up',
  'complaint',
  'thank you',
]

const TONES = ['formal', 'casual', 'friendly', 'firm']

const MAX_DETAILS_LENGTH = 1000

interface EmailFormProps {
  onSubmit: (payload: GenerateEmailRequest) => void
  onStop: () => void
  loading: boolean
}

export function EmailForm({ onSubmit, onStop, loading }: EmailFormProps) {
  const [emailType, setEmailType] = useState(EMAIL_TYPES[0])
  const [tone, setTone] = useState(TONES[0])
  const [details, setDetails] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ emailType, tone, details })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email type
        <select value={emailType} onChange={(e) => setEmailType(e.target.value)}>
          {EMAIL_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tone
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          {TONES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Details
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={MAX_DETAILS_LENGTH}
          required
        />
        <span>
          {details.length}/{MAX_DETAILS_LENGTH}
        </span>
      </label>
      <button type="submit" disabled={loading || details.trim().length === 0}>
        {loading ? 'Generating…' : 'Generate'}
      </button>
      {loading && (
        <button type="button" onClick={onStop}>
          Stop
        </button>
      )}
    </form>
  )
}
