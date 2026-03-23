-- ============================================
-- BIBLIOTECA - Ex Libris FFR
-- Schema para Supabase
-- ============================================

-- Tabla principal de libros
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT,
  title TEXT NOT NULL,
  authors TEXT DEFAULT 'Autor desconocido',
  published_date TEXT,
  page_count INTEGER,
  publisher TEXT,
  categories TEXT,
  price TEXT,
  thumbnail_url TEXT,
  description TEXT,
  language TEXT,
  source TEXT DEFAULT 'manual', -- 'google_books', 'open_library', 'manual'
  notes TEXT, -- notas personales
  read_status TEXT DEFAULT 'sin_leer', -- 'sin_leer', 'leyendo', 'leido'
  rating INTEGER, -- 1-5 estrellas personales
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_authors ON books(authors);
CREATE INDEX idx_books_read_status ON books(read_status);

-- Tabla de configuración (contraseñas)
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insertar contraseñas por defecto (cambiar después!)
INSERT INTO app_config (key, value) VALUES ('admin_password', 'admin123');
INSERT INTO app_config (key, value) VALUES ('guest_password', 'invitado');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir lectura anónima para ambas tablas
CREATE POLICY "Lectura pública de libros" ON books FOR SELECT USING (true);
CREATE POLICY "Escritura pública de libros" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización pública de libros" ON books FOR UPDATE USING (true);
CREATE POLICY "Eliminación pública de libros" ON books FOR DELETE USING (true);
CREATE POLICY "Lectura de config" ON app_config FOR SELECT USING (true);
