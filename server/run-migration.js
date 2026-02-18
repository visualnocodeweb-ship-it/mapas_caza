import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Client } = pg;

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado exitosamente');

        console.log('\n📋 Ejecutando migración para agregar columna user_ip...');
        const migrationPath = path.join(__dirname, 'migration_add_ip.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        await client.query(migration);
        console.log('✅ Migración ejecutada correctamente');

        console.log('\n📊 Verificando columna user_ip...');
        const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' AND column_name = 'user_ip'
    `);

        if (result.rows.length > 0) {
            console.log('✅ Columna "user_ip" agregada correctamente');
        } else {
            console.log('❌ Error: Columna "user_ip" no encontrada');
        }

    } catch (error) {
        console.error('❌ Error al ejecutar migración:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Desconectado de la base de datos');
    }
}

runMigration();
