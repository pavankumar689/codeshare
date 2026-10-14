import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ClearModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ClearModal: React.FC<ClearModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="clear-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-zinc-100"
            >
              Clear Workspace Content?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              This action will erase all content in this shared workspace.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-zinc-300 mb-6 leading-relaxed">
          Are you sure you want to completely clear this workspace? All connected
          devices viewing this room will immediately receive the empty state.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Content
          </button>
        </div>
      </div>
    </div>
  )
}
