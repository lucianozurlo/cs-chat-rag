# Corrección workflow ComuStock n8n — Etapa 2.3

Archivo corregido: `Comustock_Etapa_2_3_Chat_RAG_HTML_links_CORREGIDO.json`

## Cambios principales

1. El nodo `Cargar chunks RAG` ahora apunta al JSONL HTML compacto:
   `http://localhost:3000/rag/comustock_rag_chunks_html_compacto_v2_2026-04-17.jsonl`

2. El nodo `Buscar en RAG` ya no pasa solamente `chunk.texto`.
   Ahora arma un contexto con:
   - ubicación
   - página
   - recurso
   - formatos
   - `LINKS_DESCARGA_VALIDOS_JSON`
   - `HTML_DESCARGA_EXACTO_NO_MODIFICAR`

3. Se corrigió el scoring:
   - antes bonificaba `tipo_chunk === "recurso"`
   - ahora también bonifica `tipo_chunk === "descargable"`

4. Se agregó índice `links_descarga_lookup` por filename.
   Esto permite reconstruir hrefs si el LLM devuelve por error:
   `href="comustock.personal.com.ar"` + `download="archivo.ext"`.

5. Se agregó el nodo `Sanear salida HTML`.
   Corrige:
   - fences tipo ```html
   - mojibake tipo `PÃ¡gina`
   - `xmlns="www.w3.org/2000/svg"`
   - hrefs sin protocolo
   - hrefs dominio pelado usando el filename del atributo `download`

6. Se reforzó el System Prompt:
   - no usar Markdown
   - no usar asteriscos
   - copiar HTML exacto del contexto
   - no modificar hrefs
   - no inventar links

## Importante

Copiar también a tu proyecto frontend el JSONL:

`rag/comustock_rag_chunks_html_compacto_v2_2026-04-17.jsonl`

Si seguís usando el JSONL viejo `comustock_rag_chunks_2026-04-17.jsonl`, el workflow no va a tener los links HTML reales.
