import React, { useEffect, useRef, useMemo, useState } from 'react'
import L from 'leaflet'
import { Map, AlertCircle, CheckCircle2, Navigation, Info, Layers } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

// ── Leaflet Setup ────────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createMarkerIcon = (status) => {
  const isActive = status === 'ACTIVE'
  const color = isActive ? '#ef4444' : '#10b981'
  const size = isActive ? 30 : 22

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${isActive ? `
          <div style="
            position:absolute;inset:-4px;border-radius:50%;
            border:2px solid ${color};opacity:0.6;
            animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
        ` : ''}
        <div style="
          width:100%;height:100%;border-radius:50%;
          background:${color};border:2.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 0 15px ${color}66, 0 4px 6px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          transition: transform 0.2s ease;
        ">
          ${isActive ? '<div style="width:6px;height:6px;background:white;border-radius:50%;"></div>' : ''}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

const formatTime = (ts) => new Date(ts).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
})

// ── Component ────────────────────────────────────────────────────────────────
export default function AccidentMap({ accidents, loading }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef({}) // Store by id
  const [selectedId, setSelectedId] = useState(null)

  const activeCount = useMemo(() => accidents.filter(a => a.status === 'ACTIVE').length, [accidents])
  const resolvedCount = useMemo(() => accidents.filter(a => a.status === 'CLEARED').length, [accidents])

  // Sort accidents for sidebar: Active first, then by time
  const sortedAccidents = useMemo(() => {
    return [...accidents].sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
      return new Date(b.accident_time) - new Date(a.accident_time)
    })
  }, [accidents])

  // Map Initialization
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: [8.5241, 76.9366], // Default TVM
      zoom: 13,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)
    mapInstance.current = map

    return () => { map.remove(); mapInstance.current = null }
  }, [])

  // Sync Markers
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Clear removed ones or all if empty
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    const bounds = []
    accidents.forEach(a => {
      if (!a.latitude || !a.longitude) return

      const pos = [a.latitude, a.longitude]
      const isActive = a.status === 'ACTIVE'
      const icon = createMarkerIcon(a.status)

      const popupHtml = `
        <div class="map-popup-header" style="color:#60a5fa;font-family:monospace;font-weight:700;font-size:14px;margin-bottom:8px;">
          ${a.plate}
        </div>
        <div style="font-size:11px;color:#94a3b8;line-height:1.6;font-family:monospace;">
          <div style="display:flex;justify-content:space-between;gap:12px;"><span>LOC:</span> <span>${a.location || 'Unknown'}</span></div>
          <div style="display:flex;justify-content:space-between;gap:12px;"><span>SEVERITY:</span> <span style="color:${isActive ? '#f87171' : '#34d399'}">${a.severity || (isActive ? 'HIGH' : 'LOW')}</span></div>
          <div style="display:flex;justify-content:space-between;gap:12px;"><span>TIME:</span> <span>${formatTime(a.accident_time)}</span></div>
        </div>
        <div style="margin-top:10px;text-align:center;">
          <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;border:1px solid ${isActive ? '#f87171' : '#10b981'};color:${isActive ? '#f87171' : '#10b981'};background:${isActive ? '#f8717111' : '#10b98111'}">
            ${a.status}
          </span>
        </div>
      `

      const marker = L.marker(pos, {
        icon,
        zIndexOffset: isActive ? 1000 : 0,
        riseOnHover: true
      })
        .addTo(map)
        .bindPopup(popupHtml, { minWidth: 200, className: 'dark-popup' })

      markersRef.current[a.id] = marker
      bounds.push(pos)
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [accidents])

  const focusIncident = (a) => {
    if (!a.latitude || !a.longitude) return
    setSelectedId(a.id)
    const map = mapInstance.current
    if (map) {
      map.setView([a.latitude, a.longitude], 16, { animate: true })
      markersRef.current[a.id]?.openPopup()
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="section-header mb-1">
            <Layers className="w-4 h-4 text-brand-blue-light" />
            <span className="section-title">Geospatial Command Center</span>
            <div className="section-line" />
          </div>
          <p className="font-mono text-[10px] text-slate-600 tracking-wider pl-7 uppercase">Real-time incident mapping & cluster analysis</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {activeCount} active
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-widest uppercase">
            <CheckCircle2 className="w-3 h-3" />
            {resolvedCount} cleared
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Map Container */}
        <div className="flex-[3] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-navy-900/50">
          <div ref={mapRef} className="w-full h-full grayscale-[0.2] brightness-[0.9] contrast-[1.1]" />

          {/* Map Overlays */}
          <div className="absolute top-4 left-4 z-[999] glass-card flex items-center gap-3 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-red-glow" />
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-tighter">Active Spot</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-glow" />
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-tighter">Resolved Route</span>
            </div>
          </div>
        </div>

        {/* Sidebar List */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-600 tracking-widest uppercase pl-1 pb-1">
            <span>Recent Alerts</span>
            <span>{accidents.length} logs</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {loading ? (
              <LoadingSpinner message="" />
            ) : sortedAccidents.length === 0 ? (
              <div className="glass-card p-8 text-center opacity-30">
                <p className="font-mono text-xs uppercase tracking-widest">No Mapping Data</p>
              </div>
            ) : sortedAccidents.map((a) => (
              <div
                key={a.id}
                onClick={() => focusIncident(a)}
                className={`
                  glass-card relative p-3 cursor-pointer transition-all duration-300 border
                  ${selectedId === a.id ? 'border-brand-blue/40 bg-brand-blue/5' : 'border-white/5 hover:border-white/10 bg-navy-800/20'}
                `}
              >
                {a.status === 'ACTIVE' && (
                  <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
                    <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-red-500/10 blur-xl rounded-full" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-xs font-bold tracking-widest ${a.status === 'ACTIVE' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {a.plate}
                  </span>
                  <div className={`p-1 rounded bg-black/40 border border-white/5`}>
                    <Navigation className={`w-3 h-3 ${a.status === 'ACTIVE' ? 'text-red-500' : 'text-slate-600'}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-slate-700" />
                    <span className="text-[10px] text-slate-400 font-mono truncate uppercase tracking-tighter">{a.location || 'General Zone'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono mt-2">
                    <span className="text-slate-600 uppercase">Detection Time</span>
                    <span className="text-slate-300">{formatTime(a.accident_time)}</span>
                  </div>
                </div>

                {a.status === 'ACTIVE' && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-navy-950 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 animate-pulse w-full" />
                    </div>
                    <span className="text-[8px] font-mono text-red-500/80 font-bold uppercase tracking-widest">Active</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        
        .dark-popup .leaflet-popup-content-wrapper {
          background: rgba(10, 15, 28, 0.95) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 8px;
        }
        .dark-popup .leaflet-popup-tip { background: rgba(10, 15, 28, 0.95) !important; }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
