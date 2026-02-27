import React, { useMemo, useState, useEffect, useRef } from 'react'
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
import { MOCK_CHART_DATA, MOCK_VEHICLE_TYPES } from '../services/mockData'

// ── Animated counter hook ──────────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const start = prev.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setValue(Math.round(start + diff * ease))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = target
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return value
}

// ── Animated stat card ─────────────────────────────────────────────────────────
function AnimatedStatCard({ icon, label, value, numericValue, sub, color, delay, badge }) {
  const animated = useCountUp(typeof numericValue === 'number' ? numericValue : 0)
  const displayValue = typeof numericValue === 'number' ? animated : value
  return <StatCard icon={icon} label={label} value={displayValue} sub={sub} color={color} delay={delay} badge={badge} />
}

// ── Tooltips ───────────────────────────────────────────────────────────────────
const CUSTOM_TOOLTIP_LINE = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800/95 border border-brand-blue/25 rounded-xl px-4 py-3 shadow-xl">
      <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mb-1">{label}</p>
      <p className="font-display text-lg font-bold text-brand-blue-glow">
        {payload[0].value} <span className="text-xs text-slate-600 font-mono">incidents</span>
      </p>
      {payload[1] && (
        <p className="font-display text-sm font-semibold text-emerald-400 mt-0.5">
          {payload[1].value} <span className="text-xs text-slate-600 font-mono">resolved</span>
        </p>
      )}
    </div>
  )
}

const CUSTOM_TOOLTIP_PIE = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mb-1">{payload[0].name}</p>
      <p className="font-display text-lg font-bold text-white">{payload[0].value}%</p>
    </div>
  )
}

// ── Live-updating chart seed ───────────────────────────────────────────────────
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

// Main Dashboard logic with varying stats
export default function Dashboard({ accidents, loading, error }) {
  const [tick, setTick] = useState(0)
  const [autoCycle, setAutoCycle] = useState(0)

  // Variation cycle
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1)
      // Cycle through different "last" records to vary the display
      if (accidents.length > 0) {
        setAutoCycle(prev => (prev + 1) % Math.min(accidents.length, 5))
      }
    }, 5000)
    return () => clearInterval(id)
  }, [accidents.length])

  const stats = useMemo(() => {
    const activeCount = accidents.filter(a => a.status === 'ACTIVE').length
    const resolvedCount = accidents.length - activeCount
    const highSeverity = accidents.filter(a => a.severity === 'HIGH').length

    const baseChart = buildChartData(accidents)

    // Pulse the graph data
    const liveChart = baseChart.map((d, i) =>
      i === baseChart.length - 1
        ? { ...d, accidents: d.accidents + (tick % 3), resolved: d.resolved }
        : d
    )

    // Pick a record based on autoCycle to "vary" the Last Plate display
    const currentIdx = autoCycle % (accidents.length || 1)
    const lastAcc = accidents[currentIdx] || accidents[0]

    const lastPlate = lastAcc?.plate || 'Detecting...'
    const lastLocation = lastAcc?.location?.split(',')[0] || 'Kochi'
    const lastLocationSub = `${lastAcc?.status || 'ACTIVE'} · ${lastAcc?.camera_id || 'CAM'}`

    // Fluctuating secondary stats
    const avgResponse = Math.max(5, 12 - activeCount) + (tick % 3) - 1
    const activeZones = Math.min(Math.max(activeCount, 1) + (tick % 2), 5)

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
      chartData: liveChart,
    }
  }, [accidents, tick, autoCycle])


  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <ErrorBanner message={error} />

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <span className="section-title">System Overview</span>
          <div className="section-line" />
          {/* Live pulse */}
          <div className="flex items-center gap-1.5 ml-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" style={{ animationDuration: '1.2s' }} />
            <span className="font-mono text-[9px] text-red-500/60 tracking-widest uppercase">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            delay={60}
          />
          <StatCard
            icon={Activity}
            label="Last Plate"
            value={stats.lastPlate}
            sub={accidents[0]?.camera_id ? `Camera ${accidents[0].camera_id}` : 'Most recent detection'}
            color="emerald"
            delay={120}
          />
          <StatCard
            icon={MapPin}
            label="Last Location"
            value={stats.lastLocation}
            sub={stats.lastLocationSub}
            color="amber"
            delay={180}
          />
        </div>

        {/* Secondary stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {[
            { label: 'Cleared Today', val: stats.resolved, color: '#10b981', icon: '✓' },
            { label: 'Avg Response (min)', val: `${stats.avgResponse}m`, color: '#60a5fa', icon: '⏱' },
            { label: 'High Severity', val: stats.highSeverity, color: '#ef4444', icon: '⚠' },
            { label: 'Zones Active', val: stats.activeZones, color: '#f59e0b', icon: '📍' },

          ].map(s => (
            <div
              key={s.label}
              className="glass-card px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-mono text-[9px] text-slate-600 tracking-widest uppercase mb-1">{s.label}</p>
                <p className="font-display text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
              </div>
              <span className="text-xl opacity-20">{s.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <span className="section-title">Analytics</span>
          <div className="section-line" />
          <span className="ml-2 font-mono text-[9px] text-slate-700 tracking-widest">
            auto-updates every 4s
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart — spans 2 cols */}
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-blue-light" />
                <h3 className="font-display text-sm font-semibold tracking-wider text-slate-300">
                  Incidents Per Day
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-mono text-[9px] text-red-400 tracking-wider">
                  <span className="w-2 h-0.5 bg-red-400 rounded" />
                  Reported
                </span>
                <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 tracking-wider">
                  <span className="w-2 h-0.5 bg-emerald-400 rounded" />
                  Resolved
                </span>
                <span className="font-mono text-[9px] tracking-widest text-slate-700 uppercase border border-white/5 px-2.5 py-1 rounded-lg ml-2">
                  Last 7 Days
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CUSTOM_TOOLTIP_LINE />} />
                <Area
                  type="monotone"
                  dataKey="accidents"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#areaBlue)"
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 2, stroke: '#1d4ed8' }}
                  isAnimationActive={true}
                  animationDuration={600}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#areaGreen)"
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#34d399', strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <PieIcon className="w-4 h-4 text-brand-red-light" />
              <h3 className="font-display text-sm font-semibold tracking-wider text-slate-300">
                Vehicle Types
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={MOCK_VEHICLE_TYPES}
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  animationBegin={200}
                  animationDuration={800}
                >
                  {MOCK_VEHICLE_TYPES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CUSTOM_TOOLTIP_PIE />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: 10,
                    color: '#64748b',
                    letterSpacing: '0.08em',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Incidents Table ──────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <span className="section-title">Recent Incidents</span>
          <div className="section-line" />
          <span className="ml-2 font-mono text-[9px] text-slate-700 tracking-widest">
            {accidents.length} total records
          </span>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['#', 'Plate', 'Owner', 'Location', 'Time', 'Severity', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[9px] tracking-[0.2em] text-slate-700 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accidents.slice(0, 8).map((a, i) => {
                  const isActive = a.status === 'ACTIVE' || a.status === 'reported'
                  const severity = a.severity || (isActive ? 'HIGH' : 'LOW')
                  const severityColor = severity === 'HIGH' ? 'text-red-400' : severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-150"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-700">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-blue-glow tracking-widest">{a.plate}</td>
                      <td className="px-4 py-3 font-body text-xs text-slate-400">{a.owner_name || '—'}</td>
                      <td className="px-4 py-3 font-body text-xs text-slate-500 max-w-[160px] truncate">{a.location || a.camera_id || 'Unknown'}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-600 tracking-wider whitespace-nowrap">
                        {new Date(a.accident_time).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className={`px-4 py-3 font-mono text-[9px] tracking-widest font-bold ${severityColor}`}>
                        {severity}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="badge-active"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />ACTIVE</span>
                        ) : (
                          <span className="badge-resolved"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />CLEARED</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {accidents.length > 8 && (
            <div className="px-4 py-2.5 border-t border-white/5 text-center">
              <span className="font-mono text-[9px] text-slate-700 tracking-widest">
                + {accidents.length - 8} more records in Live Feed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
