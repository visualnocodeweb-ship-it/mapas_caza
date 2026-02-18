import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Usar la URL de conexión directa si está disponible, sino la de entorno (local)
// NOTA: Para producción en este caso específico usaremos la hardcoded del usuario si no hay env
const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://mapa_caza_2026_user:LeSjCMysnMrxE79uFiiksQHXSSmGRCUv@dpg-d6agtdggjchc73f4ltu0-a.virginia-postgres.render.com/mapa_caza_2026';

async function runMigration() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado');

        console.log('\n📋 Leyendo migración...');
        const migrationPath = path.join(__dirname, 'migration_add_date.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Ejecutando migración...');
        await client.query(migration);
        console.log('✅ Columna fecha agregada correctamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

runMigration();
