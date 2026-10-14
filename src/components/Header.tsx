import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Code2,
  Copy,
  Check,
  Plus,
  Share2,
  Sun,
  Moon,
  CloudCheck,
  CloudOff,
  CloudRain,
  ArrowUpRight,
} from 'lucide-react'
import { ConnectionStatusBadge } from './ConnectionStatusBadge'
import { generateShortId } from '../utils/validation'
import type { ConnectionStatus, SaveStatus } from '../types/workspace'

interface HeaderProps {
  workspaceId?: string
  connectionStatus?: ConnectionStatus
  saveStatus?: SaveStatus
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, description?: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  workspaceId,
  connectionStatus = 'connected',
  saveStatus = 'saved',
  theme,
  onToggleTheme,
  onToast,
}) => {
  const navigate = useNavigate()
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const handleCreateNew = () => {
    const newId = generateShortId(6)
    navigate(`/room/${newId}`)
    onToast('success', 'New room ready', 'Created a fresh, short room link.')
  }

  const handleCopyLink = async () => {
    if (!workspaceId) return
    const shareUrl = `${window.location.origin}/room/${workspaceId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      onToast('success', 'Share link copied', 'Anyone with this link can view and edit this room in real time.')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      onToast('error', 'Clipboard error', 'Failed to copy URL to clipboard.')
    }
  }

  const handleCopyId = async () => {
    if (!workspaceId) return
    try {
      await navigator.clipboard.writeText(workspaceId)
      setCopiedId(true)
      onToast('info', 'Workspace ID copied', workspaceId)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      onToast('error', 'Clipboard error', 'Failed to copy ID to clipboard.')
    }
  }

  // Render save indicator
  const renderSaveIndicator = () => {
    if (!workspaceId) return null

    switch (saveStatus) {
      case 'saving':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-medium"
            title="Saving changes to remote database..."
          >
            <CloudRain className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Saving...</span>
          </span>
        )
      case 'unsaved':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-medium"
            title="Local changes pending auto-save"
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            <span className="hidden sm:inline">Unsaved</span>
          </span>
        )
      case 'conflict':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium"
            title="Version conflict detected with server"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Conflict</span>
          </span>
        )
      case 'saved':
      default:
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium"
            title="All changes safely synchronized"
          >
            <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Saved</span>
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            title="SyncPad Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                SyncPad
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                  Realtime
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Current Workspace Info */}
        {workspaceId && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">Room:</span>
              <button
                onClick={handleCopyId}
                className="font-mono text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                title="Click to copy full Workspace UUID"
              >
                <span>{workspaceId.length > 14 ? `${workspaceId.slice(0, 8)}...${workspaceId.slice(-4)}` : workspaceId}</span>
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            <ConnectionStatusBadge status={connectionStatus} />
            {renderSaveIndicator()}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {workspaceId ? (
            <>
              {/* Copy Share Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
                title="Copy shareable workspace link to clipboard"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span className="hidden sm:inline">
                  {copiedLink ? 'Link Copied!' : 'Share Link'}
                </span>
              </button>

              {/* Create New Workspace */}
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-600/20"
                title="Create a new workspace with a fresh UUID"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New Room</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
