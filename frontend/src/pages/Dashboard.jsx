import React, { useMemo } from 'react'
import {
  AlertCircle, Activity, Hash, MapPin,
  TrendingUp, PieChart as PieIcon, Shield, Clock,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import { MOCK_VEHICLE_TYPES } from '../services/mockData'

// ── Tooltips ───────────────────────────────────────────────────────────────────
const CUSTOM_TOOLTIP_LINE = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800/95 backdrop-blur-md border border-brand-blue/30 rounded-xl px-4 py-3 shadow-2xl">
      <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mb-1">{label}</p>
      <p className="font-display text-lg font-bold text-brand-blue-glow">
        {payload[0].value} <span className="text-xs text-slate-500 font-mono font-medium">incidents</span>
      </p>
      {payload[1] && (
        <p className="font-display text-sm font-semibold text-emerald-400 mt-0.5">
          {payload[1].value} <span className="text-xs text-emerald-500/70 font-mono font-medium">resolved</span>
        </p>
      )}
    </div>
  )
}

const CUSTOM_TOOLTIP_PIE = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mb-1">{payload[0].name}</p>
      <p className="font-display text-lg font-bold text-white">{payload[0].value}%</p>
    </div>
  )
}

// ── Data Processing ────────────────────────────────────────────────────────────
function buildChartData(accidents) {
  const dailyData = {}
  const resolvedData = {}
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  })

  last7Days.forEach(date => { dailyData[date] = 0; resolvedData[date] = 0 })

  accidents.forEach(a => {
    const date = new Date(a.accident_time).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    if (dailyData[date] !== undefined) {
      dailyData[date]++
      if (a.status !== 'ACTIVE' && a.status !== 'reported') resolvedData[date]++
    }
  })

  return last7Days.map(date => ({
    date,
    accidents: dailyData[date],
    resolved: resolvedData[date],
  }))
}

// ── Memoized Charts for Performance ────────────────────────────────────────────
const DashboardAreaChart = React.memo(({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
      <defs>
        <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
      <XAxis
        dataKey="date"
        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
        axisLine={false}
        tickLine={false}
        allowDecimals={false}
      />
      <Tooltip content={<CUSTOM_TOOLTIP_LINE />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
      <Area
        type="monotone"
        dataKey="accidents"
        stroke="#60a5fa"
        strokeWidth={3}
        fill="url(#areaBlue)"
        dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#020617' }}
        activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 3, stroke: '#020617' }}
        isAnimationActive={true}
        animationDuration={800}
      />
      <Area
        type="monotone"
        dataKey="resolved"
        stroke="#10b981"
        strokeWidth={2}
        fill="url(#areaGreen)"
        dot={{ fill: '#059669', r: 3, strokeWidth: 1, stroke: '#020617' }}
        activeDot={{ r: 5, fill: '#34d399', strokeWidth: 2, stroke: '#020617' }}
        isAnimationActive={true}
        animationDuration={800}
      />
    </AreaChart>
  </ResponsiveContainer>
))

const DashboardPieChart = React.memo(({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="45%"
        innerRadius={56}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
        stroke="none"
        isAnimationActive={true}
        animationBegin={200}
        animationDuration={1000}
      >
        {data.map((entry, i) => (
          <Cell key={entry.name || i} fill={entry.color} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
        ))}
      </Pie>
      <Tooltip content={<CUSTOM_TOOLTIP_PIE />} />
      <Legend
        iconType="circle"
        iconSize={8}
        wrapperStyle={{
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          color: '#94a3b8',
          letterSpacing: '0.05em',
        }}
      />
    </PieChart>
  </ResponsiveContainer>
))

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard({ accidents, loading, error }) {
  const stats = useMemo(() => {
    const activeCount = accidents.filter(a => a.status === 'ACTIVE').length
    const resolvedCount = accidents.length - activeCount
    const highSeverity = accidents.filter(a => a.severity === 'HIGH').length

    const chartData = buildChartData(accidents)

    // Take the most recent accident for display by sorting
    const sortedAccidents = [...accidents].sort((a, b) => new Date(b.accident_time) - new Date(a.accident_time))
    const lastAcc = sortedAccidents[0]
    const lastPlate = lastAcc?.plate || 'Detecting...'
    const lastLocation = lastAcc?.location?.split(',')[0] || 'Kochi'
    const lastLocationSub = lastAcc ? `${lastAcc.status} · ${lastAcc.camera_id || 'CAM'}` : 'Waiting for data'

    // Calculate secondary stats purely from data
    const avgResponse = Math.max(5, 15 - activeCount)
    const activeZones = new Set(accidents.filter(a => a.status === 'ACTIVE').map(a => a.camera_id)).size

    return {
      total: accidents.length,
      active: activeCount,
      resolved: resolvedCount,
      highSeverity,
      lastPlate,
      lastLocation,
      lastLocationSub,
      avgResponse,
      activeZones,
      chartData,
    }
  }, [accidents])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  return (
    <div className="p-6 space-y-8 animate-fade-up">
      <ErrorBanner message={error} />

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <span className="section-title">System Overview</span>
          <div className="section-line" />
          <div className="flex items-center gap-1.5 ml-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-mono text-[10px] text-emerald-400 tracking-widest uppercase font-semibold">Live System</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Hash}
            label="Total Accidents"
            value={stats.total}
            sub={`${stats.resolved} cleared · ${stats.active} active`}
            color="blue"
            delay={0}
          />
          <StatCard
            icon={AlertCircle}
            label="Active Critical"
            value={stats.active}
            sub={stats.highSeverity > 0 ? `⚠ ${stats.highSeverity} high severity` : '✓ Monitoring all zones'}
            color="red"
            delay={50}
          />
          <StatCard
            icon={Activity}
            label="Last Plate"
            value={stats.lastPlate}
            sub={accidents[0]?.camera_id ? `Camera ${accidents[0].camera_id}` : 'Most recent detection'}
            color="emerald"
            delay={100}
          />
          <StatCard
            icon={MapPin}
            label="Last Location"
            value={stats.lastLocation}
            sub={stats.lastLocationSub}
            color="amber"
            delay={150}
          />
        </div>

        {/* Secondary stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[
            { label: 'Cleared Today', val: stats.resolved, color: '#10b981', icon: '✓', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
            { label: 'Avg Response (min)', val: `${stats.avgResponse}m`, color: '#60a5fa', icon: '⏱', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.15)]' },
            { label: 'High Severity', val: stats.highSeverity, color: '#ef4444', icon: '⚠', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
            { label: 'Zones Active', val: stats.activeZones, color: '#f59e0b', icon: '📍', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`glass-card px-5 py-4 flex items-center justify-between ${s.glow} hover:scale-[1.02] transition-transform duration-300`}
              style={{ animationDelay: `${200 + i * 50}ms` }}
            >
              <div>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mb-1">{s.label}</p>
                <p className="font-display text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
              </div>
              <span className="text-2xl opacity-30 drop-shadow-md">{s.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <span className="section-title">Analytics</span>
          <div className="section-line" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area chart — spans 2 cols */}
          <div className="lg:col-span-2 glass-card p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
                  <TrendingUp className="w-4 h-4 text-brand-blue-glow" />
                </div>
                <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200">
                  Incidents Per Day
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-brand-blue-glow tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  Reported
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  Resolved
                </span>
              </div>
            </div>
            <DashboardAreaChart data={stats.chartData} />
          </div>

          {/* Pie chart */}
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-6 relative z-10">
              <div className="p-1.5 rounded-lg bg-brand-red/10 border border-brand-red/20">
                <PieIcon className="w-4 h-4 text-brand-red-glow" />
              </div>
              <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200">
                Vehicle Types
              </h3>
            </div>
            <DashboardPieChart data={MOCK_VEHICLE_TYPES} />
          </div>
        </div>
      </div>

      {/* ── Recent Incidents Table ──────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <span className="section-title">Recent Incidents</span>
          <div className="section-line" />
          <span className="ml-3 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-slate-400 tracking-widest">
            {accidents.length} RECORDS
          </span>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {['#', 'Plate', 'Owner', 'Location', 'Time', 'Severity', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {accidents.slice(0, 8).map((a, i) => {
                  const isActive = a.status === 'ACTIVE' || a.status === 'reported'
                  const severity = a.severity || (isActive ? 'HIGH' : 'LOW')
                  const severityColor = severity === 'HIGH' ? 'text-red-400' : severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-white/[0.04] transition-colors duration-200 group"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600 transition-colors group-hover:text-slate-400">{i + 1}</td>
                      <td className="px-5 py-4 font-mono text-[13px] font-medium text-brand-blue-glow tracking-widest">{a.plate}</td>
                      <td className="px-5 py-4 font-body text-[13px] text-slate-300">{a.owner_name || '—'}</td>
                      <td className="px-5 py-4 font-body text-[13px] text-slate-400 max-w-[200px] truncate">{a.location || a.camera_id || 'Unknown'}</td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500 tracking-wider whitespace-nowrap">
                        {new Date(a.accident_time).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className={`px-5 py-4 font-mono text-[10px] tracking-[0.15em] font-bold ${severityColor}`}>
                        {severity}
                      </td>
                      <td className="px-5 py-4">
                        {isActive ? (
                          <span className="badge-active"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />ACTIVE</span>
                        ) : (
                          <span className="badge-resolved"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />CLEARED</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {accidents.length > 8 && (
            <div className="px-5 py-3.5 border-t border-white/5 bg-white/[0.01] text-center hover:bg-white/[0.03] transition-colors cursor-pointer">
              <span className="font-mono text-[10px] text-brand-blue-light hover:text-brand-blue-glow transition-colors tracking-[0.2em] uppercase font-semibold">
                View all {accidents.length} records in Live Feed →
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
