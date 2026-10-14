import { describe, it, expect } from 'vitest'
import {
  countCharacters,
  countWords,
  countLines,
  formatByteSize,
  formatRelativeTime,
} from '../utils/stats'

describe('stats utility', () => {
  it('accurately counts characters', () => {
    expect(countCharacters('')).toBe(0)
    expect(countCharacters('Hello, World!')).toBe(13)
    expect(countCharacters('Line 1\nLine 2')).toBe(13)
  })

  it('accurately counts words with arbitrary whitespace', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
    expect(countWords('SyncPad real-time shared clipboard')).toBe(4)
    expect(countWords('One\nTwo\tThree    Four')).toBe(4)
  })

  it('accurately counts lines', () => {
    expect(countLines('')).toBe(1)
    expect(countLines('First line')).toBe(1)
    expect(countLines('First line\nSecond line\nThird line')).toBe(3)
  })

  it('formats byte sizes cleanly', () => {
    expect(formatByteSize(0)).toBe('0 B')
    expect(formatByteSize(512)).toBe('512 B')
    expect(formatByteSize(2048)).toBe('2 KB')
    expect(formatByteSize(1048576)).toBe('1 MB')
  })

  it('formats relative timestamps', () => {
    expect(formatRelativeTime(null)).toBe('Never')
    expect(formatRelativeTime('')).toBe('Never')
    expect(formatRelativeTime('invalid-date')).toBe('Never')

    const nowIso = new Date().toISOString()
    expect(formatRelativeTime(nowIso)).toBe('Just now')
  })
})
