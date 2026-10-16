export interface SplitEmail {
  subject: string
  body: string
}

export function splitEmail(text: string): SplitEmail {
  const [, subject = '', body = ''] = text.match(/^Subject:\s*(.*)\n+([\s\S]*)$/) ?? []
  return { subject: subject.trim(), body: body.trim() }
}
