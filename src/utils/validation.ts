const WORKSPACE_ID_REGEX = /^[a-zA-Z0-9_-]{2,64}$/

export const MAX_RECOMMENDED_CHARS = 1_000_000 // ~1MB of text

// 32 unambiguous URL-friendly characters (omitting 0, O, 1, l, I)
const SHORT_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

export function isValidWorkspaceId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return WORKSPACE_ID_REGEX.test(id.trim())
}

// Keep isValidUuid for backward compatibility
export function isValidUuid(id: string): boolean {
  return isValidWorkspaceId(id)
}

/**
 * Generates a short, clean, human-friendly 6-character workspace ID.
 * Example: "m7p2xk", "9bw4zq"
 */
export function generateShortId(length = 6): string {
  let result = ''
  const charactersLength = SHORT_ID_ALPHABET.length

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < length; i++) {
      result += SHORT_ID_ALPHABET[bytes[i] % charactersLength]
    }
    return result
  }

  for (let i = 0; i < length; i++) {
    result += SHORT_ID_ALPHABET.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

// Full UUID generator maintained for fallback or explicit UUID needs
export function generateUuid(): string {
  return generateShortId(6)
}

/**
 * Extracts a workspace ID from user input (raw ID or pasted URL).
 * Handles:
 * - "my-code" -> "my-code"
 * - "https://moderncs.netlify.app/room/my-code" -> "my-code"
 * - "/room/x7k9p2" -> "x7k9p2"
 * - "https://site.com/room/ecfa1a8f-4514-4653-8a56-f2af4b3afdef" -> "ecfa1a8f-4514-4653-8a56-f2af4b3afdef"
 */
export function extractWorkspaceIdFromInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  // If user pasted a full URL or path containing /room/
  const match = trimmed.match(/room\/([a-zA-Z0-9_-]+)/i)
  if (match && match[1]) {
    return match[1]
  }

  // Remove leading slashes if entered like "/my-room"
  return trimmed.replace(/^\/+/, '')
}
