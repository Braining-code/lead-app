import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ACCESS_KEY = 'dental2026';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'x-access-key': ACCESS_KEY,
    'Content-Type': 'application/json'
  }
});

export const addLead = (leadData) => api.post('/leads', leadData);
export const getLeads = () => api.get('/leads');
export const updateLead = (id, estado) => api.put(`/leads/${id}`, { estado });
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getStats = () => api.get('/stats');

export default api;
