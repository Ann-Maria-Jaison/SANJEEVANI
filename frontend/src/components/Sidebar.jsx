import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  Map,
  Search,
  Zap,
  Activity,
  Shield,
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/monitor', icon: Activity, label: 'CCTV Monitor' },
  { to: '/live', icon: Radio, label: 'Live Feed' },
  { to: '/map', icon: Map, label: 'Accident Map' },
  { to: '/vehicle', icon: Search, label: 'Vehicle Search' },
]

export default function Sidebar({ isOnline }) {
  const location = useLocation()

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[220px] flex flex-col bg-navy-900/80 backdrop-blur-md border-r border-white/5 z-50">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-blue/60 to-transparent" />

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-red flex items-center justify-center shadow-blue-glow flex-shrink-0">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-display text-lg font-bold tracking-[0.15em] text-white">
            SANJEEVANI
          </span>
        </div>
        <p className="font-mono text-[9px] tracking-[0.2em] text-slate-600 uppercase pl-[42px]">
          Smart Accident Detection
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="font-mono text-[9px] tracking-[0.2em] text-slate-700 uppercase px-3 mb-3">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'nav-link group',
                isActive && 'active'
              )}
            >
              <Icon
                className={clsx(
                  'w-4 h-4 flex-shrink-0 transition-colors duration-200',
                  isActive ? 'text-brand-blue-light' : 'text-slate-600 group-hover:text-slate-400'
                )}
              />
              <span className="text-[13px]">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue-light shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* System status */}
      <div className="px-4 py-4 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div
            className={clsx(
              'w-2 h-2 rounded-full flex-shrink-0',
              isOnline === null
                ? 'bg-amber-500 animate-pulse'
                : isOnline
                  ? 'bg-emerald-500 animate-pulse-slow'
                  : 'bg-red-500'
            )}
            style={isOnline ? { boxShadow: '0 0 6px rgba(16,185,129,0.8)' } : {}}
          />
          <span className="font-mono text-[10px] tracking-wider text-slate-500">
            {isOnline === null
              ? 'CHECKING...'
              : isOnline
                ? 'BACKEND CONNECTED'
                : 'OFFLINE MODE'}
          </span>
        </div>
        <div className="flex items-center gap-2 px-1">
          <Shield className="w-3 h-3 text-slate-700" />
          <span className="font-mono text-[10px] tracking-wider text-slate-700">
            YOLO v8 · ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-2 px-1">
          <Activity className="w-3 h-3 text-slate-700" />
          <span className="font-mono text-[10px] tracking-wider text-slate-700">
            FastAPI · Supabase
          </span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-red/40 to-transparent" />
    </aside>
  )
}
