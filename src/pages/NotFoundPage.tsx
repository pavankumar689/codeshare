import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-center">
      <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-4">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        The page or workspace URL you requested does not exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Home className="w-4 h-4" />
        Return to SyncPad Home
      </Link>
    </div>
  )
}
