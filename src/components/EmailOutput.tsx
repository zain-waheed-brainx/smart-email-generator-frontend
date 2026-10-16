import { useState } from 'react'
import { splitEmail } from '../utils/splitEmail'

const MAX_CUSTOM_INSTRUCTION_LENGTH = 300

interface EmailOutputProps {
  text: string
  loading: boolean
  error: string | null
  canRevise: boolean
  onRegenerate: () => void
  onRevise: (instruction: string) => void
}

export function EmailOutput({
  text,
  loading,
  error,
  canRevise,
  onRegenerate,
  onRevise,
}: EmailOutputProps) {
  const { subject, body } = splitEmail(text)
  const [customInstruction, setCustomInstruction] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  function handleCustomSubmit() {
    const instruction = customInstruction.trim()
    if (!instruction) return
    onRevise(instruction)
    setCustomInstruction('')
  }

  if (error) {
    return (
      <div className="panel email-output">
        <h3>Output</h3>
        <div className="error-banner">{error}</div>
      </div>
    )
  }

  return (
    <div className="panel email-output">
      <h3>Output</h3>
      {loading && (
        <span className="pulse-badge">
          <span className="pulse-dot" />
          Writing...
        </span>
      )}

      <div className="field-block">
        <h3>Subject</h3>
        <p className="subject-text">
          {subject || <span className="output-empty">No subject yet</span>}
        </p>
      </div>

      <div className="field-block">
        <h3>Body</h3>
        <p className="body-text">
          {body || <span className="output-empty">Your generated email will appear here.</span>}
        </p>
      </div>

      <div className="primary-actions">
        <button type="button" onClick={handleCopy} disabled={!subject && !body}>
          Copy
        </button>
        {copyStatus === 'copied' && <span className="copy-status">Copied!</span>}
        {copyStatus === 'failed' && <span className="copy-status copy-status-error">Copy failed</span>}
      </div>

      <div className="revise-row">
        <button type="button" onClick={onRegenerate} disabled={!canRevise}>
          Regenerate
        </button>
        <button type="button" onClick={() => onRevise('Make it shorter')} disabled={!canRevise}>
          Shorter
        </button>
        <button type="button" onClick={() => onRevise('Make it more formal')} disabled={!canRevise}>
          More formal
        </button>
        <button type="button" onClick={() => onRevise('Make it more friendly')} disabled={!canRevise}>
          More friendly
        </button>
        <input
          type="text"
          className="custom-instruction"
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          maxLength={MAX_CUSTOM_INSTRUCTION_LENGTH}
          placeholder="Custom change..."
          disabled={!canRevise}
        />
        <button
          type="button"
          className="primary"
          onClick={handleCustomSubmit}
          disabled={!canRevise || !customInstruction.trim()}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
