# Configuración de Base de Datos Local

## ⚠️ IMPORTANTE
Actualmente la aplicación está configurada para conectarse a una base de datos de Render que **NO EXISTE**. Por eso obtienes errores 500.

Tienes 3 opciones para configurar la base de datos:

---

## 🎯 Opción 1: PostgreSQL Local (Recomendado para pruebas)

### 1. Instalar PostgreSQL
Si no tienes PostgreSQL instalado:
- Descarga desde: https://www.postgresql.org/download/windows/
- Durante la instalación, anota la contraseña que configures para el usuario `postgres`

### 2. Crear la base de datos
Abre PowerShell o CMD y ejecuta:

```powershell
# Conectar a PostgreSQL (te pedirá la contraseña)
psql -U postgres

# Dentro de psql, ejecuta:
CREATE DATABASE mapas_caza;
\c mapas_caza
CREATE EXTENSION postgis;
\q
```

### 3. Actualizar el archivo .env del servidor
Edita `server/.env` y cambia la línea de DATABASE_URL a:

```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/mapas_caza
```

Reemplaza `TU_CONTRASEÑA` con la contraseña que configuraste.

### 4. Ejecutar el schema
```bash
cd server
node setup-db.js
```

---

## 🌐 Opción 2: Base de Datos Gratuita en Línea (Más fácil)

### Usar Supabase (Gratis, sin tarjeta)

1. Ve a https://supabase.com
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. En "Project Settings" > "Database", copia la "Connection string" (URI)
5. Pega esa URL en `server/.env`:

```
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.[TU-PROYECTO].supabase.co:5432/postgres
```

6. Ejecuta el schema:
```bash
cd server
node setup-db.js
```

---

## 🐘 Opción 3: ElephantSQL (Gratis, sin tarjeta)

1. Ve a https://www.elephantsql.com
2. Crea una cuenta gratuita
3. Crea una nueva instancia (plan "Tiny Turtle" - gratis)
4. Copia la URL que te dan
5. Pega esa URL en `server/.env`:

```
DATABASE_URL=postgres://usuario:password@servidor.db.elephantsql.com/base
```

6. Ejecuta el schema:
```bash
cd server
node setup-db.js
```

---

## ✅ Verificar que funciona

Después de configurar cualquiera de las opciones:

1. **Reinicia el servidor backend**:
```bash
# Detén el servidor actual (Ctrl+C)
cd server
npm run dev
```

2. **Verifica la conexión**:
```bash
node check-db.js
```

Deberías ver:
```
✅ Conectado exitosamente
📋 Verificando estructura de la tabla submissions
📊 Total de registros: 0
```

3. **Prueba la aplicación**:
- Abre http://localhost:5173 o http://localhost:5174
- Crea un nuevo registro
- Verifica que se guarde correctamente

---

## 🚨 Si tienes problemas

Ejecuta este comando para ver el error exacto:
```bash
cd server
node check-db.js
```

Y compárteme el error que aparece.
