# Backend PostgreSQL para Web Francisca Burgos

Este backend provee APIs REST para conectar la aplicación con una base de datos PostgreSQL.

## Requisitos

- Node.js 20+
- PostgreSQL 15+ o Docker

## Configuración

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Ajusta `DATABASE_URL` para tu proyecto Supabase (PostgreSQL):
   ```env
   DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@<proyecto>.supabase.co:5432/postgres?sslmode=require
   PORT=4000
   ```

> Si prefieres, también puedes usar `SUPABASE_DATABASE_URL` en lugar de `DATABASE_URL`.

## Ejecutar localmente

```bash
cd backend
npm install
npm run dev
```

## Ejecutar con Docker

```bash
docker compose up --build
```

## Endpoints

- `GET /api/news` - Lista noticias desde la base de datos.
- `POST /api/admissions` - Envía un formulario de admisión.
- `GET /api/health` - Verifica que el backend está activo.
