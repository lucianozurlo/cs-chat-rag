#!/usr/bin/env bash
# check_env.sh — Verifica que todo el entorno de ComuStock Chat + RAG + DB esté operativo.
# Uso:
#   ./check_env.sh                                  -> usa Postgres local de Docker
#   PG_URL="postgresql://..." ./check_env.sh        -> usa tu Neon/Supabase
set -u

PG_URL="${PG_URL:-postgresql://comustock:comustock_dev@localhost:5432/comustock}"
RAG_URL="${RAG_URL:-http://localhost:3000/rag/comustock_rag_chunks_html_compacto_v2_2026-04-17.jsonl}"
N8N_WEBHOOK="${N8N_WEBHOOK:-http://localhost:5678/webhook/comustock-chat}"

ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; }
fail() { printf "  \033[31m✘\033[0m %s\n" "$1"; FAILED=1; }
FAILED=0

echo "1) PostgreSQL ($PG_URL)"
if psql "$PG_URL" -c "SELECT 1;" >/dev/null 2>&1; then
  ok "Conexión OK"
  TABLES=$(psql "$PG_URL" -tAc "SELECT count(*) FROM pg_tables WHERE tablename IN ('cs_chat_conversations','cs_chat_messages','cs_chat_state');")
  if [ "$TABLES" = "3" ]; then
    ok "Las 3 tablas cs_chat_* existen"
  else
    fail "Faltan tablas ($TABLES/3). Correr: psql \"\$PG_URL\" -f n8n/sql/init_comustock_chat_memory.sql"
  fi
else
  fail "No conecta. Si es Docker: docker compose up -d postgres. Si es remota: revisar PG_URL y comillas."
fi

echo "2) Servidor RAG ($RAG_URL)"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$RAG_URL" 2>/dev/null); HTTP=${HTTP:-000}
if [ "$HTTP" = "200" ]; then
  LINES=$(curl -s "$RAG_URL" | wc -l | tr -d ' ')
  ok "JSONL accesible ($LINES chunks)"
else
  fail "HTTP $HTTP. Levantar: docker compose up -d rag-server (o npx serve . -l 3000 desde la raíz del repo)"
fi

echo "3) Webhook n8n ($N8N_WEBHOOK)"
RESP=$(curl -s -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"check-env-001","userId":"check","query":"necesito el logo de Flow"}' \
  -w "\n%{http_code}" 2>/dev/null)
CODE=$(echo "$RESP" | tail -1)
if [ "$CODE" = "200" ]; then
  ok "Webhook responde 200"
elif [ "$CODE" = "404" ]; then
  fail "404: el workflow no está activo en n8n (importarlo y activarlo) o la ruta del webhook no coincide"
else
  fail "HTTP $CODE: ¿n8n está corriendo en :5678?"
fi

echo "4) Persistencia"
if psql "$PG_URL" -tAc "SELECT count(*) FROM cs_chat_messages WHERE conversation_id='check-env-001';" 2>/dev/null | grep -qE '^[1-9]'; then
  ok "El test del webhook quedó guardado en cs_chat_messages"
else
  echo "  ⚠ Sin mensajes guardados aún (normal si el webhook falló arriba)"
fi

echo ""
[ "$FAILED" = "0" ] && echo "✅ Entorno completo OK" || echo "❌ Hay pasos pendientes (ver arriba)"
exit $FAILED
