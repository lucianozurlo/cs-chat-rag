-- Comustock — Etapa 3: tablas para ingesta de mails CI
-- Ejecutar en la misma DB (Neon/Supabase/local)

CREATE TABLE IF NOT EXISTS mails (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT UNIQUE,
  fecha_envio TIMESTAMPTZ,
  asunto TEXT,
  remitente TEXT,
  destinatario TEXT,
  para_segmentado TEXT[],
  contenido_texto TEXT,
  resumen TEXT,
  formato_imagen JSONB,
  elementos_visuales JSONB,
  tiene_qr BOOLEAN DEFAULT false,
  tiene_boton BOOLEAN DEFAULT false,
  urls_detectadas TEXT[],
  hash_contenido TEXT,
  envio_repetido BOOLEAN DEFAULT false,
  repetido_de_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mails_msgid ON mails(message_id);
CREATE INDEX IF NOT EXISTS idx_mails_hash ON mails(hash_contenido);
CREATE INDEX IF NOT EXISTS idx_mails_fecha ON mails(fecha_envio);

CREATE TABLE IF NOT EXISTS mail_errors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT,
  nodo TEXT,
  error TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
