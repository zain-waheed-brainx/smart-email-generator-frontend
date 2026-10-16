import { useState } from 'react'
import { EmailForm, type EmailFormValues } from './components/EmailForm'
import { EmailOutput } from './components/EmailOutput'
import { HistoryList } from './components/HistoryList'
import { useGenerateEmail } from './hooks/useGenerateEmail'
import { useEmailHistory, type EmailHistoryItem } from './hooks/useEmailHistory'
import type { GenerateEmailRequest } from './api/emailApi'
import './App.css'

function App() {
  const { streamingText, loading, error, generate, stop } = useGenerateEmail()
  const history = useEmailHistory()
  const [lastRequest, setLastRequest] = useState<GenerateEmailRequest | null>(null)
  const [historyPreview, setHistoryPreview] = useState<string | null>(null)
  const [prefill, setPrefill] = useState<EmailFormValues | null>(null)
  const [formKey, setFormKey] = useState(0)

  const displayedText = historyPreview ?? streamingText

  async function runGenerate(payload: GenerateEmailRequest) {
    setHistoryPreview(null)
    const result = await generate(payload)
    if (result) {
      history.add({
        emailType: payload.emailType,
        tone: payload.tone,
        details: payload.details,
        subject: result.subject,
        body: result.body,
      })
    }
  }

  function handleSubmit(payload: GenerateEmailRequest) {
    setLastRequest(payload)
    runGenerate(payload)
  }

  function handleRevise(instruction: string) {
    if (!lastRequest) return
    runGenerate({ ...lastRequest, previousEmail: displayedText, instruction })
  }

  function handleRegenerate() {
    if (!lastRequest) return
    runGenerate(lastRequest)
  }

  function handleSelectHistory(item: EmailHistoryItem) {
    setHistoryPreview(`Subject: ${item.subject}\n\n${item.body}`)
    setLastRequest({ emailType: item.emailType, tone: item.tone, details: item.details })
  }

  function handleUseRequest(item: EmailHistoryItem) {
    setPrefill({ emailType: item.emailType, tone: item.tone, details: item.details })
    setFormKey((key) => key + 1)
  }

  return (
    <section id="center">
      <div className="page-header">
        <h1>Email Generator</h1>
        <p>Describe what you need and get a ready-to-send email.</p>
      </div>

      <div className="layout">
        <EmailForm key={formKey} onSubmit={handleSubmit} onStop={stop} loading={loading} prefill={prefill} />
        <EmailOutput
          text={displayedText}
          loading={loading}
          error={error}
          canRevise={Boolean(lastRequest) && !loading}
          onRegenerate={handleRegenerate}
          onRevise={handleRevise}
        />
        <HistoryList
          items={history.items}
          onSelect={handleSelectHistory}
          onUseRequest={handleUseRequest}
          onDelete={history.remove}
          onClear={history.clear}
        />
      </div>
    </section>
  )
}

export default App
