-- Habilitar extensión PostGIS para datos geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crear tabla para almacenar los registros de campos de caza
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  establecimiento VARCHAR(255) NOT NULL,
  polygon GEOMETRY(Polygon, 4326) NOT NULL,
  user_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice espacial para mejorar consultas geográficas
CREATE INDEX IF NOT EXISTS idx_polygon ON submissions USING GIST(polygon);

-- Crear índice para búsquedas por establecimiento
CREATE INDEX IF NOT EXISTS idx_establecimiento ON submissions(establecimiento);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_email ON submissions(email);

-- Crear índice para búsquedas por IP
CREATE INDEX IF NOT EXISTS idx_user_ip ON submissions(user_ip);
