import React from 'react'

export default function LoadingSpinner({ message = 'LOADING...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative">
        <div className="spinner" />
        <div className="absolute inset-0 rounded-full border-2 border-brand-blue/10" />
      </div>
      <p className="font-mono text-[10px] tracking-[0.3em] text-slate-700 uppercase">{message}</p>
    </div>
  )
}
