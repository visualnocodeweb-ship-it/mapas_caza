-- Script para agregar columna user_ip a tabla existente
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_ip VARCHAR(45);

-- Crear índice para búsquedas por IP
CREATE INDEX IF NOT EXISTS idx_user_ip ON submissions(user_ip);
