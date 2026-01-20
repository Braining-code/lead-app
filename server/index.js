import express from "express";
import cors from "cors";
import { initDB } from "./db.js";
import { checkAccess } from "./middleware.js";
import routes from "./routes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware base
app.use(cors());
app.use(express.json());

// Health check (sin ACCESS_KEY)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API protegida
app.use("/api", checkAccess, routes);

// --- SERVIR FRONTEND (Vite build) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /dist está en la raíz del proyecto (un nivel arriba de /server)
const distPath = path.join(__dirname, "../dist");

// Archivos estáticos
app.use(express.static(distPath));

// Fallback SPA
app.get("*", (req, res) => {
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
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
};

start();
