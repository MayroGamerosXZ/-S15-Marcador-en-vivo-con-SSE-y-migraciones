import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/marcador_live',
  connectionTimeoutMillis: 1500, // No bloquear peticiones si PostgreSQL está apagado
  idleTimeoutMillis: 5000,
});

// Evitar que el proceso colapse por errores no capturados del pool
pool.on('error', (err) => {
  // Ignorar errores transitorios de conexión cuando la BD está apagada
});

export const db = drizzle(pool, { schema });
