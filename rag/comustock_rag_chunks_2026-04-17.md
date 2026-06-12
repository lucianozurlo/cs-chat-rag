# Reporte de actualización — ComuStock RAG HTML puro

## Archivos generados

- `comustock_rag_master_html_puro_2026-04-17.json`
- `comustock_rag_chunks_html_puro_2026-04-17.jsonl`

## Cambios aplicados

- Las respuestas sugeridas de descargas ahora están en HTML puro.
- Se eliminaron formatos Markdown como `*`, `**` y links `links Markdown`.
- Cada recurso descargable tiene un bloque `<article class="comustock-download-card">`.
- Cada opción de descarga usa un anchor `<a class="comustock-download-link" href="https://..." download="archivo.ext">`.
- El texto visible del link ahora usa nombre legible + formato. Ejemplo: `Logo Flow Blanco en AI`.
- Cada link incluye un SVG inline de descarga al final del anchor.
- Se corrigieron posibles caracteres mojibake tipo `PÃ¡gina`.
- Todas las URLs de descarga quedaron absolutas con `https://comustock.personal.com.ar/`.

## Validación

| Control | Resultado |
|---|---:|
| Chunks totales | 232 |
| Páginas | 18 |
| Descargables | 210 |
| Chunks de asistente | 4 |
| Descargables con HTML | 210 |
| Opciones de descarga directa | 698 |
| Mojibake detectado | 0 |
| Links Markdown detectados | 0 |
| Bullets Markdown `*   ` detectados | 0 |
| Negritas Markdown `**` detectadas | 0 |
| URLs sin `https://` o con localhost | 0 |

## Ejemplo HTML generado para Flow

```html
<article class="comustock-download-card" data-recurso="Logotipo (blanco, fondo negro)"><h3 class="comustock-download-card__title">Logotipo (blanco, fondo negro)</h3><p class="comustock-download-card__location">Ecosistema &gt; Flow &gt; Logos &gt; Variaciones</p><div class="comustock-download-card__links"><a class="comustock-download-link" href="https://comustock.personal.com.ar/content/identidad/ecosistema/flow/logos/ai/flow-logo-blanco.ai" download="flow-logo-blanco.ai" aria-label="Descargar Logo Flow Blanco sobre fondo negro en AI"><span class="comustock-download-link__label">Logo Flow Blanco sobre fondo negro en AI</span><svg class="download-link__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13.9,13.6H2.1c-0.7,0-1.2,0.5-1.2,1.2c0,0.7,0.5,1.2,1.2,1.2h11.9c0.7,0,1.2-0.5,1.2-1.2C15.1,14.2,14.6,13.6,13.9,13.6z"/><path d="M7.2,11.5c0.5,0.5,1.2,0.5,1.7,0h0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0L9.2,7.8V1.2C9.2,0.5,8.7,0,8,0C7.3,0,6.8,0.5,6.8,1.2v6.6L4.1,5.1c-0.5-0.5-1.2-0.5-1.7,0c-0.5,0.5-0.5,1.2,0,1.7L7.2,11.5z"/></svg></a><a class="comustock-download-link" href="https://comustock.personal.com.ar/content/identidad/ecosistema/flow/logos/svg/flow-logo-blanco.svg" download="flow-logo-blanco.svg" aria-label="Descargar Logo Flow Blanco sobre fondo negro en SVG"><span class="comustock-download-link__label">Logo Flow Blanco sobre fondo negro en SVG</span><svg class="download-link__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13.9,13.6H2.1c-0.7,0-1.2,0.5-1.2,1.2c0,0.7,0.5,1.2,1.2,1.2h11.9c0.7,0,1.2-0.5,1.2-1.2C15.1,14.2,14.6,13.6,13.9,13.6z"/><path d="M7.2,11.5c0.5,0.5,1.2,0.5,1.7,0h0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0L9.2,7.8V1.2C9.2,0.5,8.7,0,8,0C7.3,0,6.8,0.5,6.8,1.2v6.6L4.1,5.1c-0.5-0.5-1.2-0.5-1.7,0c-0.5,0.5-0.5,1.2,0,1.7L7.2,11.5z"/></svg></a><a class="comustock-download-link" href="https://comustock.personal.com.ar/content/identidad/ecosistema/flow/logos/pdf/flow-logo-blanco.pdf" download="flow-logo-blanco.pdf" aria-label="Descargar Logo Flow Blanco sobre fondo negro en PDF"><span class="comustock-download-link__label">Logo Flow Blanco sobre fondo negro en PDF</span><svg class="download-link__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13.9,13.6H2.1c-0.7,0-1.2,0.5-1.2,1.2c0,0.7,0.5,1.2,1.2,1.2h11.9c0.7,0,1.2-0.5,1.2-1.2C15.1,14.2,14.6,13.6,13.9,13.6z"/><path d="M7.2,11.5c0.5,0.5,1.2,0.5,1.7,0h0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0L9.2,7.8V1.2C9.2,0.5,8.7,0,8,0C7.3,0,6.8,0.5,6.8,1.2v6.6L4.1,5.1c-0.5-0.5-1.2-0.5-1.7,0c-0.5,0.5-0.5,1.2,0,1.7L7.2,11.5z"/></svg></a><a class="comustock-download-link" href="https://comustock.personal.com.ar/content/identidad/ecosistema/flow/logos/png/flow-logo-blanco.png" download="flow-logo-blanco.png" aria-label="Descargar Logo Flow Blanco sobre fondo negro en PNG"><span class="comustock-download-link__label">Logo Flow Blanco sobre fondo negro en PNG</span><svg class="download-link__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13.9,13.6H2.1c-0.7,0-1.2,0.5-1.2,1.2c0,0.7,0.5,1.2,1.2,1.2h11.9c0.7,0,1.2-0.5,1.2-1.2C15.1,14.2,14.6,13.6,13.9,13.6z"/><path d="M7.2,11.5c0.5,0.5,1.2,0.5,1.7,0h0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0L9.2,7.8V1.2C9.2,0.5,8.7,0,8,0C7.3,0,6.8,0.5,6.8,1.2v6.6L4.1,5.1c-0.5-0.5-1.2-0.5-1.7,0c-0.5,0.5-0.5,1.2,0,1.7L7.2,11.5z"/></svg></a><a class="comustock-download-link" href="https://comustock.personal.com.ar/content/identidad/ecosistema/flow/logos/jpg/flow-logo-blanco.jpg" download="flow-logo-blanco.jpg" aria-label="Descargar Logo Flow Blanco sobre fondo negro en JPG"><span class="comustock-download-link__label">Logo Flow Blanco sobre fondo negro en JPG</span><svg class="download-link__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13.9,13.6H2.1c-0.7,0-1.2,0.5-1.2,1.2c0,0.7,0.5,1.2,1.2,1.2h11.9c0.7,0,1.2-0.5,1.2-1.2C15.1,14.2,14.6,13.6,13.9,13.6z"/><path d="M7.2,11.5c0.5,0.5,1.2,0.5,1.7,0h0l4.8-4.8c0.5-0.5,0.5-1.2,0-1.7c-0.5-0.5-1.2-0.5-1.7,0L9.2,7.8V1.2C9.2,0.5,8.7,0,8,0C7.3,0,6.8,0.5,6.8,1.2v6.6L4.1,5.1c-0.5-0.5-1.2-0.5-1.7,0c-0.5,0.5-0.5,1.2,0,1.7L7.2,11.5z"/></svg></a></div></article>
```

## Nota sobre localhost

Si el navegador abre `http://localhost:3000/comustock.personal.com.ar/...`, el enlace está siendo tratado como relativo. En estos archivos los `href` quedan absolutos, por ejemplo `https://comustock.personal.com.ar/content/...`. Si vuelve a aparecer `localhost`, revisar el render del chatbot o sanitizer que esté quitando `https://` o concatenando el dominio actual delante del `href`.
