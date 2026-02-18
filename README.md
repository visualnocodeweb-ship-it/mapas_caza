# 🗺️ Sistema de Registro de Campos de Caza 2026

Aplicación web para registro de campos destinados a actividad de caza mediante polígonos dibujados en mapa interactivo, con exportación a formatos KML/KMZ.

## 🚀 Características

- ✅ Formulario de registro con email y selección de establecimiento
- ✅ Mapa interactivo para dibujar polígonos sobre campos
- ✅ Almacenamiento en base de datos PostgreSQL con PostGIS
- ✅ Exportación individual y masiva a formato KML/KMZ
- ✅ Panel de administración para gestionar registros
- ✅ Diseño moderno y responsivo

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + Vite
- Leaflet + React-Leaflet (mapas interactivos)
- Leaflet-Draw (dibujo de polígonos)
- Axios (comunicación con API)

### Backend
- Node.js + Express
- PostgreSQL con extensión PostGIS
- Conversión GeoJSON a KML

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+ con extensión PostGIS
- npm o yarn

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd Mapas_Caza_2026_Fauna
```

### 2. Configurar Base de Datos

Crear una base de datos PostgreSQL y ejecutar el schema:

```bash
psql -U postgres -d nombre_base_datos -f server/schema.sql
```

### 3. Configurar Variables de Entorno

**Frontend** - Crear archivo `.env` en la raíz:
```env
VITE_API_URL=http://localhost:3001
```

**Backend** - Crear archivo `server/.env`:
```env
PORT=3001
DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_base_datos
FRONTEND_URL=http://localhost:5173
```

### 4. Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 5. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🌐 Deployment en Render

### 1. Configurar Base de Datos PostgreSQL

1. En Render, crear un nuevo PostgreSQL database
2. Copiar la **Internal Database URL**
3. Conectarse y ejecutar el schema:
   ```bash
   psql <INTERNAL_DATABASE_URL> -f server/schema.sql
   ```

### 2. Deploy del Backend

1. Crear un nuevo **Web Service** en Render
2. Conectar tu repositorio de GitHub
3. Configurar:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Agregar variables de entorno:
   - `DATABASE_URL`: URL interna de tu base de datos PostgreSQL
   - `FRONTEND_URL`: URL de tu frontend (la obtendrás en el paso 3)
   - `PORT`: 3001

### 3. Deploy del Frontend

1. Crear un nuevo **Static Site** en Render
2. Conectar tu repositorio de GitHub
3. Configurar:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Agregar variable de entorno:
   - `VITE_API_URL`: URL de tu backend (del paso 2)

### 4. Actualizar CORS

Actualizar la variable `FRONTEND_URL` en el backend con la URL real del frontend desplegado.

## 📖 Uso de la Aplicación

### Registrar un Nuevo Campo

1. Ir a la pestaña **"Nuevo Registro"**
2. Completar email y seleccionar establecimiento
3. Usar la herramienta de polígono en el mapa (botón superior derecho)
4. Dibujar el área del campo destinada a caza
5. Hacer clic en **"Guardar Registro"**

### Administrar Registros

1. Ir a la pestaña **"Administración"**
2. Ver todos los registros guardados
3. Descargar KML individual haciendo clic en el botón **"📥 KML"**
4. Descargar todos los KML con el botón **"📥 Descargar Todos los KML"**

### Visualizar KML

Los archivos KML descargados se pueden abrir en:
- Google Earth
- Google Maps (My Maps)
- QGIS
- Cualquier software GIS compatible

## 📁 Estructura del Proyecto

```
Mapas_Caza_2026_Fauna/
├── src/
│   ├── components/
│   │   ├── MapDrawer.jsx          # Mapa interactivo con Leaflet
│   │   ├── SubmissionForm.jsx     # Formulario de registro
│   │   └── AdminPanel.jsx         # Panel de administración
│   ├── constants/
│   │   └── establecimientos.js    # Lista de establecimientos
│   ├── App.jsx                    # Componente principal
│   ├── App.css                    # Estilos
│   └── main.jsx                   # Entry point
├── server/
│   ├── index.js                   # Servidor Express
│   ├── db.js                      # Configuración PostgreSQL
│   ├── schema.sql                 # Schema de base de datos
│   ├── utils/
│   │   └── geoConverter.js        # Conversión GeoJSON a KML
│   └── package.json
├── package.json
└── README.md
```

## 🔌 API Endpoints

### `POST /api/submissions`
Guardar nuevo registro con polígono
```json
{
  "email": "usuario@example.com",
  "establecimiento": "Estancia El Rincón",
  "polygon": { "type": "Polygon", "coordinates": [...] }
}
```

### `GET /api/submissions`
Obtener todos los registros

### `GET /api/submissions/:id`
Obtener un registro específico

### `GET /api/submissions/:id/kml`
Descargar KML de un registro

### `GET /api/export/all-kml`
Descargar todos los registros en un solo archivo KML

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es de código abierto.

## 📧 Contacto

Para consultas o soporte, contactar al administrador del sistema.
