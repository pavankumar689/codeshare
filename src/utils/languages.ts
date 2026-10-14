import type { Extension } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { sql } from '@codemirror/lang-sql'
import { markdown } from '@codemirror/lang-markdown'
import type { SupportedLanguage } from '../types/workspace'

export interface LanguageConfig {
  id: SupportedLanguage
  label: string
  extension: string
  mimeType: string
  getExtension: () => Extension[]
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: 'plaintext',
    label: 'Plain Text',
    extension: '.txt',
    mimeType: 'text/plain',
    getExtension: () => [],
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    extension: '.js',
    mimeType: 'text/javascript',
    getExtension: () => [javascript({ jsx: true, typescript: false })],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    extension: '.ts',
    mimeType: 'text/typescript',
    getExtension: () => [javascript({ jsx: true, typescript: true })],
  },
  {
    id: 'python',
    label: 'Python',
    extension: '.py',
    mimeType: 'text/x-python',
    getExtension: () => [python()],
  },
  {
    id: 'java',
    label: 'Java',
    extension: '.java',
    mimeType: 'text/x-java-source',
    getExtension: () => [java()],
  },
  {
    id: 'c',
    label: 'C',
    extension: '.c',
    mimeType: 'text/x-c',
    getExtension: () => [cpp()],
  },
  {
    id: 'cpp',
    label: 'C++',
    extension: '.cpp',
    mimeType: 'text/x-c++src',
    getExtension: () => [cpp()],
  },
  {
    id: 'html',
    label: 'HTML',
    extension: '.html',
    mimeType: 'text/html',
    getExtension: () => [html()],
  },
  {
    id: 'css',
    label: 'CSS',
    extension: '.css',
    mimeType: 'text/css',
    getExtension: () => [css()],
  },
  {
    id: 'json',
    label: 'JSON',
    extension: '.json',
    mimeType: 'application/json',
    getExtension: () => [json()],
  },
  {
    id: 'sql',
    label: 'SQL',
    extension: '.sql',
    mimeType: 'text/x-sql',
    getExtension: () => [sql()],
  },
  {
    id: 'markdown',
    label: 'Markdown',
    extension: '.md',
    mimeType: 'text/markdown',
    getExtension: () => [markdown()],
  },
]

export function getLanguageConfig(id: string): LanguageConfig {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.id === id)
  return found || SUPPORTED_LANGUAGES[0]
}
