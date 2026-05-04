import fs from 'fs';
import readline from 'readline';
import { initDB } from './db.js';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config(); // Loads variables from .env if present

const csvPath = 'c:\\Users\\LENOVO LOQ\\Downloads\\leads_export.csv';

const importCSV = async () => {
  try {
    await initDB();
    console.log(`📡 Conectado a la base de datos (Postgres: ${!!process.env.DATABASE_URL})`);
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Archivo CSV no encontrado en: ${csvPath}`);
      process.exit(1);
    }

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isFirstLine = true;
    let count = 0;

    for await (const line of rl) {
      // Ignorar cabecera
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      // Nombre, Apellido, Contacto, Telefono, Email, Estado, Fecha
      // Asegurarse de manejar comas dentro de las columnas si las hubiera (en este caso asumimos que no hay comas en los datos, es un CSV simple)
      const [nombre, apellido, contacto, telefono, email, estado, fecha] = line.split(',');

      if (!nombre) continue; // Skip líneas vacías

      await pool.query(
        `INSERT INTO leads (contacto, nombre, apellido, telefono, email, zona, estado, fecha)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          contacto || 'whatsapp', 
          nombre || '', 
          apellido || '', 
          telefono || '', 
          email || null, 
          '0-5 kms', // Zona por defecto ya que no está en el CSV exportado
          estado || 'Consultó',
          fecha || new Date().toISOString().split('T')[0]
        ]
      );
      count++;
    }

    console.log(`✅ ¡Éxito! Se importaron ${count} leads a la base de datos.`);
  } catch (error) {
    console.error('Error importando CSV:', error);
  } finally {
    process.exit(0);
  }
};

importCSV();
