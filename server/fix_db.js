import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

// URL específica de producción recuperada de logs anteriores para asegurar conexión
const CONNECTION_STRING = 'postgresql://mapa_caza_2026_user:LeSjCMysnMrxE79uFiiksQHXSSmGRCUv@dpg-d6agtdggjchc73f4ltu0-a.virginia-postgres.render.com/mapa_caza_2026';

async function fixDatabase() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Conectando a Render PostgreSQL...');
        await client.connect();
        console.log('✅ Conectado.');

        // 1. Verificar tipo de columna actual
        console.log('🔍 Verificando tipo de columna actual...');
        const checkRes = await client.query(`
      SELECT type 
      FROM geometry_columns 
      WHERE f_table_name = 'submissions' AND f_geometry_column = 'polygon';
    `);

        if (checkRes.rows.length > 0) {
            console.log(`ℹ️ Tipo actual detectado en metadatos PostGIS: ${checkRes.rows[0].type}`);
        } else {
            console.log('⚠️ No se encontró registro en geometry_columns (posiblemente usando tipo genérico o tabla no registrada)');
        }

        // 2. Intentar conversión forzada
        console.log('\n🛠️ Intentando convertir columna a MultiPolygon...');

        // Primero drop index para evitar bloqueos
        try {
            await client.query('DROP INDEX IF EXISTS idx_polygon;');
            console.log('   - Índice idx_polygon eliminado temporalmente.');
        } catch (e) {
            console.log(`   - Nota sobre índice: ${e.message}`);
        }

        // Alterar tabla
        // Usamos TYPE geometry(MultiPolygon, 4326) explícitamente
        await client.query(`
      ALTER TABLE submissions 
      ALTER COLUMN polygon TYPE geometry(MultiPolygon, 4326) 
      USING ST_Multi(polygon);
    `);
        console.log('✅ ALTER TABLE ejecutado correctamente.');

        // Recrear índice
        await client.query('CREATE INDEX idx_polygon ON submissions USING GIST(polygon);');
        console.log('✅ Índice idx_polygon recreado.');

        console.log('\n🎉 ¡Corrección finalizada con éxito!');

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
        if (error.code) console.error('   Código SQL:', error.code);
    } finally {
        await client.end();
    }
}

fixDatabase();
