// ─── Render seguro para respuestas del asistente ───────────────────────────
// Reemplaza el render Markdown anterior.
// Objetivo:
// - Renderizar HTML válido devuelto por n8n.
// - No escapar <article>, <a>, <svg>, etc.
// - No convertir URLs a hostnames.
// - No romper href="https://..." ni xmlns="http://www.w3.org/2000/svg".
// - Sanitizar el HTML antes de insertarlo en pantalla.

const COMUSTOCK_BASE_URL = "https://comustock.personal.com.ar";
const COMUSTOCK_HOST = "comustock.personal.com.ar";

function fixMojibake(value) {
  return String(value || "")
    .replace(/PÃ¡gina/g, "Página")
    .replace(/pÃ¡gina/g, "página")
    .replace(/SecciÃ³n/g, "Sección")
    .replace(/secciÃ³n/g, "sección")
    .replace(/UbicaciÃ³n/g, "Ubicación")
    .replace(/ubicaciÃ³n/g, "ubicación")
    .replace(/DescripciÃ³n/g, "Descripción")
    .replace(/descripciÃ³n/g, "descripción")
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã/g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã/g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Ã‘/g, "Ñ")
    .replace(/Â¿/g, "¿")
    .replace(/Â¡/g, "¡")
    .replace(/Âº/g, "º")
    .replace(/Â°/g, "°")
    .replace(/Â·/g, "·")
    .replace(/Â/g, "");
}

function slugifyForPath(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getDownloadExtension(filename) {
  const match = String(filename || "").match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

function getLocationPartsFromElement(node) {
  const article = node.closest?.(".comustock-download-card");
  const locationText = article
    ?.querySelector(".comustock-download-card__location")
    ?.textContent;

  return String(locationText || "")
    .split(">")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildFallbackDownloadUrl(node, downloadName) {
  const filename = String(downloadName || "").trim();
  const ext = getDownloadExtension(filename);
  const parts = getLocationPartsFromElement(node);

  if (!filename || !ext || parts.length < 3) return "";

  const [section, page, area] = parts;
  const sectionSlug = slugifyForPath(section);
  const pageSlug = slugifyForPath(page);
  const areaSlug = slugifyForPath(area);

  // Fallback útil para los logos de Ecosistema.
  // Normalmente no debería usarse si el JSONL trae el href completo.
  if (sectionSlug === "ecosistema" && areaSlug === "logos") {
    return `${COMUSTOCK_BASE_URL}/content/identidad/ecosistema/${pageSlug}/logos/${ext}/${filename}`;
  }

  return "";
}

function normalizeComustockHref(rawHref, node) {
  let href = fixMojibake(rawHref).trim();
  const downloadName = node.getAttribute("download") || "";

  if (!href) {
    href = buildFallbackDownloadUrl(node, downloadName);
  }

  // Corrige casos generados por respuestas viejas o por el renderer anterior.
  if (href.startsWith("http://localhost:3000/comustock.personal.com.ar")) {
    href = href.replace(
      "http://localhost:3000/comustock.personal.com.ar",
      COMUSTOCK_BASE_URL
    );
  }

  if (href.startsWith("localhost:3000/comustock.personal.com.ar")) {
    href = href.replace(
      "localhost:3000/comustock.personal.com.ar",
      COMUSTOCK_BASE_URL
    );
  }

  if (href.startsWith("www.comustock.personal.com.ar")) {
    href = href.replace("www.comustock.personal.com.ar", COMUSTOCK_HOST);
  }

  if (href.startsWith(COMUSTOCK_HOST)) {
    href = `https://${href}`;
  }

  if (href.startsWith("/content/")) {
    href = `${COMUSTOCK_BASE_URL}${href}`;
  }

  // Si quedó solo el dominio, reconstruye cuando sea posible.
  if (href === COMUSTOCK_BASE_URL || href === `${COMUSTOCK_BASE_URL}/`) {
    const fallback = buildFallbackDownloadUrl(node, downloadName);
    if (fallback) href = fallback;
  }

  if (href === COMUSTOCK_HOST || href === `${COMUSTOCK_HOST}/`) {
    const fallback = buildFallbackDownloadUrl(node, downloadName);
    if (fallback) href = fallback;
  }

  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return "";
  }

  if (parsed.protocol !== "https:") return "";
  if (parsed.hostname !== COMUSTOCK_HOST) return "";

  // Permitimos descargas de contenido y, como fallback, cualquier archivo real del dominio.
  const hasFileExtension = /\.[a-z0-9]{2,8}$/i.test(parsed.pathname);
  if (!parsed.pathname.startsWith("/content/") && !hasFileExtension) return "";

  return parsed.href;
}

function looksLikeHtml(raw) {
  return /<\/?[a-z][\s\S]*>/i.test(raw);
}

function renderAssistantContent(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "assistant-rendered-content";

  const raw = fixMojibake(String(text || "").trim());

  if (!raw) {
    wrapper.textContent = "";
    return wrapper;
  }

  if (!looksLikeHtml(raw)) {
    wrapper.textContent = raw;
    return wrapper;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");

  const allowedTags = new Set([
    "ARTICLE",
    "DIV",
    "H2",
    "H3",
    "H4",
    "P",
    "SPAN",
    "A",
    "SVG",
    "PATH",
    "BR"
  ]);

  const allowedAttrs = new Set([
    "class",
    "data-recurso",
    "href",
    "download",
    "aria-label",
    "aria-hidden",
    "focusable",
    "xmlns",
    "width",
    "height",
    "viewBox",
    "viewbox",
    "d",
    "fill",
    "role"
  ]);

  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(fixMojibake(node.textContent || ""));
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const tag = node.tagName.toUpperCase();

    if (!allowedTags.has(tag)) {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        const cleanedChild = cleanNode(child);
        if (cleanedChild) fragment.appendChild(cleanedChild);
      });
      return fragment;
    }

    const el = document.createElement(node.tagName.toLowerCase());

    Array.from(node.attributes).forEach((attr) => {
      const attrName = attr.name;
      if (!allowedAttrs.has(attrName)) return;

      let value = fixMojibake(attr.value || "");

      if (attrName === "xmlns") {
        value = "http://www.w3.org/2000/svg";
      }

      if (attrName.toLowerCase() === "viewbox") {
        el.setAttribute("viewBox", value);
        return;
      }

      if (attrName === "href") {
        value = normalizeComustockHref(value, node);
        if (!value) return;

        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }

      el.setAttribute(attrName, value);
    });

    // Si es un <a> de descarga pero perdió el href, intenta reconstruirlo.
    if (tag === "A" && !el.getAttribute("href")) {
      const fallbackHref = normalizeComustockHref("", node);
      if (fallbackHref) {
        el.setAttribute("href", fallbackHref);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    }

    Array.from(node.childNodes).forEach((child) => {
      const cleanedChild = cleanNode(child);
      if (cleanedChild) el.appendChild(cleanedChild);
    });

    return el;
  }

  Array.from(doc.body.childNodes).forEach((node) => {
    const cleaned = cleanNode(node);
    if (cleaned) wrapper.appendChild(cleaned);
  });

  return wrapper;
}

// Compatibilidad: si algún archivo viejo llama renderMarkdown(),
// lo redirigimos al nuevo renderer seguro.
function renderMarkdown(text) {
  return renderAssistantContent(text);
}

// ─── Comunicación con n8n ─────────────────────────────────────────────────
async function showTypingAndReply(userText) {
  isAwaitingResponse = true;
  toggleSendState();

  const typingRow = appendMessage("assistant", "", { typing: true });

  try {
    const resp = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: userText })
    });

    const raw = await resp.text();

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} - ${raw || "sin body"}`);
    }

    if (!raw.trim()) {
      throw new Error("n8n respondió 200 pero con body vacío");
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`La respuesta no es JSON: ${raw}`);
    }

    const result = Array.isArray(data) ? data[0] : data;
    const replyText =
      result.reply ||
      result.output ||
      result.text ||
      result.response ||
      "Sin respuesta.";

    typingRow.remove();
    appendMessage("assistant", replyText);
    saveMessages();
  } catch (err) {
    console.error("Error real contra n8n:", err);
    typingRow.remove();
    appendMessage("assistant", `Error conectando con n8n: ${err.message}`);
    saveMessages();
  } finally {
    isAwaitingResponse = false;
    isLockedUntilReplyFinishes = false;
    toggleSendState();
    scrollToBottom();
  }
}
