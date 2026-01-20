export const checkAccess = (req, res, next) => {
  const key = req.headers["x-access-key"];

  if (!key || key !== process.env.ACCESS_KEY) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  next();
};

export const validateLead = (req, res, next) => {
  const { contacto, nombre, apellido, telefono, zona, estado, email } = req.body;

  if (!contacto?.trim()) {
    return res.status(400).json({ error: "Contacto requerido" });
  }

  if (!nombre?.trim()) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  if (!apellido?.trim()) {
    return res.status(400).json({ error: "Apellido requerido" });
  }

  if (!telefono?.trim()) {
    return res.status(400).json({ error: "Teléfono requerido" });
  }

  if (!zona?.trim()) {
    return res.status(400).json({ error: "Zona requerida" });
  }

  if (!estado?.trim()) {
    return res.status(400).json({ error: "Estado requerido" });
  }

  // Validar teléfono (solo números, largo razonable)
  const cleanPhone = telefono.replace(/\D/g, "");
  if (!/^\d{7,20}$/.test(cleanPhone)) {
    return res.status(400).json({ error: "Teléfono inválido" });
  }

  // Validar email si existe
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  next();
};
