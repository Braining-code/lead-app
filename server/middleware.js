export const checkAccess = (req, res, next) => {
  const key = req.headers['x-access-key'] || req.query.key;
  
  if (!process.env.ACCESS_KEY) {
    console.error("CRITICAL: ACCESS_KEY environment variable is not set!");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (key !== process.env.ACCESS_KEY) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }
  
  next();
};

export const validateLead = (req, res, next) => {
  const { nombre, apellido, telefono } = req.body;
  
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido' });
  if (!apellido?.trim()) return res.status(400).json({ error: 'Apellido requerido' });
  if (!telefono?.trim()) return res.status(400).json({ error: 'Teléfono requerido' });
  
  // Validar teléfono (básico)
  if (!/^\d{7,20}$/.test(telefono.replace(/\D/g, ''))) {
    return res.status(400).json({ error: 'Teléfono inválido' });
  }
  
  // Validar email si está presente
  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  next();
};
