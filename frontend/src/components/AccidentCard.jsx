import React from 'react'
import { MapPin, User, Clock, Car, AlertTriangle, CheckCircle2, Phone, FileText } from 'lucide-react'
import clsx from 'clsx'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

const SEVERITY_STYLES = {
  HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  LOW: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

export default function AccidentCard({ accident, style }) {
  const isActive = accident.status === 'ACTIVE'
  const severity = accident.severity || (isActive ? 'HIGH' : 'LOW')
  const severityStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW

  return (
    <div
      className={clsx(
        'relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden group',
        'bg-navy-800/50 backdrop-blur-sm',
        isActive
          ? 'border-red-500/20 hover:border-red-500/40 hover:shadow-red-glow'
          : 'border-white/5 hover:border-emerald-500/20 hover:shadow-card-hover'
      )}
      style={style}
    >
      {/* Left accent bar */}
      <div
        className={clsx(
          'absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl',
          isActive ? 'bg-red-500' : 'bg-emerald-500'
        )}
        style={isActive ? { boxShadow: '0 0 8px rgba(239,68,68,0.6)' } : {}}
      />

      {/* Active pulse overlay */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/3 to-transparent pointer-events-none" />
      )}

      <div className="p-4 pl-5">
        {/* Top row: plate + status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-mono text-base font-semibold tracking-widest text-brand-blue-glow">
              {accident.plate}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Car className="w-3 h-3 text-slate-700" />
              <span className="font-mono text-[10px] text-slate-600 tracking-wider uppercase">
                {accident.vehicle_type || accident.camera_id || 'DETECTED'}
              </span>
              {accident.insurance_id && (
                <>
                  <span className="text-slate-800">·</span>
                  <span className="font-mono text-[9px] text-slate-700 tracking-wider">
                    {accident.insurance_id}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
            {isActive ? (
              <span className="badge-active">
                <AlertTriangle className="w-3 h-3" />
                ACTIVE
              </span>
            ) : (
              <span className="badge-resolved">
                <CheckCircle2 className="w-3 h-3" />
                CLEARED
              </span>
            )}
            {/* Severity badge */}
            <span className={clsx(
              'font-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded border font-bold',
              severityStyle
            )}>
              {severity}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.04] mb-3" />

        {/* Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-slate-700 flex-shrink-0" />
            <span className="font-body text-xs text-slate-300 truncate font-medium">
              {accident.owner_name || 'Unknown Owner'}
            </span>
          </div>
          {accident.owner_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-slate-700 flex-shrink-0" />
              <span className="font-mono text-[10px] text-slate-500 tracking-wider">
                {accident.owner_phone}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-slate-700 flex-shrink-0" />
            <span className="font-body text-xs text-slate-400 truncate">
              {accident.location || accident.camera_id || 'Downtown Crossing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-700 flex-shrink-0" />
            <span className="font-mono text-[10px] text-slate-600 tracking-wider">
              {formatTime(accident.accident_time)}
            </span>
            <span className="ml-auto font-mono text-[9px] text-slate-700 tracking-wider">
              {timeAgo(accident.accident_time)}
            </span>
          </div>
        </div>

        {/* Emergency contact strip */}
        {accident.emergency_contact && (
          <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center gap-2">
            <FileText className="w-3 h-3 text-slate-700 flex-shrink-0" />
            <span className="font-mono text-[9px] text-slate-700 tracking-wider">Emergency:</span>
            <span className="font-mono text-[9px] text-amber-500/70 tracking-wider">
              {accident.emergency_contact}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
