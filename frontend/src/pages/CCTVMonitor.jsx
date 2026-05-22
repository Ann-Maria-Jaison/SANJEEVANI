import React, { useState, useEffect } from 'react'
import { Camera, Shield, Activity, Landmark, Navigation2, Send, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import api, { accidentService } from '../api'
import ErrorBanner from '../components/ErrorBanner'

const CAMERAS = [
    { id: 'CAM001', name: 'Downtown Crossing', video: '/accident_video.mp4' },
]

export default function CCTVMonitor() {
    const [activeIncident, setActiveIncident] = useState(null)
    const [emergencyDetails, setEmergencyDetails] = useState(null)
    const [alertSent, setAlertSent] = useState(false)
    const [ambulancePos, setAmbulancePos] = useState(0) // 0 to 100%
    const [pollingError, setPollingError] = useState(null)

    // Simulated Polling for new accidents
    useEffect(() => {
        const checkAccidents = async () => {
            try {
                const data = await accidentService.getAll()
                const accidents = Array.isArray(data) ? data : []
                setPollingError(null)
                const activeOnes = accidents.filter(a =>
                    ['reported', 'Detected', 'Pending', 'ACTIVE'].includes(a.status)
                )
                const latest = activeOnes[0]
                if (latest && (!activeIncident || activeIncident.id !== latest.id)) {
                    setActiveIncident(latest)
                    fetchEmergencyServices(latest.plate, latest.camera_id)
                }
            } catch (err) {
                console.error('Failed to poll accidents', err)
                setPollingError('Connection error: unable to reach accident service. Retrying…')
            }
        }

        const interval = setInterval(checkAccidents, 3000)
        return () => clearInterval(interval)
    }, [activeIncident])

    const fetchEmergencyServices = async (plate, cameraId) => {
        try {
            const vehicle = await api.get(`/vehicle/${plate}`)
            // Mocked emergency data based on registry
            setEmergencyDetails({
                emergency_contact: vehicle.owner_phone || '+91 98450 12345',
                police: { name: 'City Central Police Station', distance: '1.2 km', phone: '100' },
                ambulance: { driver: 'John Doe', plate: 'KL01AM101', phone: '911' },
                hospital: { name: 'Kochi General Hospital', distance: '3.5 km' }
            })
        } catch (err) {
            console.error('Failed to fetch emergency details', err)
        }
    }

    const handleSendAlert = async () => {
        setAlertSent(true)
        setTimeout(() => {
            let pos = 0
            const move = setInterval(() => {
                pos += 2
                setAmbulancePos(pos)
                if (pos >= 100) clearInterval(move)
            }, 200)
        }, 1000)

        try {
            await api.post('/send-alert', { accident_id: activeIncident.id })
        } catch (e) {
            console.log('Simulated alert call')
        }
    }

    return (
        <div className="p-6 h-screen flex flex-col gap-6 overflow-hidden">
            <div className="section-header mb-0">
                <Camera className="w-4 h-4 text-brand-blue-light" />
                <span className="section-title">Live CCTV Monitoring Stack</span>
                <div className="section-line" />
                <div className="flex items-center gap-2 ml-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-emerald-500/60 tracking-widest uppercase">AI Engine Active</span>
                </div>
            </div>

            <ErrorBanner
                message={pollingError}
                onDismiss={() => setPollingError(null)}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Camera Grid */}
                <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto pr-2">
                    {CAMERAS.map((cam) => (
                        <div key={cam.id} className="glass-card aspect-video group overflow-hidden relative">
                            {/* AI Scanning Overlay */}
                            <div className="absolute inset-0 z-20 pointer-events-none border border-white/5">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent animate-scan" />

                                {activeIncident?.camera_id === cam.id && (
                                    <>
                                        {/* Detection Box */}
                                        <div className="absolute top-[30%] left-[40%] w-[25%] h-[30%] border-2 border-red-500/80 animate-pulse">
                                            <div className="absolute -top-6 left-0 bg-red-600 text-[10px] font-mono font-bold px-2 py-0.5 text-white uppercase tracking-tighter">
                                                ACCIDENT DETECTED · 98.4%
                                            </div>
                                            <div className="absolute -bottom-6 right-0 text-[10px] font-mono text-red-400 bg-black/40 px-2">
                                                PLATE: {activeIncident.plate}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10">
                                <div className={clsx("w-2 h-2 rounded-full", activeIncident?.camera_id === cam.id ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                                <span className="font-mono text-[9px] text-white tracking-widest">{cam.id} · {cam.name}</span>
                            </div>

                            <video
                                src={cam.video}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        </div>
                    ))}
                </div>


                {/* Incident Panel */}
                <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
                    {!activeIncident ? (
                        pollingError ? (
                            <div className="glass-card flex-1 flex flex-col items-center justify-center p-8 text-center border-dashed border-red-500/30">
                                <AlertTriangle className="w-12 h-12 text-red-500/50 mb-4" />
                                <p className="font-mono text-xs text-red-400 tracking-wider mb-1">Unable to fetch incident status</p>
                                <p className="font-mono text-[10px] text-slate-500 tracking-wider">Backend connection lost. Retrying automatically…</p>
                            </div>
                        ) : (
                            <div className="glass-card flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50 border-dashed">
                                <Activity className="w-12 h-12 text-slate-700 mb-4" />
                                <p className="font-mono text-xs text-slate-500 tracking-wider">No Active Incidents Detected</p>
                            </div>
                        )
                    ) : (
                        <div className="glass-card flex-1 flex flex-col p-5 animate-scale-in border-red-500/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/20">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white tracking-wide">CRITICAL INCIDENT</h3>
                                    <p className="font-mono text-[10px] text-red-400 tracking-widest uppercase">{activeIncident.camera_id} · {activeIncident.plate}</p>
                                </div>
                            </div>

                            {emergencyDetails && (
                                <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                                    {/* Emergency Contact */}
                                    <div className="p-3 rounded-xl bg-navy-800/40 border border-white/5">
                                        <p className="font-mono text-[9px] text-slate-600 uppercase mb-2">Emergency Contact</p>
                                        <p className="text-sm text-slate-200 font-medium">{emergencyDetails.emergency_contact}</p>
                                    </div>

                                    {/* Police Station */}
                                    <div className="p-3 rounded-xl bg-navy-800/40 border border-brand-blue/10">
                                        <div className="flex items-center gap-3">
                                            <Landmark className="w-4 h-4 text-brand-blue-glow" />
                                            <div>
                                                <p className="font-mono text-[9px] text-slate-600 uppercase">Police Station Nearby</p>
                                                <p className="text-sm text-slate-200">{emergencyDetails.police.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ambulance/Driver */}
                                    <div className="p-3 rounded-xl bg-navy-800/40 border border-emerald-500/10">
                                        <div className="flex items-center gap-3">
                                            <Navigation2 className="w-4 h-4 text-emerald-400" />
                                            <div>
                                                <p className="font-mono text-[9px] text-slate-600 uppercase">Ambulance Allocated</p>
                                                <p className="text-sm text-slate-200">{emergencyDetails.ambulance.driver} ({emergencyDetails.ambulance.plate})</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hospital */}
                                    <div className="p-3 rounded-xl bg-navy-800/40 border border-amber-500/10">
                                        <div className="flex items-center gap-3">
                                            <Landmark className="w-4 h-4 text-amber-500" />
                                            <div>
                                                <p className="font-mono text-[9px] text-slate-600 uppercase">Nearest Hospital</p>
                                                <p className="text-sm text-slate-200">{emergencyDetails.hospital.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 space-y-3">
                                {!alertSent ? (
                                    <button
                                        onClick={handleSendAlert}
                                        className="w-full btn-primary !h-12 !justify-center bg-red-600 hover:bg-red-500 shadow-red-glow"
                                    >
                                        <Send className="w-4 h-4" />
                                        DISPATCH & NOTIFY ALL
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                            <p className="font-mono text-[10px] text-emerald-400 tracking-widest">ALERTS SENT VIA SMS</p>
                                        </div>

                                        {/* Live Tracking Visualization */}
                                        <div className="space-y-2">
                                            <p className="font-mono text-[9px] text-slate-600 uppercase text-center">Live Ambulance Tracking</p>
                                            <div className="relative h-2 bg-navy-900 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300"
                                                    style={{ width: `${ambulancePos}%` }}
                                                />
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded-full bg-white shadow-lg transition-all duration-300"
                                                    style={{ left: `calc(${ambulancePos}% - 10px)` }}
                                                >
                                                    <Navigation2 className="w-3 h-3 text-emerald-600 rotate-90" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between font-mono text-[8px] text-slate-700 px-1">
                                                <span>STATION</span>
                                                <span>INCIDENT SPOT</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
