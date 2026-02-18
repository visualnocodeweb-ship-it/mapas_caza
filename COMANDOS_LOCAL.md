# Comandos para Probar la Aplicación Localmente

## 📋 Paso 1: Configurar la Base de Datos

Primero necesitamos crear la tabla en la base de datos de Render.

### Opción A: Usando psql (si lo instalas)
```bash
# Instalar PostgreSQL desde: https://www.postgresql.org/download/windows/
# Luego ejecutar:
psql postgresql://base_datos_tablero_traful_pagina_general_user:bEKhclV6N026s8jNQcBDaH5sou0HZtmA@dpg-d64tk2i4d50c73eoksug-a.oregon-postgres.render.com/base_datos_tablero_traful_pagina_general -f server/schema.sql
```

### Opción B: Desde Render Dashboard (más fácil)
1. Ve a https://dashboard.render.com
2. Abre tu base de datos PostgreSQL
3. Click en "Connect" → "External Connection"
4. Copia el comando PSQL que aparece
5. Pega en tu terminal y presiona Enter
6. Una vez conectado, copia y pega el contenido de `server/schema.sql`

### Opción C: Usar pgAdmin (GUI)
1. Descargar pgAdmin: https://www.pgadmin.org/download/
2. Conectar con estos datos:
   - Host: `dpg-d64tk2i4d50c73eoksug-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `base_datos_tablero_traful_pagina_general`
   - Username: `base_datos_tablero_traful_pagina_general_user`
   - Password: `bEKhclV6N026s8jNQcBDaH5sou0HZtmA`
3. Ejecutar el contenido de `server/schema.sql`

---

## 🚀 Paso 2: Iniciar el Backend

Abrir una terminal en la carpeta del proyecto:

```bash
cd server
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3001
📊 API disponible en http://localhost:3001/api
```

---

## 🎨 Paso 3: Iniciar el Frontend

Abrir OTRA terminal (dejar la anterior corriendo):

```bash
npm run dev
```

Deberías ver:
```
VITE v7.3.1  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🌐 Paso 4: Abrir en el Navegador

Abre tu navegador en: **http://localhost:5173**

---

## ✅ Probar la Aplicación

1. **Registrar un campo:**
   - Completa tu email
   - Selecciona un establecimiento
   - Dibuja un polígono en el mapa (botón arriba a la derecha)
   - Click en "Guardar Registro"

2. **Ver registros:**
   - Click en la pestaña "Administración"
   - Verás todos los registros
   - Click en "📥 KML" para descargar

3. **Abrir KML:**
   - Ve a https://earth.google.com/web/
   - Click en el menú (3 líneas) → "Proyectos" → "Importar archivo KML"
   - Sube el archivo descargado

---

## 🛑 Para Detener

Presiona `Ctrl + C` en ambas terminales (backend y frontend)

---

## 📝 Notas

- El backend corre en: `http://localhost:3001`
- El frontend corre en: `http://localhost:5173`
- La base de datos está en Render (ya configurada)
- Los archivos `.env` ya están configurados

---

## ⚠️ Si hay errores

**Error de conexión a base de datos:**
- Verifica que ejecutaste el `schema.sql` en la base de datos
- Verifica que la URL de la base de datos sea correcta en `server/.env`

**Error "Cannot find module":**
```bash
# En la raíz del proyecto
npm install

# En la carpeta server
cd server
npm install
```

**Puerto ocupado:**
Si el puerto 3001 o 5173 está ocupado, puedes cambiarlos en:
- Backend: `server/.env` → cambiar `PORT=3001`
- Frontend: `vite.config.js` → agregar `server: { port: 5174 }`
