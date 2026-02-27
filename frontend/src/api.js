import axios from 'axios'

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[SANJEEVANI API] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'API Error'
    return Promise.reject(new Error(msg))
  }
)

export default api

// ─── Service Calls ────────────────────────────────────────────────────────────
export const accidentService = {
  getAll: () => api.get('/accidents'),
  getById: (id) => api.get(`/accidents/${id}`),
}

export const vehicleService = {
  getByPlate: (plate) => api.get(`/vehicle/${encodeURIComponent(plate)}`),
}

export const healthService = {
  check: () =>
    api.get('/health')
      .then(() => true)
      .catch(() => false),
}
