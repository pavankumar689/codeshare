import React, { useMemo } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { getLanguageConfig } from '../utils/languages'
import { MAX_RECOMMENDED_CHARS } from '../utils/validation'
import { AlertCircle } from 'lucide-react'
import type { SupportedLanguage } from '../types/workspace'

interface EditorProps {
  content: string
  language: SupportedLanguage
  theme: 'dark' | 'light'
  onChange: (value: string) => void
  disabled?: boolean
}

export const Editor: React.FC<EditorProps> = ({
  content,
  language,
  theme,
  onChange,
  disabled = false,
}) => {
  const isLarge = content.length > MAX_RECOMMENDED_CHARS

  // Get CodeMirror extensions for the selected language
  const extensions = useMemo(() => {
    const langConfig = getLanguageConfig(language)
    const langExtensions = langConfig.getExtension()

    // Add line wrapping and font configuration
    return [
      ...langExtensions,
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
        },
        '.cm-scroller': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: '1.6',
        },
        '.cm-gutters': {
          backgroundColor: theme === 'dark' ? '#09090b' : '#f8fafc',
          color: theme === 'dark' ? '#52525b' : '#94a3b8',
          borderRight: theme === 'dark' ? '1px solid #27272a' : '1px solid #e2e8f0',
        },
        '.cm-activeLine': {
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: theme === 'dark' ? '#18181b' : '#e2e8f0',
          color: theme === 'dark' ? '#e4e4e7' : '#0f172a',
        },
      }),
    ]
  }, [language, theme])

  return (
    <div className="relative flex-1 flex flex-col w-full h-full min-h-[500px] overflow-hidden bg-white dark:bg-zinc-950">
      {/* Large Content Alert */}
      {isLarge && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Large Document:</strong> This document contains over {(content.length / 1000).toFixed(0)}k characters. SyncPad preserves all text, but editing performance may vary across mobile devices.
          </span>
        </div>
      )}

      {/* Main CodeMirror Editor */}
      <div className="flex-1 w-full h-full overflow-auto">
        <CodeMirror
          value={content}
          height="100%"
          className="h-full text-sm font-mono"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={extensions}
          onChange={onChange}
          readOnly={disabled}
          placeholder="Paste or type code, text, JSON, notes, or configuration here. Changes sync automatically across all connected devices in real time..."
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
    </div>
  )
}
