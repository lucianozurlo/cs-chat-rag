# ComuStock Chat + RAG + memoria en base de datos

## Qué hace esta automatización

Esta automatización recibe una consulta del chat de ComuStock, busca contexto relevante en la base RAG, consulta el estado conversacional guardado en PostgreSQL, responde con Gemini y, si Gemini falla, usa Groq como fallback.

También guarda en base de datos:
- la conversación
- los mensajes del usuario y del asistente
- el estado conversacional activo

Con eso, el bot puede mantener entre turnos:
- marca activa
- tipo de recurso activo
- formato
- color
- fondo
- uso
- si el pedido ya quedó suficientemente filtrado

## Qué implementa la base de datos en esta instancia

En esta versión, la base de datos no es solo auditoría: pasa a ser memoria conversacional persistente.

### Tablas
- `cs_chat_conversations`: identifica cada conversación por `conversation_id`
- `cs_chat_messages`: guarda los turnos del usuario y del asistente
- `cs_chat_state`: guarda el estado estructurado del pedido

### Qué resuelve esto
Evita errores como:
- el usuario pide Flow y el bot responde Personal
- el usuario dice “blanco” y el bot pierde la marca anterior
- el usuario agrega “fondo transparente” y el bot vuelve a preguntar desde cero

## Flujo general

1. Entra el request por webhook
2. Se normaliza el input (`query`, `conversationId`, `userId`)
3. Se crea o actualiza la conversación en PostgreSQL
4. Se carga el estado previo de la conversación
5. Se cargan los últimos mensajes
6. Se descargan los chunks RAG
7. El nodo `Buscar en RAG`:
   - reconstruye el estado activo
   - hereda marca y filtros previos
   - detecta si el pedido es continuación
   - busca chunks con sesgo fuerte a la marca activa
   - arma contexto para el LLM
   - genera una línea introductoria sugerida para descargables
8. Responde Gemini
9. Si Gemini falla, entra Groq
10. Se normaliza y sanea el HTML
11. Se guarda el mensaje del usuario
12. Se guarda el mensaje del asistente
13. Se actualiza `cs_chat_state`
14. Se devuelve la respuesta final al frontend

## Cómo responde mejor esta versión

### Memoria conversacional real
Si el usuario hace este recorrido:

- “necesito el logo de Flow”
- “blanco”
- “fondo transparente”
- “en SVG”

el workflow ya no trata cada mensaje como una consulta aislada.

Va completando el estado:
- marca: Flow
- recurso: logo
- color: blanco
- fondo: transparente
- formato: svg

### Primera línea descriptiva en descargables
Cuando devuelve recursos, agrega una línea breve antes del HTML exacto, por ejemplo:

- `Te paso estas opciones del logo de Flow:`
- `Te paso estos recursos de Personal:`

Esto deja claro qué está bajando la persona antes de ver las tarjetas.

### Protección de marca activa
Si la conversación ya fijó una marca, el scoring del RAG prioriza chunks de esa marca y penaliza otras.

## Archivos incluidos

### 1. `Comustock_Etapa_2_4_Chat_RAG_DB_memory.json`
Workflow principal para importar en n8n.

### 2. `init_comustock_chat_memory.sql`
Script SQL para crear tablas e índices.

### 3. `payload_ejemplo_comustock_chat.json`
Ejemplo mínimo del body que tiene que mandar el frontend.

### 4. `styles_downloads_patch.css`
Patch opcional para el render visual de descargables.

## Paso a paso para avanzar

### Paso 1: crear las tablas en PostgreSQL
Ejecutá:

```bash
psql "TU_CONNECTION_STRING" < init_comustock_chat_memory.sql
```

### Paso 2: importar el workflow en n8n
Importá:

- `Comustock_Etapa_2_4_Chat_RAG_DB_memory.json`

### Paso 3: configurar credenciales en n8n
Revisá estos nodos:
- `Google Gemini Chat Model`
- `Groq Chat Model — Fallback`
- nodos Postgres nuevos

Tenés que asociarles:
- credencial de Gemini
- credencial de Groq
- credencial de PostgreSQL

### Paso 4: revisar la URL del JSONL RAG
En el nodo `Cargar chunks RAG`, confirmá que exista la ruta:

`http://localhost:3000/rag/comustock_rag_chunks_html_compacto_v2_2026-04-17.jsonl`

Si la cambiaste, actualizala en el nodo.

### Paso 5: adaptar el frontend
El frontend ya no necesita mandar todo el historial.
Con esta versión alcanza con enviar:

```json
{
  "conversationId": "chat-demo-001",
  "userId": "luciano",
  "query": "necesito el logo de Flow"
}
```

Lo importante es que `conversationId` se mantenga estable durante toda la conversación.

### Paso 6: probar escenarios
Probá estos casos:

#### Caso 1
- necesito el logo de Flow
- blanco
- fondo transparente
- en svg

Esperado:
- mantiene Flow todo el tiempo
- no cambia a Personal
- responde con coincidencias exactas o, si no existen, con alternativas de Flow

#### Caso 2
- pasame el manual de marca de Personal

Esperado:
- responde directo con el recurso correcto
- mantiene HTML válido para descargables

#### Caso 3
- cómo veo mis licencias

Esperado:
- deriva a Loopi

### Paso 7: revisar persistencia
Verificá en PostgreSQL:

```sql
SELECT * FROM cs_chat_conversations ORDER BY updated_at DESC;
SELECT * FROM cs_chat_messages ORDER BY created_at DESC LIMIT 20;
SELECT * FROM cs_chat_state ORDER BY updated_at DESC;
```

## Qué cambia respecto de la versión anterior

Antes:
- el bot resolvía cada turno casi aislado
- dependía demasiado del último texto
- podía confundir marcas entre turnos

Ahora:
- la conversación tiene estado persistente
- el RAG usa esa memoria
- el flujo guarda mensajes y estado
- el bot responde con continuidad real

## Recomendaciones

- mantener `conversationId` estable por sesión
- no mandar historial completo desde frontend en esta versión
- usar PostgreSQL como fuente de memoria
- dejar Groq solo como fallback
- mantener el JSONL RAG actualizado cuando cambie ComuStock

## Nota final
Si más adelante querés, el siguiente paso natural es separar esta lógica en dos workflows:
- uno principal de chat
- uno subworkflow de persistencia/memoria
para que el mantenimiento quede más ordenado.
