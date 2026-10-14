import React, { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Toolbar } from '../components/Toolbar'
import { Editor } from '../components/Editor'
import { ClearModal } from '../components/ClearModal'
import { ToastContainer } from '../components/Toast'
import { EnvNoticeBanner } from '../components/EnvNoticeBanner'
import { useWorkspace } from '../hooks/useWorkspace'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { isValidUuid, generateUuid } from '../utils/validation'
import { AlertCircle, RefreshCw, Home, Plus } from 'lucide-react'
import type { ToastMessage } from '../types/workspace'

interface RoomPageProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export const RoomPage: React.FC<RoomPageProps> = ({ theme, onToggleTheme }) => {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)

  const addToast = useCallback(
    (
      type: 'success' | 'info' | 'warning' | 'error',
      title: string,
      description?: string
    ) => {
      const id = generateUuid()
      setToasts((prev) => [...prev, { id, type, title, description }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
    []
  )

  const validId = workspaceId && isValidUuid(workspaceId)

  // Use workspace hook if UUID is valid
  const {
    content,
    language,
    connectionStatus,
    saveStatus,
    lastSavedAt,
    isLoading,
    loadError,
    conflictServerState,
    updateContent,
    updateLanguage,
    refresh,
    resolveConflictAcceptServer,
    resolveConflictOverwriteServer,
  } = useWorkspace({
    workspaceId: validId ? workspaceId! : '',
    onToast: addToast,
  })

  // Handle invalid UUID
  if (!validId) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <Header theme={theme} onToggleTheme={onToggleTheme} onToast={addToast} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invalid Workspace ID</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
            The workspace ID <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-xs">{workspaceId}</code> is not a valid UUID.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <button
              onClick={() => navigate(`/room/${generateUuid()}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Room
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle database loading error
  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <Header
          workspaceId={workspaceId}
          connectionStatus="error"
          saveStatus="error"
          theme={theme}
          onToggleTheme={onToggleTheme}
          onToast={addToast}
        />
        {!isSupabaseConfigured && <EnvNoticeBanner />}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to Load Workspace</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed font-mono text-xs">
            {loadError}
          </p>
          <button
            onClick={() => refresh()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 overflow-hidden">
      <Header
        workspaceId={workspaceId}
        connectionStatus={connectionStatus}
        saveStatus={saveStatus}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToast={addToast}
      />

      {!isSupabaseConfigured && <EnvNoticeBanner />}

      <Toolbar
        content={content}
        language={language}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onLanguageChange={updateLanguage}
        onClearClick={() => setIsClearModalOpen(true)}
        onToast={addToast}
        hasConflict={Boolean(conflictServerState)}
        onAcceptServer={resolveConflictAcceptServer}
        onOverwriteServer={resolveConflictOverwriteServer}
      />

      {/* Main Workspace Workspace Container */}
      <div className="flex-1 relative flex flex-col w-full overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-zinc-500">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-mono">Connecting to workspace room...</span>
            </div>
          </div>
        ) : (
          <Editor
            content={content}
            language={language}
            theme={theme}
            onChange={updateContent}
          />
        )}
      </div>

      {/* Confirmation Modal for Clearing Workspace */}
      <ClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          updateContent('')
          addToast('info', 'Workspace cleared', 'Content has been erased across all connected clients.')
        }}
      />

      {/* Floating Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  )
}
