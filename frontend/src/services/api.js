import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export const getDashboard = () => api.get('/dashboard').then(r => r.data)

export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data)
export const getTransaction = (id) => api.get(`/transactions/${id}`).then(r => r.data)

export const getEvents = (params) => api.get('/events', { params }).then(r => r.data)
export const getUserTimeline = (user) => api.get(`/events/timeline/${encodeURIComponent(user)}`).then(r => r.data)
export const getWorldMapEvents = () => api.get('/events/map/world').then(r => r.data)

export const getHighRiskTransactions = (limit = 20) => api.get('/threats/high-risk', { params: { limit } }).then(r => r.data)
export const getAlerts = (status) => api.get('/threats/alerts', { params: status ? { status } : {} }).then(r => r.data)
export const updateAlert = (id, status) => api.post(`/threats/alerts/${id}/update`, null, { params: { status } }).then(r => r.data)

export const getAnalytics = () => api.get('/analytics').then(r => r.data)

export const getQuantumAssets = () => api.get('/quantum').then(r => r.data)
export const getQuantumEducation = () => api.get('/quantum/education').then(r => r.data)
export const getQuantumLiveDetections = () => api.get('/quantum/live-detections').then(r => r.data)

export const getModelPerformance = () => api.get('/analytics/model-performance').then(r => r.data)

export const explainTransaction = (transaction_id) => api.post('/explanation', { transaction_id }).then(r => r.data)

export const sendChatMessage = (message) => api.post('/chat', { message }).then(r => r.data)

export const simulateAttack = () => api.post('/simulate').then(r => r.data)

export default api
