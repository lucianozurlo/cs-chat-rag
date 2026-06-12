# Revisión DEV — ComuStock Chat + RAG + DB

## Qué revisé
- Workflow `Comustock_Etapa_2_4_Chat_RAG_DB_memory.json`
- SQL de memoria conversacional
- Flujo Gemini principal + Groq fallback
- Estado conversacional en PostgreSQL
- Lógica de marca activa, filtros y descargables

## Bugs / riesgos detectados en la versión anterior
1. **Filtros pegados entre marcas**  
   Si el usuario cambiaba de marca en un nuevo pedido, podían quedar arrastrados `format`, `color`, `background` o `use_case` del turno anterior.

2. **Pedido de logo abierto con links visibles en contexto**  
   Aunque el prompt decía “preguntá primero”, el contexto todavía podía incluir links y HTML exacto. Eso aumentaba la probabilidad de que el modelo mostrara descargables antes de tiempo.

3. **Falso positivo entre marcas**  
   Había scoring por marca, pero no un bloqueo suficientemente fuerte para descargables de otra marca cuando la marca activa ya estaba clara.

4. **Falta de resiliencia en nodos Postgres**  
   En dev conviene que todos los nodos de DB tengan retry corto para fallos transitorios.

5. **Línea introductoria poco específica**  
   La primera línea no siempre dejaba claro qué se estaba bajando y de qué marca se trataba.

## Cambios aplicados
- Reset de filtros dependientes cuando cambia explícitamente la marca o el tipo de recurso en un pedido nuevo.
- Supresión de links y HTML exacto en contexto cuando el pedido de logo sigue abierto.
- Filtro más estricto por marca y por coincidencia de formato/color/fondo para descargables.
- Retry automático en todos los nodos Postgres.
- Primera línea de descargables más explícita, por ejemplo:
  - `Descargando logo de Flow.`
  - `Descargando isotipo de Personal.`

## Recomendaciones para DEV
1. **Persistir siempre `conversationId` en frontend**  
   Si no se mantiene entre requests, la memoria DB pierde sentido.

2. **No usar `localhost` si n8n corre en Docker**  
   Si n8n está containerizado, `http://localhost:3000/...` apunta al contenedor, no a tu máquina host.

3. **Loggear modelo final usado**  
   Conviene guardar en `metadata_json` si respondió Gemini o Groq fallback.

4. **Agregar expiración opcional de estado**  
   Podés limpiar `cs_chat_state` si una conversación queda inactiva demasiado tiempo.

5. **Agregar pruebas de regresión**  
   Casos mínimos:
   - `logo de Flow` → pregunta una sola vez
   - `blanco`
   - `svg`
   - no debe cambiar de marca
   - `logo de Personal` después de eso → debe resetear filtros anteriores

## Archivo recomendado
Usar esta versión revisada:
- `Comustock_Etapa_2_4_Chat_RAG_DB_memory_DEV_reviewed.json`
