import { splitEmail } from '../utils/splitEmail'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export interface GenerateEmailRequest {
  emailType: string
  tone: string
  details: string
  previousEmail?: string
  instruction?: string
}

export interface GenerateEmailResponse {
  subject: string
  body: string
  usage?: unknown
}

type StreamEvent =
  | { type: 'text'; text: string }
  | { type: 'usage'; usage: unknown }
  | { type: 'error'; message: string }
  | { type: 'done' }

export async function generateEmail(
  payload: GenerateEmailRequest,
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
): Promise<GenerateEmailResponse> {
  const res = await fetch(`${BASE_URL}/emails/generate/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok || !res.body) {
    const error = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(error?.message ?? 'Failed to generate email')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''
  let usage: unknown

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const event = JSON.parse(line.slice(6)) as StreamEvent

      if (event.type === 'text') {
        fullText += event.text
        onChunk?.(event.text)
      } else if (event.type === 'usage') {
        usage = event.usage
      } else if (event.type === 'error') {
        throw new Error(event.message)
      }
    }
  }

  const { subject, body } = splitEmail(fullText)

  return { subject, body, usage }
}
