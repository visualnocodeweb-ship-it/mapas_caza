# 🚀 Guía de Despliegue en Render

## 1. Conectar Repositorio
Ya subí el código a: https://github.com/visualnocodeweb-ship-it/mapas_caza

## 2. Crear Servicios en Render

### Opción A: Usar Blueprint (Automático)
1. Ve a "Blueprints" en Render.
2. Click "New Blueprint Instance".
3. Conecta el repositorio `mapas_caza`.
4. Render detectará el archivo `render.yaml` y configurará todo.
5. **IMPORTANTE:** Como ya creaste la base de datos manualmente, tal vez prefieras hacerlo manual (Opción B) para conectarla a la existente.

### Opción B: Configuración Manual (Recomendada para conectar tu DB existente)

#### Paso 1: Backend (Web Service)
1. Nuevo -> Web Service
2. Conectar repo `mapas_caza`
3. **Name:** `mapas-caza-backend`
4. **Root Directory:** `server`
5. **Environment:** `Node`
6. **Build Command:** `npm install`
7. **Start Command:** `node index.js`
8. **Environment Variables:**
   - `DATABASE_URL`: (La URL interna que me pasaste antes)
     `postgresql://mapa_caza_2026_user:LeSjCMysnMrxE79uFiiksQHXSSmGRCUv@dpg-d6agtdggjchc73f4ltu0-a/mapa_caza_2026`
   - `FRONTEND_URL`: (La URL que tendrá tu frontend, ej: `https://mapas-caza.onrender.com`)

#### Paso 2: Frontend (Static Site)
1. Nuevo -> Static Site
2. Conectar repo `mapas_caza`
3. **Name:** `mapas-caza-frontend`
4. **Root Directory:** `./` (déjalo vacío o pon `.`)
5. **Build Command:** `npm install && npm run build`
6. **Publish Directory:** `dist`
7. **Environment Variables:**
   - `VITE_API_URL`: (La URL de tu backend, ej: `https://mapas-caza-backend.onrender.com`)

## 3. Último Paso
Una vez desplegado el backend, copia su URL y actualiza la variable `VITE_API_URL` en el servicio del Frontend para que se puedan comunicar.
