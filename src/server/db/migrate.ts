import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index.js';

async function runMigrations() {
  console.log('====================================================');
  console.log('🔄 Iniciando aplicación de migraciones versionadas...');
  console.log('====================================================');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ ¡Todas las migraciones fueron aplicadas con éxito a PostgreSQL!');
  } catch (error) {
    console.error('❌ Error fatal al aplicar migraciones:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
