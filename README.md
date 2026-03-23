# 📚 Ex Libris FFR — Biblioteca Personal

Catálogo personal de libros con escaneo de códigos de barras, búsqueda por ISBN/título y datos de múltiples APIs.

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **APIs:** Google Books + Open Library
- **Hosting:** Cloudflare Pages
- **Scanner:** html5-qrcode

## Setup

### 1. Supabase

1. Andá a [supabase.com](https://supabase.com) y creá un nuevo proyecto
2. En el **SQL Editor**, ejecutá el contenido de `supabase/schema.sql`
3. Copiá tu **Project URL** y **anon key** desde Settings → API

### 2. Variables de entorno

Creá un archivo `.env` en la raíz:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GOOGLE_BOOKS_API_KEY=tu-google-books-api-key
```

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Deploy en Cloudflare Pages

1. Subí el repo a GitHub
2. En Cloudflare Pages → Create Project → Connect GitHub
3. Build command: `npm run build`
4. Output directory: `dist`
5. Agregá las variables de entorno en Settings → Environment Variables

## Contraseñas por defecto

- **Admin:** `admin123` (puede agregar, editar y eliminar libros)
- **Invitado:** `invitado` (solo puede ver)

Podés cambiarlas en Supabase → Table Editor → `app_config`

## Funcionalidades

- 📷 Escaneo de código de barras con la cámara
- 🔢 Búsqueda por ISBN manual
- 🔍 Búsqueda por título o autor
- 📚 Datos de Google Books + Open Library (editorial, género, portada, precio)
- 🔐 Acceso protegido con contraseña (admin / invitado)
- ⭐ Calificación personal (1-5 estrellas)
- 📖 Estado de lectura (pendiente / leyendo / leído)
- 📝 Notas personales por libro
- 📱 Responsive (funciona en celular y desktop)
