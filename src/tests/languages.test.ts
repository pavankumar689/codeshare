import { describe, it, expect } from 'vitest'
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages'

describe('languages utility', () => {
  it('contains all required programming languages', () => {
    const languageIds = SUPPORTED_LANGUAGES.map((l) => l.id)
    const required = [
      'plaintext',
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'c',
      'html',
      'css',
      'json',
      'sql',
      'markdown',
    ]

    for (const req of required) {
      expect(languageIds).toContain(req)
    }
  })

  it('provides valid file extensions for downloading content', () => {
    expect(getLanguageConfig('javascript').extension).toBe('.js')
    expect(getLanguageConfig('typescript').extension).toBe('.ts')
    expect(getLanguageConfig('python').extension).toBe('.py')
    expect(getLanguageConfig('json').extension).toBe('.json')
    expect(getLanguageConfig('markdown').extension).toBe('.md')
    expect(getLanguageConfig('sql').extension).toBe('.sql')
    expect(getLanguageConfig('plaintext').extension).toBe('.txt')
  })

  it('falls back to plaintext for unknown language IDs', () => {
    const config = getLanguageConfig('unknown-lang-foo')
    expect(config.id).toBe('plaintext')
    expect(config.extension).toBe('.txt')
  })
})
