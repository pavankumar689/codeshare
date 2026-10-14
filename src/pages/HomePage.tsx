import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  ArrowRight,
  Zap,
  ShieldAlert,
  Terminal,
  Cpu,
  Sparkles,
} from 'lucide-react'
import { Header } from '../components/Header'
import { EnvNoticeBanner } from '../components/EnvNoticeBanner'
import { ToastContainer } from '../components/Toast'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { generateShortId, extractWorkspaceIdFromInput, isValidWorkspaceId } from '../utils/validation'
import type { ToastMessage } from '../types/workspace'

interface HomePageProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate()
  const [workspaceInput, setWorkspaceInput] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string
  ) => {
    const id = generateShortId(6)
    setToasts((prev) => [...prev, { id, type, title, description }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const handleCreateWorkspace = () => {
    const newId = generateShortId(6)
    navigate(`/room/${newId}`)
  }

  const handleJoinWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    const extractedId = extractWorkspaceIdFromInput(workspaceInput)

    if (!extractedId) {
      addToast('warning', 'Input required', 'Please enter a room name, short ID, or paste a link.')
      return
    }

    if (!isValidWorkspaceId(extractedId)) {
      addToast(
        'error',
        'Invalid room name',
        'Room names can contain letters, numbers, hyphens, and underscores (e.g. "team-code" or "k8m2p9").'
      )
      return
    }

    navigate(`/room/${extractedId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToast={addToast}
      />

      {!isSupabaseConfigured && <EnvNoticeBanner />}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 max-w-5xl mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Cross-Device Shared Clipboard & Code Editor</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-center max-w-3xl leading-[1.15] mb-6">
          Real-time code and text sharing,{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            synchronized across every screen.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 text-center max-w-2xl mb-10 leading-relaxed">
          Paste code, configuration, logs, or notes on your laptop and watch them
          appear instantly on your phone or coworker’s screen. Powered by Supabase Realtime and CodeMirror 6.
        </p>

        {/* Action Card */}
        <div className="w-full max-w-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-md mb-12">
          {/* Create New Button */}
          <button
            type="button"
            onClick={handleCreateWorkspace}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-600/25 group mb-6"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create New Workspace</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
            </div>
            <span className="relative px-3 bg-white dark:bg-zinc-900 text-xs text-slate-400 uppercase tracking-wider font-medium">
              or open existing room
            </span>
          </div>

          {/* Join Existing Input */}
          <form onSubmit={handleJoinWorkspace} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter room name (e.g. my-code) or paste link..."
              value={workspaceInput}
              onChange={(e) => setWorkspaceInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-colors shrink-0"
            >
              Open
            </button>
          </form>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl text-left mb-12">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Zero-Refresh Live Sync
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Updates broadcast via Supabase Realtime Postgres Changes without refreshing or reloading.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
              CodeMirror 6 Editor
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Syntax highlighting for JS, TS, Python, Java, C++, JSON, SQL, and Markdown with line numbers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Safe Concurrency Control
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Monotonic document revisions and optimistic locking prevent stale updates from overwriting data.
            </p>
          </div>
        </div>

        {/* Public Sharing Notice */}
        <div className="w-full max-w-4xl p-4 rounded-xl bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-slate-800 dark:text-zinc-200">
              Anonymous Workspace Notice:
            </strong>{' '}
            SyncPad workspaces are public to anyone holding the workspace link. Anyone with the URL can view and edit content. Do not store passwords, API keys, or private sensitive secrets in public workspaces.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/80 py-6 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>SyncPad — Built with React, TypeScript, Vite, CodeMirror 6 & Supabase Realtime.</p>
      </footer>

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  )
}
