# Deploy en Railway - Paso a Paso

## Paso 1: Configurar en GitHub

```bash
git init
git add .
git commit -m "Initial commit: Lead App Fullstack"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/lead-app.git
git push -u origin main
```

## Paso 2: Crear Base de Datos PostgreSQL

1. Ve a https://railway.app
2. Dashboard → "New" → "Database" → "PostgreSQL"
3. Railway crea automáticamente una instancia
4. **IMPORTANTE**: Copia la `DATABASE_URL` que genera

Debería verse algo como:
```
postgresql://user:password@host:port/database
```

## Paso 3: Deploy de la Aplicación

1. Dashboard → "New Project"
2. "Deploy from GitHub"
3. Autoriza Railway en GitHub
4. Selecciona el repo `lead-app`
5. Railway detecta automáticamente que es Node.js

## Paso 4: Variables de Entorno

En Railway, en tu proyecto:

1. Settings → Variables
2. Agregar variables:

```
DATABASE_URL=postgresql://... (cópialo de la BD)
NODE_ENV=production
PORT=3000
```

**Nota:** La clave de acceso `dental2026` ya está en el código, no hay que configurarla.

## Paso 5: Deploy Automático

Railway automáticamente:
- Detecta `npm start` o `npm run dev`
- Instala dependencias
- Inicia el servidor
- Le asigna una URL pública

Tu app estará en algo como:
```
https://lead-app-production.up.railway.app
```

## Paso 6: Configurar Frontend

El frontend necesita saber dónde está el backend. Opciones:

### Opción A: Mismo servidor (más simple)
1. En tu `server/index.js`, agrega:

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '../dist')));

// Al final:
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

2. Cambia `package.json`:
```json
"scripts": {
  "dev": "node server/index.js",
  "build": "vite build && node server/index.js",
  "start": "node server/index.js"
}
```

3. El frontend accede a `/api` (mismo dominio)

### Opción B: Servicios separados (más escalable)
1. Crea 2 proyectos en Railway
2. Frontend service:
   - Rama `frontend` (o crea repo aparte)
   - Comando: `npm run build`
   - Build output: `dist`
3. Backend service:
   - Comando: `node server/index.js`
   - Env: `DATABASE_URL`, `ACCESS_KEY`, etc

## Verificar que Funciona

```bash
# Testear API
curl -H "x-access-key: TU_CLAVE" https://lead-app-production.up.railway.app/api/leads

# Debería responder:
[]
```

Si ves un array vacío, ¡funcionó!

## Actualizar

Cada push a GitHub se deploya automáticamente:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway verá el cambio y desplegará en ~1-2 minutos.

## Troubleshooting

### "Error connecting to database"
- Verifica que `DATABASE_URL` sea correcta
- Railway → Database → Settings → ver connection string

### "PORT already in use"
- No hay problema en Railway, pero en local usa:
  ```bash
  PORT=3001 npm run dev
  ```

### "Acceso denegado al agregar lead"
- Verifica que `ACCESS_KEY` sea igual en:
  - `server/.env` → `ACCESS_KEY`
  - `src/.env.local` → `VITE_ACCESS_KEY`

### "CORS Error"
- En `server/index.js`, asegúrate que CORS esté habilitado:
  ```javascript
  app.use(cors());
  ```

### "Build falla en Railway"
- Ve a Settings → Build → View Logs
- Busca el error exacto
- Suele ser por variables faltantes o typos en código

## Monitoreo

En Railway Dashboard:
- **Logs**: Ver lo que está pasando en tiempo real
- **Deployments**: Historial de cambios
- **Metrics**: CPU, memoria, requests
- **Failed Deploys**: Si algo salió mal

## Costos

Railway es **gratuito hasta cierto límite**:
- ~5$ de crédito gratis
- PostgreSQL: ~8$ al mes
- Node.js app: ~5$ al mes

Total: ~13$/mes

(Pueden cambiar, revisa su pricing actual)

¡Listo! Tu app está en producción 🚀
