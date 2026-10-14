const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const MAX_RECOMMENDED_CHARS = 1_000_000 // ~1MB of text

export function isValidUuid(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return UUID_REGEX.test(id.trim())
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback RFC4122 v4 UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function extractWorkspaceIdFromInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  // If user pasted a full URL like https://syncpad.app/room/abc-... or /room/abc-...
  const match = trimmed.match(/room\/([0-9a-fA-F-]+)/)
  if (match && match[1]) {
    return match[1]
  }

  return trimmed
}
