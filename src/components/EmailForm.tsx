import { useEffect, useRef, useState } from 'react'
import type { GenerateEmailRequest } from '../api/emailApi'
import { useSpeechToText } from '../hooks/useSpeechToText'

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

export interface EmailFormValues {
  emailType: string
  tone: string
  details: string
}

interface EmailFormProps {
  onSubmit: (payload: GenerateEmailRequest) => void
  onStop: () => void
  loading: boolean
  prefill?: EmailFormValues | null
}

export function EmailForm({ onSubmit, onStop, loading, prefill }: EmailFormProps) {
  const [emailType, setEmailType] = useState(prefill?.emailType ?? EMAIL_TYPES[0])
  const [tone, setTone] = useState(prefill?.tone ?? TONES[0])
  const [details, setDetails] = useState(prefill?.details ?? '')
  const { supported, listening, transcript, error: speechError, start, stop } = useSpeechToText()
  const baseDetailsRef = useRef('')

  useEffect(() => {
    if (!listening) return
    const combined = transcript
      ? `${baseDetailsRef.current}${baseDetailsRef.current ? ' ' : ''}${transcript}`
      : baseDetailsRef.current
    setDetails(combined.slice(0, MAX_DETAILS_LENGTH))
  }, [transcript, listening])

  function handleMicClick() {
    if (listening) {
      stop()
      return
    }
    baseDetailsRef.current = details
    start()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ emailType, tone, details })
  }

  return (
    <form className="email-form panel" onSubmit={handleSubmit}>
      <h3>Compose</h3>
      <label className="field">
        <span className="field-label">Email type</span>
        <select value={emailType} onChange={(e) => setEmailType(e.target.value)}>
          {EMAIL_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Tone</span>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          {TONES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Details</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={MAX_DETAILS_LENGTH}
          placeholder="What should this email say?"
          disabled={listening}
          required
        />
        <div className="details-controls">
          <div className="details-controls-left">
            {supported && (
              <button
                type="button"
                className="ghost"
                onClick={handleMicClick}
                aria-pressed={listening}
                aria-label={listening ? 'Stop dictating' : 'Dictate details'}
              >
                {listening ? '◼ Stop' : '🎙 Speak'}
              </button>
            )}
            {listening && (
              <span className="pulse-badge">
                <span className="pulse-dot" />
                Listening...
              </span>
            )}
            {speechError && <span className="field-error">{speechError}</span>}
          </div>
          <span className="char-count">
            {details.length}/{MAX_DETAILS_LENGTH}
          </span>
        </div>
      </label>
      <div className="form-actions">
        <button type="submit" className="primary" disabled={loading || details.trim().length === 0}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
        {loading && (
          <button type="button" className="ghost" onClick={onStop}>
            Stop
          </button>
        )}
      </div>
    </form>
  )
}
