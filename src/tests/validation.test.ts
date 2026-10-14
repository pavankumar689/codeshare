import { describe, it, expect } from 'vitest'
import {
  isValidUuid,
  generateUuid,
  extractWorkspaceIdFromInput,
} from '../utils/validation'

describe('validation utility', () => {
  it('validates standard UUID v4 strings', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true)
    expect(isValidUuid('not-a-uuid')).toBe(false)
    expect(isValidUuid('')).toBe(false)
    expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false)
  })

  it('generates valid UUID v4', () => {
    const uuid = generateUuid()
    expect(isValidUuid(uuid)).toBe(true)
  })

  it('extracts workspace UUID from various user input formats', () => {
    const testUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

    // Plain UUID
    expect(extractWorkspaceIdFromInput(testUuid)).toBe(testUuid)
    expect(extractWorkspaceIdFromInput(`  ${testUuid}  `)).toBe(testUuid)

    // Full URL
    expect(
      extractWorkspaceIdFromInput(`https://syncpad.netlify.app/room/${testUuid}`)
    ).toBe(testUuid)

    // Relative URL
    expect(extractWorkspaceIdFromInput(`/room/${testUuid}`)).toBe(testUuid)
  })
})
