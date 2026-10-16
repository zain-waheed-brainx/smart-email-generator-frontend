import { useEffect, useState } from 'react'

export interface EmailHistoryItem {
  id: string
  emailType: string
  tone: string
  details: string
  subject: string
  body: string
  createdAt: number
}

const STORAGE_KEY = 'email-history'
const MAX_ITEMS = 3

function loadItems(): EmailHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EmailHistoryItem[]) : []
  } catch {
    return []
  }
}

export function useEmailHistory() {
  const [items, setItems] = useState<EmailHistoryItem[]>(loadItems)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable (e.g. private mode) — history stays in memory only
    }
  }, [items])

  function add(item: Omit<EmailHistoryItem, 'id' | 'createdAt'>) {
    const newItem: EmailHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    setItems((prev) => [newItem, ...prev].slice(0, MAX_ITEMS))
    return newItem
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((existing) => existing.id !== id))
  }

  function clear() {
    setItems([])
  }

  return { items, add, remove, clear }
}
