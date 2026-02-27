import React from 'react'
import { SearchX } from 'lucide-react'

export default function EmptyState({ icon: Icon = SearchX, title = 'No data found', sub }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy-800/60 border border-white/5 flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-700" />
      </div>
      <div>
        <p className="font-display text-sm font-semibold tracking-wider text-slate-600 uppercase">{title}</p>
        {sub && <p className="font-mono text-[10px] text-slate-700 mt-1 tracking-wider">{sub}</p>}
      </div>
    </div>
  )
}
