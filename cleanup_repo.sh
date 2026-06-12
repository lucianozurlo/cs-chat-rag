#!/usr/bin/env bash
# cleanup_repo.sh — Limpieza del repo cs-chat-rag
# Uso: ./cleanup_repo.sh  (desde cualquier directorio; el script se ubica solo)
# Todo queda en git history si hace falta recuperar.
set -e

# ── Ubicarse en la raíz del repo (donde está este script) ──────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Validar que es el repo correcto antes de borrar nada ───────────────────
if [ ! -f "prompt-comustock.html" ] || [ ! -d "n8n" ] || [ ! -d "rag" ]; then
  echo "❌ Este directorio no parece la raíz de cs-chat-rag (faltan prompt-comustock.html, n8n/ o rag/)"
  echo "   Asegurate de poner cleanup_repo.sh en la raíz del repo y volver a correrlo."
  exit 1
fi

echo "📁 Trabajando en: $SCRIPT_DIR"
echo ""

# ── Paso 1 ──────────────────────────────────────────────────────────────────
echo "1) Integrar .comustock-download-intro a css/styles.css"
if grep -q "comustock-download-intro" css/styles.css; then
  echo "   ✔ ya estaba integrada"
else
cat >> css/styles.css << 'CSS'

/* Línea introductoria de descargables */
.comustock-download-intro {
  margin: 0 0 12px;
  font-size: 16px;
  line-height: 1.35;
  color: var(--text);
}
CSS
  echo "   ✔ regla agregada"
fi

# ── Paso 2 ──────────────────────────────────────────────────────────────────
echo "2) Eliminar basura de macOS (.DS_Store)"
find . -name ".DS_Store" -not -path "./.git/*" -print -delete

# ── Paso 3 ──────────────────────────────────────────────────────────────────
echo "3) Eliminar CSS duplicado y patch ya integrado (carpeta front/)"
rm -rf front && echo "   ✔ front/ eliminada" || echo "   ✔ front/ no existía"

# ── Paso 4 ──────────────────────────────────────────────────────────────────
echo "4) Eliminar versión monolítica vieja del front"
rm -f prompt-comustock-plano.html && echo "   ✔ prompt-comustock-plano.html eliminado" || true

# ── Paso 5 ──────────────────────────────────────────────────────────────────
echo "5) Eliminar RAG viejos (~6.5MB)"
rm -f rag/comustock_rag_chunks_2026-04-17.json \
      rag/comustock_rag_chunks_2026-04-17.jsonl
echo "   ✔ RAG viejos eliminados (si existían)"

# ── Paso 6 ──────────────────────────────────────────────────────────────────
echo "6) Reorganizar docs y SQL sueltos"
[ -f "rag/comustock_rag_chunks_2026-04-17.md" ] && \
  mv rag/comustock_rag_chunks_2026-04-17.md n8n/docs/REPORTE_RAG_html_puro_2026-04-17.md && \
  echo "   ✔ reporte RAG movido a n8n/docs/" || echo "   ✔ reporte RAG ya movido o no existía"

[ -f "rag/Comustock_Etapa_2_3_CORRECCION_REPORTE.md" ] && \
  mv rag/Comustock_Etapa_2_3_CORRECCION_REPORTE.md n8n/docs/ && \
  echo "   ✔ reporte 2.3 movido a n8n/docs/" || echo "   ✔ reporte 2.3 ya movido o no existía"

[ -f "init-mails.sql" ] && mv init-mails.sql n8n/sql/ && \
  echo "   ✔ init-mails.sql movido a n8n/sql/" || echo "   ✔ init-mails.sql ya movido o no existía"

[ -f "init-orchestrator.sql" ] && mv init-orchestrator.sql n8n/sql/ && \
  echo "   ✔ init-orchestrator.sql movido a n8n/sql/" || echo "   ✔ init-orchestrator.sql ya movido o no existía"

# ── Paso 7 ──────────────────────────────────────────────────────────────────
echo "7) Crear .gitignore"
cat > .gitignore << 'GI'
.DS_Store
node_modules/
*.log
.env
GI
echo "   ✔ .gitignore creado"

# ── Verificación final ──────────────────────────────────────────────────────
echo ""
echo "── Verificación ──────────────────────────────────────────────────────"
ERRORS=0

grep -q "comustock-download-intro" css/styles.css && \
  echo "✔ .comustock-download-intro presente en css/styles.css" || \
  { echo "✘ FALTA .comustock-download-intro en css/styles.css"; ERRORS=$((ERRORS+1)); }

[ -f "rag/comustock_rag_chunks_html_compacto_v2_2026-04-17.jsonl" ] && \
  echo "✔ JSONL del workflow intacto" || \
  { echo "✘ FALTA el JSONL del workflow en rag/"; ERRORS=$((ERRORS+1)); }

BROKEN=$(grep -rn \
  -e 'href=.*styles_ajustado' \
  -e 'src=.*styles_ajustado' \
  -e 'href=.*styles_downloads_patch' \
  -e 'src=.*styles_downloads_patch' \
  -e 'href=.*prompt-comustock-plano' \
  -e 'src=.*prompt-comustock-plano' \
  -e 'href=.*chunks_2026-04-17\.json[^l]' \
  -e 'src=.*chunks_2026-04-17\.json[^l]' \
  --include="*.html" --include="*.js" . 2>/dev/null | grep -v ".git/" || true)
[ -z "$BROKEN" ] && echo "✔ Sin referencias rotas a archivos eliminados" || \
  { echo "✘ Referencias rotas:"; echo "$BROKEN"; ERRORS=$((ERRORS+1)); }

MISSING=$(for f in $(grep -o 'href="css/[^"]*"\|src="js/[^"]*"' prompt-comustock.html | cut -d'"' -f2); do
  test -f "$f" || echo "  FALTA: $f"
done)
[ -z "$MISSING" ] && echo "✔ Todos los assets de prompt-comustock.html existen" || \
  { echo "✘ Assets faltantes:$MISSING"; ERRORS=$((ERRORS+1)); }

echo ""
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ Limpieza completada sin errores"
  echo ""
  echo "Siguiente paso: aplicar el kit (Fase 2 del runbook)"
  echo "  git add -A && git commit -m 'chore: limpieza de repo (duplicados, RAG viejos, .DS_Store) + integra download-intro a styles.css'"
else
  echo "❌ $ERRORS verificación(es) fallaron — revisar arriba"
  exit 1
fi
