import express from 'express';
import pool from './db.js';
import { validateLead } from './middleware.js';

const router = express.Router();

// POST - Agregar lead
router.post('/leads', validateLead, async (req, res) => {
  try {
    const { contacto, nombre, apellido, telefono, email, zona, estado } = req.body;

    const result = await pool.query(
      `INSERT INTO leads (contacto, nombre, apellido, telefono, email, zona, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [contacto, nombre, apellido, telefono, email || null, zona, estado]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting lead:', error);
    res.status(500).json({ error: 'Error al guardar lead' });
  }
});

// GET - Listar leads
router.get('/leads', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, 
        (SELECT created_at FROM lead_interactions li WHERE li.lead_id = l.id AND li.tipo = 'estado' ORDER BY created_at DESC LIMIT 1) as status_date
       FROM leads l ORDER BY l.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Error al obtener leads' });
  }
});

// PUT - Actualizar estado
router.put('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await pool.query(
      `UPDATE leads SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    // Registrar cambio de estado para tracking
    await pool.query(
      `INSERT INTO lead_interactions (lead_id, tipo, plantilla) VALUES ($1, $2, $3)`,
      [id, 'estado', estado]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Error al actualizar lead' });
  }
});

// DELETE - Eliminar lead
router.delete('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM leads WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Error al eliminar lead' });
  }
});

// GET - Stats
router.get('/stats', async (req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*) FROM leads`);
    const lastMonth = await pool.query(
      `SELECT COUNT(*) FROM leads WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'`
    );

    res.json({
      totalLeads: parseInt(total.rows[0].count),
      lastMonthLeads: parseInt(lastMonth.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error al obtener stats' });
  }
});

// GET - Historial de interacciones
router.get('/leads/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM lead_interactions WHERE lead_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// POST - Registrar interacción (Simulando envío Brevo por ahora)
router.post('/leads/:id/interaction', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, plantilla } = req.body; // tipo: 'email' | 'sms'

    // Aquí iría la llamada a la API de Brevo
    // await sendBrevoMessage(...)

    const result = await pool.query(
      `INSERT INTO lead_interactions (lead_id, tipo, plantilla)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, tipo, plantilla]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ error: 'Error al registrar interacción' });
  }
});

export default router;
