import React from 'react'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import type { ConnectionStatus } from '../types/workspace'

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'connected':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
          title="Connected to real-time sync server"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5" />
          <span>Connected</span>
        </div>
      )
    case 'syncing':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20"
          title="Synchronizing changes with server"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing</span>
        </div>
      )
    case 'offline':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20"
          title="Offline: Changes are saved locally only"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline</span>
        </div>
      )
    case 'error':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
          title="Connection error: Unable to reach database"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Error</span>
        </div>
      )
  }
}
