import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Tasks API ────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params = {}) => api.get('/tasks', { params }).then(r => r.data.data),
  getStats: () => api.get('/tasks/stats').then(r => r.data.data),
  getById: (id) => api.get(`/tasks/${id}`).then(r => r.data.data),
  create: (data) => api.post('/tasks', data).then(r => r.data.data),
  update: (id, data) => api.patch(`/tasks/${id}`, data).then(r => r.data.data),
  delete: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
  reorder: (tasks) => api.patch('/tasks/bulk/reorder', { tasks }).then(r => r.data),
  getHealth: () => api.get('/health', { baseURL: '' }).then(r => r.data), // baseURL overrides /api
}

export default api