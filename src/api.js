import axios from "axios";

// En Railway, frontend y backend viven en el mismo dominio
const api = axios.create({
  baseURL: "/api",
  headers: {
    "x-access-key": "dental2026",
    "Content-Type": "application/json",
  },
});

export const addLead = (leadData) => api.post("/leads", leadData);
export const getLeads = () => api.get("/leads");
export const updateLead = (id, estado) =>
  api.put(`/leads/${id}`, { estado });
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getStats = () => api.get("/stats");

export default api;
