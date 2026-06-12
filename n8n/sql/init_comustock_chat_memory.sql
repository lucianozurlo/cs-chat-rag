-- ComuStock Chat Memory - PostgreSQL schema
-- Crea las tablas para persistir conversación, mensajes y estado conversacional.

BEGIN;

CREATE TABLE IF NOT EXISTS cs_chat_conversations (
  conversation_id TEXT PRIMARY KEY,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES cs_chat_conversations(conversation_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_chat_state (
  conversation_id TEXT PRIMARY KEY REFERENCES cs_chat_conversations(conversation_id) ON DELETE CASCADE,
  active_brand TEXT,
  active_resource_type TEXT,
  active_format TEXT,
  active_color TEXT,
  active_background TEXT,
  active_use_case TEXT,
  pending_question TEXT,
  is_request_fully_filtered BOOLEAN NOT NULL DEFAULT FALSE,
  last_matching_chunk_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_response_intro TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cs_chat_messages_conversation_created_at
  ON cs_chat_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cs_chat_messages_role
  ON cs_chat_messages (role);

CREATE INDEX IF NOT EXISTS idx_cs_chat_state_updated_at
  ON cs_chat_state (updated_at DESC);

COMMIT;
