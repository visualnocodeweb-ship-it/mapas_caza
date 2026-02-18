import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Client } = pg;

async function setupDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado exitosamente');

        console.log('\n📋 Ejecutando schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schema);
        console.log('✅ Schema ejecutado correctamente');

        console.log('\n📊 Verificando tabla submissions...');
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'submissions'
    `);

        if (result.rows.length > 0) {
            console.log('✅ Tabla "submissions" creada correctamente');

            const countResult = await client.query('SELECT COUNT(*) FROM submissions');
            console.log(`📈 Registros actuales: ${countResult.rows[0].count}`);
        } else {
            console.log('❌ Error: Tabla "submissions" no encontrada');
        }

    } catch (error) {
        console.error('❌ Error al configurar la base de datos:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Desconectado de la base de datos');
    }
}

setupDatabase();
