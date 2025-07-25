import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateTrackTitle(prompt: string, genre: string, mood: string): string {
  const words = prompt.split(' ').filter(word => word.length > 3)
  const keyWord = words[Math.floor(Math.random() * words.length)] || 'Untitled'
  
  const titleTemplates = [
    `${keyWord} in ${genre}`,
    `${mood} ${keyWord}`,
    `${keyWord} Dreams`,
    `${genre} ${keyWord}`,
    `${keyWord} Vibes`,
  ]

  return titleTemplates[Math.floor(Math.random() * titleTemplates.length)]
}

export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  if (!prompt.trim()) {
    return { isValid: false, error: 'Please enter a prompt for your music' }
  }
  
  if (prompt.trim().length < 10) {
    return { isValid: false, error: 'Please provide a more detailed description (at least 10 characters)' }
  }
  
  if (prompt.trim().length > 500) {
    return { isValid: false, error: 'Prompt is too long (maximum 500 characters)' }
  }
  
  return { isValid: true }
}
