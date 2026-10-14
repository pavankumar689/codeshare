export function countWords(text: string): number {
  if (!text.trim()) return 0
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

export function countCharacters(text: string): number {
  return text.length
}

export function countLines(text: string): number {
  if (!text) return 1
  return text.split('\n').length
}

export function formatByteSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Never'

  const now = new Date()
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < 2) return 'Just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}
