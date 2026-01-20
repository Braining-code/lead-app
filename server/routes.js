import express from "express";
import pool from "./db.js";
import { validateLead } from "./middleware.js";

const router = express.Router();

// POST - Agregar lead
router.post("/leads", validateLead, async (req, res) => {
  try {
    const { contacto, nombre, apellido, telefono, email, zona, estado } = req.body;

    const result = await pool.query(
      `
      INSERT INTO leads (
        contacto,
        nombre,
        apellido,
        telefono,
        email,
        zona,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        contacto,
        nombre,
        apellido,
        telefono,
        email || null,
        zona,
        estado,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error inserting lead:", error);
    res.status(500).json({ error: "Error al guardar lead" });
  }
});

// GET - Listar leads
router.get("/leads", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM leads
      ORDER BY created_at DESC
      LIMIT 100
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({ error: "Error al obtener leads" });
  }
});

// PUT - Actualizar estado
router.put("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await pool.query(
      `
      UPDATE leads
      SET estado = $1
      WHERE id = $2
      RETURNING *
      `,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead no encontrado" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating lead:", error);
    res.status(500).json({ error: "Error al actualizar lead" });
  }
});

// DELETE - Eliminar lead
router.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM leads
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead no encontrado" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting lead:", error);
    res.status(500).json({ error: "Error al eliminar lead" });
  }
});

// GET - Stats
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query(
      `SELECT COUNT(*)::int AS count FROM leads`
    );

    const lastMonth = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM leads
      WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
      `
    );

    res.json({
      totalLeads: total.rows[0].count,
      lastMonthLeads: lastMonth.rows[0].count,
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({ error: "Error al obtener stats" });
  }
});

export default router;
