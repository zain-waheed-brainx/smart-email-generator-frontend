import { EmailForm } from './components/EmailForm'
import { EmailOutput } from './components/EmailOutput'
import { useGenerateEmail } from './hooks/useGenerateEmail'
import './App.css'

function App() {
  const { streamingText, loading, error, generate, stop } = useGenerateEmail()

  return (
    <section id="center">
      <div>
        <h1>Email Generator</h1>
        <p>Describe what you need and get a ready-to-send email.</p>
      </div>

      <div className="layout">
        <EmailForm onSubmit={generate} onStop={stop} loading={loading} />
        <EmailOutput text={streamingText} loading={loading} error={error} />
      </div>
    </section>
  )
}

export default App
