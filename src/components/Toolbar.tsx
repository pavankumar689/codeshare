import React, { useState } from 'react'
import {
  Copy,
  Check,
  Trash2,
  Download,
  Code,
  Clock,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react'
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages'
import { countCharacters, countWords, countLines, formatRelativeTime } from '../utils/stats'
import type { SupportedLanguage, SaveStatus } from '../types/workspace'

interface ToolbarProps {
  content: string
  language: SupportedLanguage
  saveStatus: SaveStatus
  lastSavedAt: string | null
  onLanguageChange: (lang: SupportedLanguage) => void
  onClearClick: () => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, description?: string) => void
  hasConflict?: boolean
  onAcceptServer?: () => void
  onOverwriteServer?: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  content,
  language,
  saveStatus,
  lastSavedAt,
  onLanguageChange,
  onClearClick,
  onToast,
  hasConflict = false,
  onAcceptServer,
  onOverwriteServer,
}) => {
  const [copiedAll, setCopiedAll] = useState(false)

  const charCount = countCharacters(content)
  const wordCount = countWords(content)
  const lineCount = countLines(content)
  const langConfig = getLanguageConfig(language)

  const handleCopyAll = async () => {
    if (!content) {
      onToast('info', 'Clipboard empty', 'No content to copy in this workspace.')
      return
    }
    try {
      await navigator.clipboard.writeText(content)
      setCopiedAll(true)
      onToast('success', 'Content copied', `${charCount.toLocaleString()} characters copied to clipboard.`)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {
      onToast('error', 'Clipboard error', 'Failed to copy content to clipboard.')
    }
  }

  const handleDownload = () => {
    if (!content) {
      onToast('info', 'Nothing to download', 'Workspace is empty.')
      return
    }

    try {
      const blob = new Blob([content], { type: `${langConfig.mimeType};charset=utf-8` })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      a.href = url
      a.download = `syncpad-${timestamp}${langConfig.extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onToast('success', 'File downloaded', `Saved as ${a.download}`)
    } catch (err) {
      console.error(err)
      onToast('error', 'Download error', 'Failed to generate download file.')
    }
  }

  return (
    <div className="w-full border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left controls: Language selection, Copy All, Clear, Download */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm">
          <Code className="w-3.5 h-3.5 text-indigo-500" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-transparent text-slate-800 dark:text-zinc-200 font-medium focus:outline-none cursor-pointer pr-1"
            title="Select syntax highlighting language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                {lang.label} ({lang.extension})
              </option>
            ))}
          </select>
        </div>

        {/* Copy All */}
        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
          title="Copy entire document to clipboard"
        >
          {copiedAll ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
        </button>

        {/* Download File */}
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
          title={`Download as ${langConfig.extension}`}
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download</span>
        </button>

        {/* Clear Workspace */}
        <button
          type="button"
          onClick={onClearClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-rose-600 dark:text-rose-400 bg-white dark:bg-zinc-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
          title="Clear all workspace content"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Clear</span>
        </button>

        {/* Concurrency Conflict Banner Action */}
        {hasConflict && onAcceptServer && onOverwriteServer && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce shrink-0" />
            <span className="font-semibold">Conflict:</span>
            <button
              onClick={onAcceptServer}
              className="underline hover:text-rose-800 dark:hover:text-rose-100 font-medium inline-flex items-center gap-1 ml-1"
              title="Discard your pending edits and load the latest server version"
            >
              <RotateCcw className="w-3 h-3" />
              Use Server
            </button>
            <span>|</span>
            <button
              onClick={onOverwriteServer}
              className="underline hover:text-rose-800 dark:hover:text-rose-100 font-medium inline-flex items-center gap-1"
              title="Force save your local changes to the server"
            >
              <CheckCircle className="w-3 h-3" />
              Overwrite
            </button>
          </div>
        )}
      </div>

      {/* Right stats: Words, Chars, Lines, Last Saved */}
      <div className="flex items-center gap-3.5 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
        <div className="flex items-center gap-1" title="Total lines">
          <FileText className="w-3 h-3 opacity-70" />
          <span>{lineCount.toLocaleString()} {lineCount === 1 ? 'line' : 'lines'}</span>
        </div>

        <div title="Total words">
          <span>{wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}</span>
        </div>

        <div title="Total characters">
          <span>{charCount.toLocaleString()} chars</span>
        </div>

        <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-zinc-800" title="Last saved to remote database">
          <Clock className="w-3 h-3 opacity-70" />
          <span>{saveStatus === 'saving' ? 'Saving...' : formatRelativeTime(lastSavedAt)}</span>
        </div>
      </div>
    </div>
  )
}
