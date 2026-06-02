import React, { useState } from 'react'
import {
  Search, User, Phone, AlertTriangle,
  Shield, Car, Hash, ChevronRight, WifiOff,
} from 'lucide-react'
import { vehicleService } from '../api'
import { MOCK_VEHICLES } from '../services/mockData'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { useOfflineMode } from '../hooks/useOfflineMode'

const DEMO_PLATES = ['KL10UV9900', 'KL07CD5678']

const FIELD_CONFIG = [
  { key: 'owner_name', label: 'Owner Name', icon: User, color: 'blue' },
  { key: 'owner_phone', label: 'Phone Number', icon: Phone, color: 'emerald' },
  { key: 'emergency_contact', label: 'Emergency Contact', icon: AlertTriangle, color: 'red' },
  { key: 'insurance_id', label: 'Insurance ID', icon: Shield, color: 'amber' },
  { key: 'vehicle_type', label: 'Vehicle Type', icon: Car, color: 'blue' },
  { key: 'plate', label: 'Plate Number', icon: Hash, color: 'slate' },
]

const ICON_COLORS = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/10' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/10' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/10' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/10' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/10' },
}

export default function VehicleSearch({ isOnline }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [usingMock, setUsingMock] = useState(false)
  const [fromCache, setFromCache] = useState(false)

  const { cacheVehicleRecord, getCachedVehicleByPlate, addUnsyncedSearch } = useOfflineMode()

  const handleSearch = async (plateOverride) => {
    const plate = (plateOverride || query).trim().toUpperCase().replace(/[-\s]/g, '')
    if (!plate) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSearched(true)
    setUsingMock(false)
    setFromCache(false)

    // OFFLINE: serve from cache
    if (isOnline === false) {
      const cached = getCachedVehicleByPlate(plate)
      if (cached) {
        setResult(cached)
        setFromCache(true)
      } else {
        addUnsyncedSearch(plate)
        setError(`You're offline. No cached data found for plate: ${plate}`)
      }
      setLoading(false)
      return
    }

    // ONLINE: normal fetch, then cache result
    try {
      const data = await vehicleService.getByPlate(plate)
      const record = { ...data, plate }
      setResult(record)
      cacheVehicleRecord(record)           // ← cache it for offline use
    } catch {
      if (MOCK_VEHICLES[plate]) {
        const record = MOCK_VEHICLES[plate]
        setResult(record)
        setUsingMock(true)
        cacheVehicleRecord(record)         // ← cache mock too
      } else {
        setError(`No vehicle found for plate: ${plate}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch() }
  const handleDemoClick = (plate) => {
    setQuery(plate)
    handleSearch(plate)
  }

  return (
    <div className="p-6 animate-fade-up">
      <div className="section-header">
        <Search className="w-4 h-4 text-brand-blue-light" />
        <span className="section-title">Vehicle Registry Lookup</span>
        <div className="section-line" />
      </div>

      <div className="max-w-2xl">
        {/* Search box */}
        <div className="glass-card p-5 mb-5">
          <label className="block font-mono text-[10px] tracking-[0.2em] text-slate-600 uppercase mb-3">
            Enter Plate Number
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              <input
                type="text"
                className="input-field pl-10 uppercase tracking-widest"
                placeholder="KL 07 AB 1234"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <div className="spinner !w-4 !h-4" />
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  SEARCH
                </>
              )}
            </button>
          </div>

          {/* Demo plates */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="font-mono text-[9px] tracking-[0.2em] text-slate-700 uppercase mb-2">
              Try demo plates:
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_PLATES.map(p => (
                <button
                  key={p}
                  onClick={() => handleDemoClick(p)}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-navy-700/40 font-mono text-[11px] text-brand-blue-glow tracking-widest hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all duration-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ErrorBanner message={error} />

        {/* Loading */}
        {loading && <LoadingSpinner message="Querying vehicle registry..." />}

        {/* No result */}
        {!loading && searched && !result && !error && (
          <EmptyState title="Vehicle not found" sub="Check the plate number and try again" />
        )}

        {/* Result */}
        {!loading && result && (
          <div className="glass-card p-5 animate-fade-up">
            {/* Result header */}
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 border border-brand-blue/15 flex items-center justify-center flex-shrink-0">
                <Car className="w-6 h-6 text-brand-blue-light" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-bold tracking-wider text-white truncate">
                  {result.owner_name}
                </h2>
                <p className="font-mono text-sm text-brand-blue-glow tracking-widest mt-0.5">
                  {result.plate}
                </p>
              </div>
              {usingMock && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono text-[9px] tracking-widest text-amber-500 uppercase flex-shrink-0">
                  Demo
                </span>
              )}
              {fromCache && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 font-mono text-[9px] tracking-widest text-blue-400 uppercase flex-shrink-0 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Cached
                </span>
              )}
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELD_CONFIG.map(({ key, label, icon: Icon, color }) => {
                const c = ICON_COLORS[color]
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-3 p-4 rounded-xl bg-navy-800/40 border ${c.border}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] tracking-[0.2em] text-slate-700 uppercase mb-1">
                        {label}
                      </p>
                      <p className="font-body text-sm text-slate-200 font-medium truncate">
                        {result[key] || '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
