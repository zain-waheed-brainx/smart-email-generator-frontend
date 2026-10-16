import { useEffect, useRef, useState } from 'react'

interface SpeechRecognitionResultAlternative {
  transcript: string
}

interface SpeechRecognitionResultEntry {
  isFinal: boolean
  0: SpeechRecognitionResultAlternative
}

interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<SpeechRecognitionResultEntry>
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognition

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined

function errorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
      return 'Microphone access was blocked'
    case 'no-speech':
      return 'No speech was detected'
    default:
      return 'Speech recognition failed'
  }
}

export function useSpeechToText() {
  const supported = Boolean(SpeechRecognitionImpl)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (!SpeechRecognitionImpl) return

    const recognition = new SpeechRecognitionImpl()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      setError(errorMessage(event.error))
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  function start() {
    if (!recognitionRef.current) return
    setError(null)
    setTranscript('')
    setListening(true)
    recognitionRef.current.start()
  }

  function stop() {
    recognitionRef.current?.stop()
  }

  return { supported, listening, transcript, error, start, stop }
}
