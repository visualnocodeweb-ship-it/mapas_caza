import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function checkDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('🔌 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado exitosamente\n');

        // Verificar columnas de la tabla
        console.log('📋 Verificando estructura de la tabla submissions:');
        const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      ORDER BY ordinal_position
    `);

        console.log('\nColumnas encontradas:');
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Contar registros
        const count = await client.query('SELECT COUNT(*) FROM submissions');
        console.log(`\n📊 Total de registros: ${count.rows[0].count}`);

        // Ver primeros registros
        if (parseInt(count.rows[0].count) > 0) {
            const sample = await client.query('SELECT id, email, establecimiento, user_ip, created_at FROM submissions LIMIT 3');
            console.log('\n🔍 Muestra de registros:');
            sample.rows.forEach(row => {
                console.log(`  ID: ${row.id}, Email: ${row.email}, IP: ${row.user_ip || 'NULL'}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Desconectado');
    }
}

checkDatabase();
