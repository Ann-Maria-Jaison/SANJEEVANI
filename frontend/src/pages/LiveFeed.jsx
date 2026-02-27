import React, { useState } from 'react'
import { Radio, RotateCcw, AlertTriangle, CheckCircle2, Zap, ShieldCheck } from 'lucide-react'
import AccidentCard from '../components/AccidentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'

const isActiveStatus = (s) => s === 'ACTIVE'

export default function LiveFeed({ accidents, loading, error, lastRefresh, onRefresh }) {
  const [showResolved, setShowResolved] = useState(true)

  const active = accidents.filter(a => isActiveStatus(a.status))
  const resolved = accidents.filter(a => !isActiveStatus(a.status))

  return (
    <div className="p-6 animate-fade-up space-y-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-header mb-1">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="section-title">Live Incident Feed</span>
            <div className="section-line" />
          </div>
          <div className="flex items-center gap-3 pl-7">
            <span className="font-mono text-[10px] text-slate-700 tracking-wider">
              {active.length > 0 && (
                <span className="text-red-400">{active.length} active</span>
              )}
              {active.length > 0 && resolved.length > 0 && (
                <span className="mx-1.5 text-slate-800">·</span>
              )}
              {resolved.length > 0 && (
                <span className="text-emerald-500">{resolved.length} resolved</span>
              )}
            </span>
            {lastRefresh && (
              <span className="font-mono text-[9px] text-slate-700 tracking-wider">
                Updated {lastRefresh.toLocaleTimeString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/60 border border-white/5 font-mono text-[10px] text-slate-600 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AUTO · 10s
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/60 border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-navy-700/60 transition-all duration-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching incidents..." />
      ) : (
        <>
          {/* ── ACTIVE SECTION ───────────────────────────────────── */}
          <div>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="font-mono text-[11px] text-red-400 tracking-widest uppercase font-semibold">
                  Active Incidents
                </span>
                {active.length > 0 && (
                  <span className="ml-1 bg-red-500/25 text-red-300 rounded-full px-2 py-0.5 font-mono text-[10px]">
                    {active.length}
                  </span>
                )}
              </div>
              {/* Pulse indicator */}
              {active.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
                  <span className="font-mono text-[9px] text-red-500/60 tracking-widest uppercase">
                    Requires Response
                  </span>
                </div>
              )}
              <div className="flex-1 h-px bg-red-500/10" />
              <Zap className="w-3 h-3 text-red-500/40" />
            </div>

            {active.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-navy-800/30 px-6 py-8 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
                <p className="font-mono text-[11px] text-slate-600 tracking-wider uppercase">All clear — no active incidents</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((accident, i) => (
                  <AccidentCard
                    key={accident.id}
                    accident={accident}
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RESOLVED SECTION ─────────────────────────────────── */}
          <div>
            {/* Section header with toggle */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] text-emerald-400 tracking-widest uppercase font-semibold">
                  Resolved Incidents
                </span>
                {resolved.length > 0 && (
                  <span className="ml-1 bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5 font-mono text-[10px]">
                    {resolved.length}
                  </span>
                )}
              </div>
              <div className="flex-1 h-px bg-emerald-500/10" />
              <button
                onClick={() => setShowResolved(v => !v)}
                className="font-mono text-[9px] text-slate-600 hover:text-slate-400 tracking-widest uppercase transition-colors duration-200 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-lg"
              >
                {showResolved ? 'Hide' : 'Show'}
              </button>
            </div>

            {showResolved && (
              resolved.length === 0 ? (
                <EmptyState title="No resolved incidents" sub="Resolved cases will appear here" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {resolved.map((accident, i) => (
                    <AccidentCard
                      key={accident.id}
                      accident={accident}
                      style={{ animationDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}
