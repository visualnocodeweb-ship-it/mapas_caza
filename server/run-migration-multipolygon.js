import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const CONNECTION_STRING = process.env.DATABASE_URL;

async function runMigration() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: CONNECTION_STRING?.includes('render.com') ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado');

        console.log('\n📋 Leyendo migración MultiPolygon...');
        const migrationPath = path.join(__dirname, 'migration_multipolygon.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Ejecutando cambio de tipo de columna...');
        await client.query(migration);
        console.log('✅ Base de datos migrada a MultiPolygon exitosamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

runMigration();
