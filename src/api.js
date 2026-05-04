import axios from "axios";

// ✅ En Railway (misma app), la API vive en el mismo dominio:
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_key");
  if (token) {
    config.headers["x-access-key"] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores 401 (No autorizado)
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Si la API dice que no estamos autorizados, limpiamos el token y redirigimos al login
    localStorage.removeItem("access_key");
    window.location.href = "/";
  }
  return Promise.reject(error);
});

// Autenticación
export const login = (username, password) => api.post("/auth/login", { username, password });

export const addLead = (leadData) => api.post("/leads", leadData);
export const getLeads = () => api.get("/leads");
export const updateLead = (id, estado) => api.put(`/leads/${id}`, { estado });
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getStats = () => api.get("/stats");
export const getLeadHistory = (id) => api.get(`/leads/${id}/history`);
export const addInteraction = (id, data) => api.post(`/leads/${id}/interaction`, data);

export default api;
