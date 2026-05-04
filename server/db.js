import pkg from 'pg';
const { Pool } = pkg;

const isPostgres = !!process.env.DATABASE_URL;

let pgPool;
let sqliteDb;

if (isPostgres) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

const pool = {
  query: async (text, params) => {
    if (isPostgres) {
      return pgPool.query(text, params);
    } else {
      if (!sqliteDb) {
        throw new Error('SQLite DB no inicializada');
      }
      
      const sqlText = text.replace(/\$\d+/g, '?');
      const isSelectOrReturning = sqlText.trim().toUpperCase().startsWith('SELECT') || sqlText.toUpperCase().includes('RETURNING');
      
      if (isSelectOrReturning) {
        const rows = await sqliteDb.all(sqlText, params || []);
        return { rows };
      } else {
        const result = await sqliteDb.run(sqlText, params || []);
        return { rows: [], changes: result.changes, lastID: result.lastID };
      }
    }
  }
};

export const initDB = async () => {
  try {
    if (isPostgres) {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          contacto VARCHAR(50) NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          telefono VARCHAR(20) NOT NULL,
          email VARCHAR(100),
          zona VARCHAR(50) NOT NULL,
          estado VARCHAR(50) NOT NULL,
          fecha DATE DEFAULT CURRENT_DATE,
          hora TIME DEFAULT CURRENT_TIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS lead_interactions (
          id SERIAL PRIMARY KEY,
          lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
          tipo VARCHAR(20) NOT NULL, -- 'email' o 'sms'
          plantilla VARCHAR(100) NOT NULL,
          fecha DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Base de datos PostgreSQL inicializada');
    } else {
      const sqlite3 = (await import('sqlite3')).default;
      const { open } = await import('sqlite');
      
      sqliteDb = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
      });
      
      await sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contacto TEXT NOT NULL,
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          telefono TEXT NOT NULL,
          email TEXT,
          zona TEXT NOT NULL,
          estado TEXT NOT NULL,
          fecha DATE DEFAULT CURRENT_DATE,
          hora TIME DEFAULT CURRENT_TIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS lead_interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
          tipo TEXT NOT NULL,
          plantilla TEXT NOT NULL,
          fecha DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Base de datos SQLite local inicializada');
    }
  } catch (error) {
    console.error('Error inicializando BD:', error);
  }
};

export default pool;
