import { useState, useEffect, useCallback } from 'react'
import { accidentService, healthService } from '../api'
import { MOCK_ACCIDENTS, KOCHI_SCATTER_COORDS } from '../services/mockData'

/**
 * Enrich a single accident record with coordinates if the backend didn't return them.
 * The backend now joins cameras, so lat/lng should usually be present.
 * This is a pure safety-net fallback.
 */
function ensureCoords(accident, index) {
  if (accident.latitude && accident.longitude) return accident
  const coords = KOCHI_SCATTER_COORDS[index % KOCHI_SCATTER_COORDS.length]
  return {
    ...accident,
    latitude: coords.latitude + Math.sin(index * 7.3) * 0.006,
    longitude: coords.longitude + Math.cos(index * 5.1) * 0.006,
    location: accident.location || coords.location,
  }
}

export function useAccidents(autoRefreshMs = 10000) {
  const [accidents, setAccidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)

    const online = await healthService.check()
    setIsOnline(online)

    if (online) {
      try {
        const data = await accidentService.getAll()
        const raw = Array.isArray(data) ? data : []
        // Backend now returns enriched records; just ensure coords exist
        const enriched = raw.map((a, i) => ensureCoords(a, i))
        setAccidents(enriched)
        setUsingMock(false)
        setError(null)
      } catch (err) {
        setError(err.message)
        setAccidents(MOCK_ACCIDENTS)
        setUsingMock(true)
      }
    } else {
      setAccidents(MOCK_ACCIDENTS)
      setUsingMock(true)
      setError(null)
    }

    setLastRefresh(new Date())
    if (!silent) setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), autoRefreshMs)
    return () => clearInterval(interval)
  }, [fetchData, autoRefreshMs])

  return { accidents, loading, error, isOnline, lastRefresh, usingMock, refetch: fetchData }
}
