import React, { useState, useMemo } from 'react'
import { Radio, RotateCcw, AlertTriangle, CheckCircle2, Zap, ShieldCheck, Filter, Search, SortDesc} from 'lucide-react'
import AccidentCard from '../components/AccidentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'

const isActiveStatus = (s) => s === 'ACTIVE' || s === 'reported'

export default function LiveFeed({ accidents, loading, error, lastRefresh, onRefresh }) {
  const [showResolved, setShowResolved] = useState(true)
  
  // Filter States
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [filterTime, setFilterTime] = useState('ALL')
  const [sortBy, setSortBy] = useState('TIME_DESC')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAccidents = useMemo(() => {
    if (!accidents) return []
    
    return accidents.filter(a => {
      // 1. Severity Filter
      if (filterSeverity !== 'ALL') {
        const severity = a.severity || (isActiveStatus(a.status) ? 'HIGH' : 'LOW')
        if (severity !== filterSeverity) return false
      }
      
      // 2. Time Filter
      if (filterTime !== 'ALL') {
        const hours = filterTime === '1H' ? 1 : filterTime === '24H' ? 24 : 0
        if (hours > 0) {
          const timeDiff = new Date() - new Date(a.accident_time)
          if (timeDiff > hours * 60 * 60 * 1000) return false
        }
      }
      
      // 3. Search Query (Location, Plate, Camera ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const loc = (a.location || a.camera_id || '').toLowerCase()
        const plate = (a.plate || '').toLowerCase()
        if (!loc.includes(q) && !plate.includes(q)) return false
      }
      
      return true
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'TIME_DESC') {
        return new Date(b.accident_time) - new Date(a.accident_time)
      } else if (sortBy === 'TIME_ASC') {
        return new Date(a.accident_time) - new Date(b.accident_time)
      } else if (sortBy === 'SEVERITY_DESC') {
        const sevScore = (sev) => sev === 'HIGH' ? 3 : sev === 'MEDIUM' ? 2 : 1
        const aSev = a.severity || (isActiveStatus(a.status) ? 'HIGH' : 'LOW')
        const bSev = b.severity || (isActiveStatus(b.status) ? 'HIGH' : 'LOW')
        if (sevScore(aSev) !== sevScore(bSev)) return sevScore(bSev) - sevScore(aSev)
        // Fallback to time if severity is the same
        return new Date(b.accident_time) - new Date(a.accident_time)
      }
      return 0
    })
  }, [accidents, filterSeverity, filterTime, searchQuery, sortBy])

  const active = filteredAccidents.filter(a => isActiveStatus(a.status))
  const resolved = filteredAccidents.filter(a => !isActiveStatus(a.status))

  return (
    <div className="p-6 animate-fade-up space-y-6">
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
              {active.length > 0 && <span className="text-red-400">{active.length} active</span>}
              {active.length > 0 && resolved.length > 0 && <span className="mx-1.5 text-slate-800">·</span>}
              {resolved.length > 0 && <span className="text-emerald-500">{resolved.length} resolved</span>}
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
            title="Force Refresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* ── Filter & Sort Bar ──────────────────────────────────── */}
      <div className="glass-card p-3 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search location or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-900/50 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/30 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-navy-900/50 border border-white/5 rounded-lg px-2.5 py-2 text-[11px] font-mono tracking-widest text-slate-300 uppercase focus:outline-none focus:border-brand-blue/50 appearance-none cursor-pointer"
            >
              <option value="ALL">All Severity</option>
              <option value="HIGH">High Critical</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="bg-navy-900/50 border border-white/5 rounded-lg px-2.5 py-2 text-[11px] font-mono tracking-widest text-slate-300 uppercase focus:outline-none focus:border-brand-blue/50 appearance-none cursor-pointer"
          >
            <option value="ALL">Any Time</option>
            <option value="1H">Last 1 Hour</option>
            <option value="24H">Last 24 Hours</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <SortDesc className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-navy-900/50 border border-white/5 rounded-lg px-2.5 py-2 text-[11px] font-mono tracking-widest text-slate-300 uppercase focus:outline-none focus:border-brand-blue/50 appearance-none cursor-pointer"
            >
              <option value="TIME_DESC">Newest First</option>
              <option value="TIME_ASC">Oldest First</option>
              <option value="SEVERITY_DESC">Severity (High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      {loading && !filteredAccidents.length ? (
        <LoadingSpinner message="Fetching incidents..." />
      ) : (
        <>
          {/* ── ACTIVE SECTION ───────────────────────────────────── */}
          <div>
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
                <p className="font-mono text-[11px] text-slate-600 tracking-wider uppercase">
                  {searchQuery || filterSeverity !== 'ALL' || filterTime !== 'ALL' 
                    ? 'No active incidents match your filters' 
                    : 'All clear — no active incidents'}
                </p>
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
                <EmptyState 
                  title="No resolved incidents" 
                  sub={searchQuery || filterSeverity !== 'ALL' || filterTime !== 'ALL' ? 'Check your current filters' : 'Resolved cases will appear here'} 
                />
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