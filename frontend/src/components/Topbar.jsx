import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Wifi, WifiOff, Clock, RefreshCw, AlertTriangle,
  ChevronRight, X, CheckCircle2, Activity
} from 'lucide-react'
import clsx from 'clsx'

/* Animation injected once at module level to avoid <style> inside JSX */
if (typeof document !== 'undefined' && !document.getElementById('topbar-keyframes')) {
  const s = document.createElement('style')
  s.id = 'topbar-keyframes'
  s.textContent = `
    @keyframes notifSlideIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .notif-dropdown { animation: notifSlideIn 0.18s ease-out; }
  `
  document.head.appendChild(s)
}

const PAGE_META = {
  '/': { title: 'Command Dashboard', sub: 'Overview & Analytics', crumbs: ['Home', 'Dashboard'] },
  '/live': { title: 'Live Accident Feed', sub: 'Real-time incident monitoring', crumbs: ['Home', 'Live Feed'] },
  '/map': { title: 'Accident Map', sub: 'Geospatial incident tracking', crumbs: ['Home', 'Map'] },
  '/vehicle': { title: 'Vehicle Search', sub: 'Owner & emergency lookup', crumbs: ['Home', 'Vehicle'] },
  '/monitor': { title: 'CCTV Monitor', sub: 'Live camera stack surveillance', crumbs: ['Home', 'CCTV Monitor'] },
}

export default function Topbar({ isOnline, usingMock, lastRefresh, onRefresh, accidents = [] }) {
  const location = useLocation()
  const navigate = useNavigate()
  const meta = PAGE_META[location.pathname] || PAGE_META['/']

  const [time, setTime] = useState(new Date())
  const [spinning, setSpinning] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [dismissed, setDismissed] = useState(new Set())
  const notifRef = useRef(null)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRefresh = () => {
    if (spinning) return
    setSpinning(true)
    onRefresh?.()
    setTimeout(() => setSpinning(false), 1000)
  }

  const activeAccidents = accidents.filter(
    a => (a.status === 'ACTIVE' || a.status === 'reported') && !dismissed.has(a.id)
  )
  const unreadCount = activeAccidents.length

  const timeAgo = (isoStr) => {
    const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-navy-900/70 backdrop-blur-xl sticky top-0 z-30">

      {/* ── Left: breadcrumb + title ── */}
      <div className="flex flex-col justify-center gap-0.5">
        <nav className="flex items-center gap-1">
          {meta.crumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-700" />}
              <button
                onClick={() => i === 0 && navigate('/')}
                className={clsx(
                  'font-mono text-[9px] tracking-[0.15em] uppercase transition-colors duration-150',
                  i === 0
                    ? 'text-brand-blue-light hover:text-white cursor-pointer'
                    : 'text-slate-600 cursor-default pointer-events-none'
                )}
              >
                {crumb}
              </button>
            </React.Fragment>
          ))}
        </nav>
        <h1 className="font-display text-sm font-semibold tracking-wider text-white leading-tight">
          {meta.title}
        </h1>
      </div>

      {/* ── Right: controls ── */}
      <div className="flex items-center gap-2.5">

        {/* Demo Data badge */}
        {usingMock && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            DEMO DATA
          </div>
        )}

        {/* Live clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/60 border border-white/5 group cursor-default select-none">
          <Clock className="w-3 h-3 text-slate-600 group-hover:text-brand-blue-light transition-colors duration-200" />
          <span className="font-mono text-[11px] text-slate-400 tracking-wider tabular-nums">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Connection status — click = refresh */}
        <button
          onClick={handleRefresh}
          title="Check connection"
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-wider border transition-all duration-300 hover:brightness-125 active:scale-95',
            isOnline === null
              ? 'bg-navy-800/60 border-white/5 text-slate-500'
              : isOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}
        >
          {isOnline
            ? <Wifi className="w-3 h-3" />
            : <WifiOff className="w-3 h-3" />
          }
          <span className="hidden md:inline">
            {isOnline === null ? 'CHECKING' : isOnline ? 'CONNECTED' : 'OFFLINE'}
          </span>
          {isOnline && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          title="Refresh data"
          className="w-8 h-8 rounded-lg bg-navy-800/60 border border-white/5 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-navy-700/60 transition-all duration-200 active:scale-90"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5 transition-transform duration-500', spinning && 'animate-spin')} />
        </button>

        {/* ── Notifications ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            title="Notifications"
            className="relative w-8 h-8 rounded-lg bg-navy-800/60 border border-white/5 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-navy-700/60 transition-all duration-200 active:scale-90"
          >
            <Bell className={clsx('w-3.5 h-3.5 transition-colors duration-200', showNotifs && 'text-brand-blue-light')} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 flex items-center justify-center font-mono text-[9px] text-white font-bold"
                style={{ boxShadow: '0 0 6px rgba(239,68,68,0.7)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {showNotifs && (
            <div className="notif-dropdown absolute right-0 top-11 w-80 rounded-2xl border border-white/10 bg-navy-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50">

              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-brand-blue-light" />
                  <span className="font-display text-xs font-semibold text-white tracking-wider">
                    Active Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/20 font-mono text-[9px] text-red-400">
                      {unreadCount} ACTIVE
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="text-slate-600 hover:text-slate-300 transition-colors p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Panel items */}
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {activeAccidents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                    <p className="font-mono text-[10px] text-slate-600 tracking-wider">
                      ALL CLEAR — NO ACTIVE INCIDENTS
                    </p>
                  </div>
                ) : (
                  activeAccidents.slice(0, 8).map(a => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => { navigate('/monitor'); setShowNotifs(false) }}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-[10px] text-brand-blue-glow tracking-widest font-semibold">
                            {a.plate}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="font-mono text-[9px] text-red-400 tracking-wider animate-pulse">
                            ACTIVE
                          </span>
                        </div>
                        <p className="font-body text-xs text-slate-400 truncate mt-0.5">
                          {a.location || a.camera_id || 'CAM001 · Downtown'}
                        </p>
                        <p className="font-mono text-[9px] text-slate-700 mt-0.5">
                          {timeAgo(a.accident_time)}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setDismissed(s => new Set([...s, a.id])) }}
                        className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-slate-300 transition-all shrink-0 mt-0.5 p-0.5"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Panel footer */}
              {activeAccidents.length > 0 && (
                <div className="px-4 py-2.5 border-t border-white/5 flex justify-between items-center">
                  <button
                    onClick={() => setDismissed(new Set(activeAccidents.map(a => a.id)))}
                    className="font-mono text-[9px] text-slate-600 hover:text-slate-400 tracking-wider transition-colors"
                  >
                    DISMISS ALL
                  </button>
                  <button
                    onClick={() => { navigate('/monitor'); setShowNotifs(false) }}
                    className="font-mono text-[9px] text-brand-blue-light hover:text-white tracking-wider transition-colors"
                  >
                    VIEW MONITOR →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
