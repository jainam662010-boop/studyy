import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function generateId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function safeDate(date: unknown): Date | null {
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}
