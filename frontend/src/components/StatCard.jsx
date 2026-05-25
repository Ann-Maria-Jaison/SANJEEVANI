import React from 'react'
import clsx from 'clsx'

const COLOR_MAP = {
  blue: {
    glow: 'glow-top-blue',
    icon: 'bg-brand-blue/15 text-brand-blue-light border border-brand-blue/30',
    value: 'text-brand-blue-glow',
    accent: 'from-brand-blue/10 to-transparent',
  },
  red: {
    glow: 'glow-top-red',
    icon: 'bg-brand-red/15 text-brand-red-light border border-brand-red/30',
    value: 'text-brand-red-glow',
    accent: 'from-brand-red/10 to-transparent',
  },
  emerald: {
    glow: 'glow-top-emerald',
    icon: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    value: 'text-emerald-400',
    accent: 'from-emerald-500/10 to-transparent',
  },
  amber: {
    glow: 'glow-top-amber',
    icon: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    value: 'text-amber-400',
    accent: 'from-amber-500/10 to-transparent',
  },
}

export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={clsx('stat-card relative overflow-hidden group', c.glow)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Ambient gradient */}
      <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none', c.accent)} />

      {/* Scanline */}
      <div className="scanline-overlay opacity-50" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="font-mono text-[10px] tracking-[0.25em] text-slate-400 uppercase leading-none font-semibold">
            {label}
          </p>
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg', c.icon)}>
            <Icon className="w-4.5 h-4.5 drop-shadow-md" />
          </div>
        </div>

        {/* Value */}
        <div className={clsx('font-display font-bold leading-none mb-2.5 drop-shadow-md', c.value)}>
          <span className="text-4xl tracking-tight">{value}</span>
        </div>

        {/* Sub */}
        <p className="font-mono text-[11px] text-slate-500 truncate font-medium">{sub}</p>
      </div>
    </div>
  )
}
