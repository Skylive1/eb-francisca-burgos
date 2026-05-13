# 🚀 Guía de Migración e Instalación

Esta guía detalla los pasos necesarios para configurar el proyecto en un nuevo dispositivo (laptop).

## 📋 Requisitos Previos
- **Node.js**: Descargar e instalar desde [nodejs.org](https://nodejs.org/).
- **Docker** (Opcional): Para la base de datos local.
- **Editor**: VS Code recomendado.

## 🛠️ Pasos de Instalación

### 1. Clonar o Copiar el Proyecto
Asegúrate de copiar todos los archivos, incluyendo los ocultos como `.env.local` (si ya los tienes) o crearlos de nuevo.

### 2. Frontend (Raíz)
```bash
npm install
```
Crea un archivo `.env.local` en la carpeta principal con tus credenciales de Supabase y APIs.

### 3. Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` dentro de la carpeta `backend`.

### 4. Base de Datos
- **Supabase**: Importa el archivo `supabase_schema.sql` en tu proyecto de Supabase.
- **Docker**: Si prefieres local, usa `docker-compose up -d`.

## 🏃 Cómo Ejecutar
- **Frontend**: `npm run dev` en la raíz.
- **Backend**: `npm run dev` dentro de la carpeta `backend`.

---
> **Nota para la IA**: Si necesitas automatizar la instalación, lee el archivo `MIGRATION_MASTER_CLASS.txt` para obtener los comandos técnicos exactos.
