import axios from "axios";

// ✅ En Railway (misma app), la API vive en el mismo dominio:
const API_URL = import.meta.env.VITE_API_URL || "/api";
const ACCESS_KEY = "dental2026";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "x-access-key": ACCESS_KEY,
    "Content-Type": "application/json",
  },
});

export const addLead = (leadData) => api.post("/leads", leadData);
export const getLeads = () => api.get("/leads");
export const updateLead = (id, estado) => api.put(`/leads/${id}`, { estado });
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getStats = () => api.get("/stats");
export const getLeadHistory = (id) => api.get(`/leads/${id}/history`);
export const addInteraction = (id, data) => api.post(`/leads/${id}/interaction`, data);

export default api;
