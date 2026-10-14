import React, { useState } from 'react'
import { Database, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

export const EnvNoticeBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key`

  const handleCopy = () => {
    navigator.clipboard.writeText(envSample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-200 px-4 py-2.5 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong className="font-semibold">Supabase Credentials Not Detected:</strong>{' '}
            SyncPad is currently operating in local-only offline mode. To enable real-time
            cross-device synchronization, configure your Supabase project.
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 hover:underline shrink-0"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isExpanded ? 'Hide Setup Guide' : 'Setup Instructions'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 max-w-7xl mx-auto space-y-2">
          <p className="text-slate-700 dark:text-zinc-300">
            1. Run the database migration script in Supabase SQL Editor:{' '}
            <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px]">
              supabase/migrations/20240101000000_create_workspaces.sql
            </code>
          </p>
          <p className="text-slate-700 dark:text-zinc-300">
            2. Add your project credentials to a <code className="font-mono font-semibold">.env.local</code> file or Netlify environment variables:
          </p>
          <div className="relative bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-[11px]">
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center gap-1"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <pre>{envSample}</pre>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Note: Only use the public/anonymous client key. Vite variables prefixed with <code className="font-mono">VITE_</code> are bundled into client code; never expose your secret service-role key.
          </p>
        </div>
      )}
    </div>
  )
}
