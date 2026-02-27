import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import LiveFeed from './pages/LiveFeed'
import AccidentMap from './pages/AccidentMap'
import VehicleSearch from './pages/VehicleSearch'
import CCTVMonitor from './pages/CCTVMonitor'
import { useAccidents } from './hooks/useAccidents'

function AppLayout() {
  const { accidents, loading, error, isOnline, lastRefresh, usingMock, refetch } = useAccidents(10000)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-navy-950 bg-grid-pattern bg-grid">
      {/* Sidebar */}
      <Sidebar isOnline={isOnline} />

      {/* Main content */}
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <Topbar
          isOnline={isOnline}
          usingMock={usingMock}
          lastRefresh={lastRefresh}
          onRefresh={refetch}
          accidents={accidents}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={<Dashboard accidents={accidents} loading={loading} error={error} />}
            />
            <Route
              path="/live"
              element={
                <LiveFeed
                  accidents={accidents}
                  loading={loading}
                  error={error}
                  lastRefresh={lastRefresh}
                  onRefresh={refetch}
                />
              }
            />
            <Route
              path="/map"
              element={<AccidentMap accidents={accidents} loading={loading} />}
            />
            <Route path="/vehicle" element={<VehicleSearch />} />
            <Route path="/monitor" element={<CCTVMonitor />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
