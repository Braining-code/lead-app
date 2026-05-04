import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { initDB } from "./db.js";
import { checkAccess } from "./middleware.js";
import routes from "./routes.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de autenticación (sin ACCESS_KEY)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error("CRITICAL: ADMIN_USERNAME or ADMIN_PASSWORD environment variables are not set!");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Si es correcto, retornamos el ACCESS_KEY para que el frontend lo use en futuras peticiones
    return res.json({ token: process.env.ACCESS_KEY });
  } else {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Check ACCESS_KEY en todas las demás rutas /api
app.use("/api", checkAccess);

// Rutas API
app.use("/api", routes);

// Health check (sin ACCESS_KEY)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- SERVIR FRONTEND (Vite build) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /dist está en la raíz del proyecto (un nivel arriba de /server)
const distPath = path.join(__dirname, "../dist");

// Servir archivos estáticos (assets, index.html, etc.)
app.use(express.static(distPath));

// Fallback SPA: cualquier ruta que NO sea /api ni /health vuelve al frontend
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") return next();
  res.sendFile(path.join(distPath, "index.html"));
});

// Iniciar servidor
const start = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en puerto ${PORT}`);
      console.log(`📊 API lista en /api`);
    });
  } catch (error) {
    console.error("Error iniciando servidor:", error);
    process.exit(1);
  }
};

start();
