import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// URL externa de Render proporcionada por el usuario
const CONNECTION_STRING = 'postgresql://mapa_caza_2026_user:LeSjCMysnMrxE79uFiiksQHXSSmGRCUv@dpg-d6agtdggjchc73f4ltu0-a.virginia-postgres.render.com/mapa_caza_2026';

async function setupRenderDatabase() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Conectando a la base de datos de Render...');
        await client.connect();
        console.log('✅ Conexión exitosa');

        console.log('\n📋 Leyendo schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Ejecutando schema en Render...');
        await client.query(schema);
        console.log('✅ Schema ejecutado correctamente');

        console.log('\n📋 Agregando columna user_ip si no existe...');
        const migrationPath = path.join(__dirname, 'migration_add_ip.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');
        await client.query(migration);
        console.log('✅ Migración de IP verificada');

        console.log('\n📊 Verificando tabla submissions...');
        const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'submissions'
    `);

        console.log('Columnas creadas:', result.rows.map(r => r.column_name).join(', '));
        console.log('\n✨ BASE DE DATOS LISTA PARA PRODUCCIÓN ✨');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

setupRenderDatabase();
