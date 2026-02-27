import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 mb-5 animate-fade-in">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="font-mono text-xs flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-500/60 hover:text-red-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
