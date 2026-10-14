export type ConnectionStatus = 'connected' | 'syncing' | 'offline' | 'error'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'conflict' | 'error'

export type SupportedLanguage =
  | 'plaintext'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'html'
  | 'css'
  | 'json'
  | 'sql'
  | 'markdown'

export interface Workspace {
  id: string
  content: string
  language: SupportedLanguage
  version: number
  created_at: string
  updated_at: string
}

export interface WorkspaceUpdateResult {
  success: boolean
  workspace?: Workspace
  conflict?: {
    serverVersion: number
    serverContent: string
    serverLanguage: SupportedLanguage
    serverUpdatedAt: string
  }
  error?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  description?: string
  duration?: number
}
