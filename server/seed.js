import pool from './db.js';

const seedData = async () => {
  const leads = [
    { contacto: 'whatsapp', nombre: 'Dolores', apellido: 'García', telefono: '1140477434', email: 'dolores@example.com', zona: 'Capital Federal', estado: 'Ganado' },
    { contacto: 'instagram', nombre: 'Juana', apellido: 'López', telefono: '1164913915', email: 'juana@example.com', zona: 'Zona Norte', estado: 'Agendado' },
    { contacto: 'whatsapp', nombre: 'Ivo', apellido: 'Martínez', telefono: '1151240095', email: 'ivo@example.com', zona: 'Zona Sur', estado: 'Agendado' },
    { contacto: 'web', nombre: 'Fabrizio', apellido: 'Rossi', telefono: '3716404594', email: 'fabrizio@example.com', zona: 'Interior', estado: 'Agendado' },
    { contacto: 'whatsapp', nombre: 'Jose Luis', apellido: 'Fernández', telefono: '1141945639', email: 'joseluis@example.com', zona: 'Capital Federal', estado: 'Agendado' },
    { contacto: 'instagram', nombre: 'Romina', apellido: 'Pérez', telefono: '1165522592', email: 'romina@example.com', zona: 'Zona Oeste', estado: 'Agendado' },
    { contacto: 'whatsapp', nombre: 'Lola', apellido: 'Gómez', telefono: '92396429414', email: 'lola@example.com', zona: 'Capital Federal', estado: 'Agendado' },
    { contacto: 'web', nombre: 'Martina', apellido: 'Sánchez', telefono: '1140566756', email: 'martina@example.com', zona: 'Zona Norte', estado: 'Perdido' },
    { contacto: 'whatsapp', nombre: 'Sergio David', apellido: 'Díaz', telefono: '3794666122', email: 'sergio@example.com', zona: 'Interior', estado: 'Agendado' },
    { contacto: 'instagram', nombre: 'Camila', apellido: 'Romero', telefono: '1157409982', email: 'camila@example.com', zona: 'Capital Federal', estado: 'Agendado' },
    { contacto: 'whatsapp', nombre: 'Pilar', apellido: 'Álvarez', telefono: '1153251412', email: 'pilar@example.com', zona: 'Zona Sur', estado: 'Agendado' }
  ];

  console.log('Iniciando carga de leads de prueba...');

  try {
    // Wait a bit for DB to initialize just in case
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (const lead of leads) {
      await pool.query(
        `INSERT INTO leads (contacto, nombre, apellido, telefono, email, zona, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [lead.contacto, lead.nombre, lead.apellido, lead.telefono, lead.email, lead.zona, lead.estado]
      );
    }
    console.log('✅ Leads de prueba cargados exitosamente.');
  } catch (error) {
    console.error('Error cargando leads:', error);
  }
  process.exit(0);
};

// Necesitamos importar initDB para que se cree la tabla si no existe
import { initDB } from './db.js';

const run = async () => {
  await initDB();
  await seedData();
};

run();
