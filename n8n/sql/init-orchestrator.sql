-- Comustock — Orquestador: tabla de logging central
-- Ejecutar en la misma DB después de init-mails.sql

CREATE TABLE IF NOT EXISTS orchestrator_log (
  id TEXT PRIMARY KEY,
  request_id TEXT,
  module TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orclog_reqid ON orchestrator_log(request_id);
CREATE INDEX IF NOT EXISTS idx_orclog_module ON orchestrator_log(module);
CREATE INDEX IF NOT EXISTS idx_orclog_created ON orchestrator_log(created_at);
