# Lead App - Fullstack

**Aplicación production-ready para captura de leads con autenticación y base de datos PostgreSQL.**

## Stack

- **Frontend**: React + Vite + Tailwind
- **Backend**: Node.js + Express
- **Base de Datos**: PostgreSQL
- **Deploy**: Railway

## Estructura

```
lead-app/
├── src/
│   ├── components/LeadEntry.jsx
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── index.js (servidor principal)
│   ├── db.js (conexión BD)
│   ├── routes.js (endpoints)
│   └── middleware.js (autenticación y validación)
├── package.json
├── vite.config.js
└── .env.example
```

## Instalación Local

```bash
npm install
```

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/lead_app
NODE_ENV=production
PORT=3000
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

**Nota:** La clave de acceso `dental2026` está hardcodeada en el código. Todos los requests se autentican automáticamente.

## Desarrollo Local

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run build
npm run preview
```

O usa dos instancias de node y cambia el puerto en vite.config.js

## Deploy en Railway

### 1. Preparar en GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/lead-app.git
git push -u origin main
```

### 2. Setup en Railway

**Crear BD PostgreSQL:**
1. Dashboard de Railway
2. "New" → "Database" → "PostgreSQL"
3. Railway crea automáticamente `DATABASE_URL`

**Deploy aplicación:**
1. "New" → "GitHub Repo"
2. Selecciona `lead-app`
3. Railway detecta automáticamente Node.js
4. Agregar variables de entorno:
   - `DATABASE_URL` (de la BD)
   - `ACCESS_KEY` (tu clave secreta)
   - `NODE_ENV=production`

**Railway automáticamente:**
- Instala dependencias
- Corre `npm run build`
- Sirve la app en `https://lead-app-production.up.railway.app`

### 3. Variables en Frontend

En Railway, crea un segundo servicio para el frontend o configura:
```
VITE_API_URL=https://tu-backend-railway.up.railway.app/api
VITE_ACCESS_KEY=tu_clave_secreta
```

## API Endpoints

Todos requieren header: `x-access-key: TU_CLAVE`

### POST /api/leads
Crear nuevo lead
```json
{
  "contacto": "whatsapp",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "1234567890",
  "email": "juan@example.com",
  "zona": "0-5 kms",
  "estado": "consulta"
}
```

### GET /api/leads
Listar últimos 100 leads

### PUT /api/leads/:id
Actualizar estado
```json
{ "estado": "agendado" }
```

### DELETE /api/leads/:id
Eliminar lead

### GET /api/stats
Obtener estadísticas
```json
{
  "totalLeads": 42,
  "lastMonthLeads": 15
}
```

## Validaciones

- **Nombre, Apellido, Teléfono**: Requeridos
- **Teléfono**: 7-20 dígitos
- **Email**: Formato válido (opcional)
- **Acceso**: Requiere clave única correcta

## Seguridad

- Autenticación por clave única en header `x-access-key`
- Validaciones en backend
- SSL en producción
- Variables sensibles en `.env`

## Troubleshooting

**"Error de conexión a BD"**
- Verifica `DATABASE_URL` en Railway
- Confirma que PostgreSQL está activo

**"Acceso denegado"**
- Verifica que `ACCESS_KEY` sea igual en frontend y backend
- Comprueba header `x-access-key` en requests

**"CORS Error"**
- Revisa configuración de CORS en `server/index.js`
- Confirma URL de API en `.env.local`

## Licencia

