import { describe, it, expect } from 'vitest'
import {
  isValidWorkspaceId,
  generateShortId,
  extractWorkspaceIdFromInput,
} from '../utils/validation'

describe('validation utility', () => {
  it('validates short IDs, custom room slugs, and standard UUIDs', () => {
    // Short 6-char IDs
    expect(isValidWorkspaceId('k8m2p9')).toBe(true)
    expect(isValidWorkspaceId('x7q4zw')).toBe(true)

    // Custom room names
    expect(isValidWorkspaceId('my-code')).toBe(true)
    expect(isValidWorkspaceId('team_standup_2026')).toBe(true)

    // Full UUIDs
    expect(isValidWorkspaceId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isValidWorkspaceId('ecfa1a8f-4514-4653-8a56-f2af4b3afdef')).toBe(true)

    // Invalid inputs
    expect(isValidWorkspaceId('a')).toBe(false) // too short
    expect(isValidWorkspaceId('')).toBe(false)
    expect(isValidWorkspaceId('room with spaces')).toBe(false)
    expect(isValidWorkspaceId('room@invalid!')).toBe(false)
  })

  it('generates short 6-character room IDs', () => {
    const id = generateShortId(6)
    expect(id).toHaveLength(6)
    expect(isValidWorkspaceId(id)).toBe(true)
  })

  it('extracts workspace ID from user inputs and URLs', () => {
    // Plain short ID
    expect(extractWorkspaceIdFromInput('k8m2p9')).toBe('k8m2p9')
    expect(extractWorkspaceIdFromInput('  my-room  ')).toBe('my-room')

    // Full URL
    expect(
      extractWorkspaceIdFromInput('https://moderncs.netlify.app/room/k8m2p9')
    ).toBe('k8m2p9')

    // Relative URL
    expect(extractWorkspaceIdFromInput('/room/team-code')).toBe('team-code')

    // UUID URL
    expect(
      extractWorkspaceIdFromInput('https://moderncs.netlify.app/room/ecfa1a8f-4514-4653-8a56-f2af4b3afdef')
    ).toBe('ecfa1a8f-4514-4653-8a56-f2af4b3afdef')
  })
})
