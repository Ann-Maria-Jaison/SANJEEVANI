import React from 'react'
import clsx from 'clsx'

const COLOR_MAP = {
  blue: {
    glow: 'glow-top-blue',
    icon: 'bg-blue-500/10 text-blue-400',
    value: 'text-blue-400',
    accent: 'from-blue-500/5 to-transparent',
  },
  red: {
    glow: 'glow-top-red',
    icon: 'bg-red-500/10 text-red-400',
    value: 'text-red-400',
    accent: 'from-red-500/5 to-transparent',
  },
  emerald: {
    glow: 'glow-top-emerald',
    icon: 'bg-emerald-500/10 text-emerald-400',
    value: 'text-emerald-400',
    accent: 'from-emerald-500/5 to-transparent',
  },
  amber: {
    glow: 'glow-top-amber',
    icon: 'bg-amber-500/10 text-amber-400',
    value: 'text-amber-400',
    accent: 'from-amber-500/5 to-transparent',
  },
}

export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={clsx('stat-card relative overflow-hidden', c.glow)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Ambient gradient */}
      <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none', c.accent)} />

      {/* Scanline */}
      <div className="scanline-overlay" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase leading-none">
            {label}
          </p>
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', c.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Value */}
        <div className={clsx('font-display font-bold leading-none mb-2', c.value)}>
          <span className="text-[2.2rem] tracking-tight">{value}</span>
        </div>

        {/* Sub */}
        <p className="font-mono text-[10px] text-slate-600 truncate">{sub}</p>
      </div>
    </div>
  )
}
