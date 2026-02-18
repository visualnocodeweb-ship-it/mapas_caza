import express from 'express';
import pg from 'pg';
import cors from 'cors';
import tokml from 'tokml';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Configuración de base de datos
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://mapas-caza-frontend.onrender.com',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json());

// Función para obtener IP
const getClientIP = (req) => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    return req.socket.remoteAddress;
};

// --- ENDPOINTS ---

// 1. Guardar nuevo registro
app.post('/api/submissions', async (req, res) => {
    try {
        const { email, establecimiento, polygon, fecha } = req.body;

        // Obtener IP del cliente
        const userIP = getClientIP(req);

        // Validaciones básicas
        if (!email || !establecimiento || !polygon) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Convertir GeoJSON a formato PostGIS
        const geojsonString = JSON.stringify(polygon);

        const result = await pool.query(
            `INSERT INTO submissions (email, establecimiento, polygon, user_ip, fecha) 
             VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5) 
             RETURNING id, email, establecimiento, ST_AsGeoJSON(polygon) as polygon, user_ip, fecha, created_at`,
            [email, establecimiento, geojsonString, userIP, fecha || new Date()]
        );

        res.status(201).json({
            success: true,
            data: {
                ...result.rows[0],
                polygon: JSON.parse(result.rows[0].polygon)
            }
        });
    } catch (err) {
        console.error('Error al guardar:', err);
        res.status(500).json({ error: 'Error al guardar el registro' });
    }
});

// 2. Obtener todos los registros con paginación y área
app.get('/api/submissions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Consulta para obtener datos con paginación y área
        // ST_Area devuelve metros cuadrados. Dividimos por 10000 para hectáreas.
        const dataQuery = `
            SELECT id, email, establecimiento, 
              ST_AsGeoJSON(polygon) as polygon, 
              user_ip,
              created_at,
              fecha,
              (ST_Area(polygon::geography) / 10000) as area_has
            FROM submissions 
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const countQuery = 'SELECT COUNT(*) FROM submissions';

        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [limit, offset]),
            pool.query(countQuery)
        ]);

        const totalRecords = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        const submissions = dataResult.rows.map(row => ({
            id: row.id,
            email: row.email,
            establecimiento: row.establecimiento,
            polygon: JSON.parse(row.polygon),
            user_ip: row.user_ip,
            created_at: row.created_at,
            fecha: row.fecha,
            area_has: row.area_has ? parseFloat(row.area_has).toFixed(2) : '0.00'
        }));

        res.json({
            success: true,
            data: submissions,
            pagination: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

// 3. Eliminar un registro
app.delete('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM submissions WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        res.json({ success: true, message: 'Registro eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el registro' });
    }
});

// 4. Descargar KML individual
app.get('/api/submissions/:id/kml', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, email, establecimiento, ST_AsGeoJSON(polygon) as polygon FROM submissions WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No encontrado' });
        }

        const row = result.rows[0];
        const polygon = JSON.parse(row.polygon);

        const kml = tokml({
            type: 'Feature',
            geometry: polygon,
            properties: {
                name: row.establecimiento,
                description: `Email: ${row.email}`
            }
        });

        res.header('Content-Type', 'application/vnd.google-earth.kml+xml');
        res.header('Content-Disposition', `attachment; filename="${row.establecimiento}.kml"`);
        res.send(kml);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar KML' });
    }
});

// 5. Descargar Todos los KML
app.get('/api/export/all-kml', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, establecimiento, ST_AsGeoJSON(polygon) as polygon FROM submissions`
        );

        const features = result.rows.map(row => ({
            type: 'Feature',
            geometry: JSON.parse(row.polygon),
            properties: {
                name: `${row.establecimiento} (${row.id})`,
                description: `Email: ${row.email}`
            }
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        const kml = tokml(geojson);

        res.header('Content-Type', 'application/vnd.google-earth.kml+xml');
        res.header('Content-Disposition', 'attachment; filename="todos_los_mapas.kml"');
        res.send(kml);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al exportar todo' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en puerto ${port}`);
});
