import { useRef, useState } from 'react'
import {
  generateEmail,
  type GenerateEmailRequest,
  type GenerateEmailResponse,
} from '../api/emailApi'

export function useGenerateEmail() {
  const [data, setData] = useState<GenerateEmailResponse | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  async function generate(payload: GenerateEmailRequest) {
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)
    setData(null)
    setStreamingText('')
    try {
      const result = await generateEmail(
        payload,
        (chunk) => setStreamingText((prev) => prev + chunk),
        controller.signal,
      )
      setData(result)
      return result
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null
      const message = err instanceof Error ? err.message : 'Failed to generate email'
      setError(message)
      return null
    } finally {
      setLoading(false)
      controllerRef.current = null
    }
  }

  function stop() {
    controllerRef.current?.abort()
  }

  return { data, streamingText, loading, error, generate, stop }
}
