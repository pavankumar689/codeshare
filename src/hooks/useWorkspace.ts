import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'
import { workspaceService } from '../services/workspaceService'
import type {
  ConnectionStatus,
  SaveStatus,
  SupportedLanguage,
} from '../types/workspace'

interface UseWorkspaceOptions {
  workspaceId: string
  onToast?: (type: 'success' | 'info' | 'warning' | 'error', title: string, description?: string) => void
}

export function useWorkspace({ workspaceId, onToast }: UseWorkspaceOptions) {
  const [content, setContent] = useState<string>('')
  const [language, setLanguage] = useState<SupportedLanguage>('plaintext')
  const [version, setVersion] = useState<number>(1)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    isSupabaseConfigured ? 'syncing' : 'offline'
  )
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [conflictServerState, setConflictServerState] = useState<{
    version: number
    content: string
    language: SupportedLanguage
    updatedAt: string
  } | null>(null)

  // Mutable refs to prevent stale closures inside debounce and realtime listeners
  const contentRef = useRef<string>('')
  const languageRef = useRef<SupportedLanguage>('plaintext')
  const versionRef = useRef<number>(1)
  const isTypingRef = useRef<boolean>(false)
  const hasPendingEditsRef = useRef<boolean>(false)
  const isSavingRef = useRef<boolean>(false)

  // Keep refs in sync with states
  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    languageRef.current = language
  }, [language])

  useEffect(() => {
    versionRef.current = version
  }, [version])

  // Timer ref for debounce
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const performSaveRef = useRef<((c: string, l: SupportedLanguage) => Promise<void>) | null>(null)

  // Save implementation
  const performSave = useCallback(
    async (contentToSave: string, langToSave: SupportedLanguage) => {
      if (!isSupabaseConfigured) {
        setSaveStatus('saved')
        hasPendingEditsRef.current = false
        return
      }

      isSavingRef.current = true
      setSaveStatus('saving')

      try {
        const expectedVer = versionRef.current
        const result = await workspaceService.updateWorkspace(
          workspaceId,
          contentToSave,
          langToSave,
          expectedVer
        )

        if (result.success && result.workspace) {
          versionRef.current = result.workspace.version
          setVersion(result.workspace.version)
          setLastSavedAt(result.workspace.updated_at)
          setConflictServerState(null)

          // If content didn't change while save was in-flight, mark as saved
          if (contentRef.current === contentToSave && languageRef.current === langToSave) {
            hasPendingEditsRef.current = false
            setSaveStatus('saved')
          } else {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = setTimeout(() => {
              performSaveRef.current?.(contentRef.current, languageRef.current)
            }, 400)
          }
        } else if (result.conflict) {
          // Concurrency conflict: server version advanced
          console.warn('[SyncPad] Version conflict detected:', result.conflict)
          if (result.conflict.serverContent === contentToSave) {
            // Content matches anyway, just advance version
            versionRef.current = result.conflict.serverVersion
            setVersion(result.conflict.serverVersion)
            setLastSavedAt(result.conflict.serverUpdatedAt)
            hasPendingEditsRef.current = false
            setSaveStatus('saved')
          } else {
            setConflictServerState({
              version: result.conflict.serverVersion,
              content: result.conflict.serverContent,
              language: result.conflict.serverLanguage,
              updatedAt: result.conflict.serverUpdatedAt,
            })
            setSaveStatus('conflict')
            onToast?.(
              'warning',
              'Concurrent update conflict',
              'Another device updated this workspace. You can choose to overwrite or accept remote changes.'
            )
          }
        } else {
          setSaveStatus('error')
          onToast?.('error', 'Failed to save', result.error || 'Network error')
        }
      } catch (err: any) {
        console.error('[SyncPad] Save exception:', err)
        setSaveStatus('error')
      } finally {
        isSavingRef.current = false
      }
    },
    [workspaceId, onToast]
  )

  useEffect(() => {
    performSaveRef.current = performSave
  }, [performSave])

  const scheduleSave = useCallback((c: string, l: SupportedLanguage) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      performSaveRef.current?.(c, l)
    }, 400)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Handle local content update (from editor)
  const updateContent = useCallback(
    (newContent: string) => {
      if (newContent === contentRef.current) return

      contentRef.current = newContent
      setContent(newContent)
      isTypingRef.current = true
      hasPendingEditsRef.current = true
      setSaveStatus('unsaved')

      scheduleSave(newContent, languageRef.current)
    },
    [scheduleSave]
  )

  // Handle local language update
  const updateLanguage = useCallback(
    (newLanguage: SupportedLanguage) => {
      if (newLanguage === languageRef.current) return

      languageRef.current = newLanguage
      setLanguage(newLanguage)
      hasPendingEditsRef.current = true
      setSaveStatus('unsaved')

      scheduleSave(contentRef.current, newLanguage)
    },
    [scheduleSave]
  )

  // Reconcile and load remote workspace
  const loadWorkspace = useCallback(async () => {
    if (!workspaceId) return

    setIsLoading(true)
    setLoadError(null)

    if (!isSupabaseConfigured) {
      // In offline/unconfigured environment, initialize clean local workspace
      setContent('')
      setLanguage('plaintext')
      setVersion(1)
      setSaveStatus('saved')
      setIsLoading(false)
      return
    }

    try {
      setConnectionStatus('syncing')
      let ws = await workspaceService.getWorkspace(workspaceId)

      if (!ws) {
        // Workspace doesn't exist yet on server; automatically create it
        ws = await workspaceService.createWorkspace(workspaceId, '', 'plaintext')
        onToast?.('info', 'Workspace created', 'A new remote workspace has been initialized.')
      }

      setContent(ws.content)
      setLanguage(ws.language)
      setVersion(ws.version)
      versionRef.current = ws.version
      contentRef.current = ws.content
      languageRef.current = ws.language
      setLastSavedAt(ws.updated_at)
      setSaveStatus('saved')
      hasPendingEditsRef.current = false
      setConnectionStatus('connected')
    } catch (err: any) {
      console.error('[SyncPad] Failed to load workspace:', err)
      setLoadError(err.message || 'Failed to load workspace')
      setConnectionStatus('error')
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId, onToast])

  // Conflict resolution actions
  const resolveConflictAcceptServer = useCallback(() => {
    if (!conflictServerState) return
    setContent(conflictServerState.content)
    setLanguage(conflictServerState.language)
    setVersion(conflictServerState.version)
    versionRef.current = conflictServerState.version
    contentRef.current = conflictServerState.content
    languageRef.current = conflictServerState.language
    setLastSavedAt(conflictServerState.updatedAt)
    setConflictServerState(null)
    hasPendingEditsRef.current = false
    setSaveStatus('saved')
    onToast?.('info', 'Remote version loaded', 'Workspace updated to server version.')
  }, [conflictServerState, onToast])

  const resolveConflictOverwriteServer = useCallback(() => {
    if (!conflictServerState) return
    // Force version to server version so next write increments cleanly
    versionRef.current = conflictServerState.version
    setVersion(conflictServerState.version)
    setConflictServerState(null)
    performSave(contentRef.current, languageRef.current)
    onToast?.('info', 'Overwriting server', 'Saving local version to server.')
  }, [conflictServerState, performSave, onToast])

  // Setup Supabase Realtime subscription & reconnection handlers
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadWorkspace()

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }

    // Subscribe to Postgres changes on workspaces table for this workspace id
    const channelName = `syncpad_room_${workspaceId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workspaces',
          filter: `id=eq.${workspaceId}`,
        },
        (payload) => {
          const remoteRecord = payload.new as any
          if (!remoteRecord) return

          const remoteVersion = Number(remoteRecord.version ?? 0)

          // Discard echo or outdated updates
          if (remoteVersion <= versionRef.current) {
            return
          }

          const remoteContent = remoteRecord.content ?? ''
          const remoteLanguage = (remoteRecord.language as SupportedLanguage) || 'plaintext'
          const remoteUpdatedAt = remoteRecord.updated_at

          // Check if local device has pending unsaved typing
          if (hasPendingEditsRef.current && remoteContent !== contentRef.current) {
            // Local edits exist and differ from server: show conflict resolution
            setConflictServerState({
              version: remoteVersion,
              content: remoteContent,
              language: remoteLanguage,
              updatedAt: remoteUpdatedAt,
            })
            setSaveStatus('conflict')
            onToast?.(
              'warning',
              'Incoming remote update',
              'Another user updated this workspace while you had unsaved edits.'
            )
          } else {
            // Smoothly apply remote update without disrupting user
            contentRef.current = remoteContent
            languageRef.current = remoteLanguage
            versionRef.current = remoteVersion
            setContent(remoteContent)
            setLanguage(remoteLanguage)
            setVersion(remoteVersion)
            setLastSavedAt(remoteUpdatedAt)
            setSaveStatus('saved')
            hasPendingEditsRef.current = false
            setConflictServerState(null)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('error')
        } else if (status === 'CLOSED') {
          setConnectionStatus('offline')
        }
      })

    // Listen to network online / offline events
    const handleOnline = () => {
      setConnectionStatus('syncing')
      // Re-fetch latest server state to reconcile missed changes
      loadWorkspace()
    }

    const handleOffline = () => {
      setConnectionStatus('offline')
      onToast?.(
        'warning',
        'Device offline',
        'Changes will be saved once internet connection is restored.'
      )
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      channel.unsubscribe()
      supabase?.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [workspaceId, loadWorkspace, onToast])

  return {
    content,
    language,
    version,
    connectionStatus,
    saveStatus,
    lastSavedAt,
    isLoading,
    loadError,
    conflictServerState,
    updateContent,
    updateLanguage,
    refresh: loadWorkspace,
    resolveConflictAcceptServer,
    resolveConflictOverwriteServer,
  }
}
