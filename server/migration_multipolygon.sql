-- Cambiar tipo de columna a MultiPolygon
-- CAST directo usando ST_Multi para convertir los Polygons existentes
ALTER TABLE submissions
  ALTER COLUMN polygon TYPE geometry(MultiPolygon, 4326)
  USING ST_Multi(polygon);
