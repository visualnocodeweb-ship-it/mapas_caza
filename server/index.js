import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { geojsonToKml, submissionsToKml } from './utils/geoConverter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Contraseña de administración
const ADMIN_PASSWORD = 'Emanuel321';

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

// Función para obtener IP del cliente
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown';
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Autenticación para panel de administración
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: 'Autenticación exitosa' });
    } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
});

// Guardar nuevo registro con polígono
app.post('/api/submissions', async (req, res) => {
    try {
        const { email, establecimiento, polygon } = req.body;

        // Validaciones
        if (!email || !establecimiento || !polygon) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: email, establecimiento, polygon'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Obtener IP del cliente
        const userIP = getClientIP(req);

        // Convertir GeoJSON a formato PostGIS
        const geojsonString = JSON.stringify(polygon);

        const result = await pool.query(
            `INSERT INTO submissions (email, establecimiento, polygon, user_ip) 
       VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4) 
       RETURNING id, email, establecimiento, ST_AsGeoJSON(polygon) as polygon, user_ip, created_at`,
            [email, establecimiento, geojsonString, userIP]
        );

        const submission = result.rows[0];
        submission.polygon = JSON.parse(submission.polygon);

        res.status(201).json({
            message: 'Registro guardado exitosamente',
            data: submission
        });
    } catch (error) {
        console.error('Error al guardar registro:', error);
        res.status(500).json({
            error: 'Error al guardar el registro',
            details: error.message
        });
    }
});

// Obtener todos los registros
app.get('/api/submissions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, establecimiento, 
              ST_AsGeoJSON(polygon) as polygon, 
              user_ip,
              created_at 
       FROM submissions 
       ORDER BY created_at DESC`
        );

        const submissions = result.rows.map(row => ({
            ...row,
            polygon: JSON.parse(row.polygon)
        }));

        res.json({
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({
            error: 'Error al obtener registros',
            details: error.message
        });
    }
});

// Obtener un registro específico
app.get('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, email, establecimiento, 
              ST_AsGeoJSON(polygon) as polygon, 
              user_ip,
              created_at 
       FROM submissions 
       WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        const submission = result.rows[0];
        submission.polygon = JSON.parse(submission.polygon);

        res.json({ data: submission });
    } catch (error) {
        console.error('Error al obtener registro:', error);
        res.status(500).json({
            error: 'Error al obtener el registro',
            details: error.message
        });
    }
});

// Descargar KML de un registro específico
app.get('/api/submissions/:id/kml', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, email, establecimiento, 
              ST_AsGeoJSON(polygon) as polygon, 
              created_at 
       FROM submissions 
       WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        const submission = result.rows[0];
        const polygon = JSON.parse(submission.polygon);

        const kml = geojsonToKml(polygon, {
            email: submission.email,
            establecimiento: submission.establecimiento,
            created_at: submission.created_at
        });

        res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml');
        res.setHeader('Content-Disposition', `attachment; filename="${submission.establecimiento}_${id}.kml"`);
        res.send(kml);
    } catch (error) {
        console.error('Error al generar KML:', error);
        res.status(500).json({
            error: 'Error al generar archivo KML',
            details: error.message
        });
    }
});

// Exportar todos los registros como un solo archivo KML
app.get('/api/export/all-kml', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, establecimiento, 
              ST_AsGeoJSON(polygon) as polygon, 
              user_ip,
              created_at 
       FROM submissions 
       ORDER BY created_at DESC`
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No hay registros para exportar' });
        }

        const submissions = result.rows.map(row => ({
            ...row,
            polygon: JSON.parse(row.polygon)
        }));

        const kml = submissionsToKml(submissions);

        res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml');
        res.setHeader('Content-Disposition', `attachment; filename="mapas_caza_todos_${Date.now()}.kml"`);
        res.send(kml);
    } catch (error) {
        console.error('Error al exportar KML:', error);
        res.status(500).json({
            error: 'Error al exportar archivo KML',
            details: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});
