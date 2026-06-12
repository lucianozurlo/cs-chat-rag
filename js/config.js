const STORAGE_KEY = "comustock";

const STARTER_PRESETS = {
  analizar: {
    label: "Analizar",
    items: [
      "Analizar este texto y resumirlo con los puntos clave.",
      "Analizar este contenido y detectar oportunidades de mejora.",
      "Analizar esta idea y señalar riesgos, ventajas y próximos pasos.",
      "Analizar este mensaje y reescribirlo más claro y profesional.",
    ],
  },
  escribir: {
    label: "Escribir",
    items: [
      "Escribir un mail claro y profesional a partir de esta idea.",
      "Escribir una propuesta breve, directa y convincente.",
      "Escribir preguntas frecuentes para este proyecto.",
      "Escribir un texto con tono simple, claro y humano.",
    ],
  },
  planificar: {
    label: "Planificar",
    items: [
      "Planificar este proyecto paso a paso con prioridades y tiempos.",
      "Planificar una estrategia simple para ejecutar esta idea.",
      "Planificar tareas concretas para avanzar sin perder tiempo.",
      "Planificar un roadmap corto con entregables claros.",
    ],
  },
};

const RANDOM_GREETINGS = [
  "Hola Benja!",
  "__TIME_BASED__",
  "¿Todo bien, Benja?",
  "¿Cómo va, Benja?",
  "Ey, Benja, ¿todo ok?",
  "Che Benja, ¿todo bien?",
  "Buenas, Benja!",
  "¿Qué hacés, Benja?",
  "¿Cómo andás, Benja?",
  "Benja, ¿todo joya?",
  "Hola, Benja, ¿cómo va?",
  "Benja, ¿cómo estás?",
  "Buenas, Benja, ¿va?",
  "¿Todo tranqui, Benja?",
  "Benja, ¿qué contás?",
  "Hola Benja, ¿todo?",
  "Ey Benja, ¿cómo va?",
  "Che, Benja, ¿todo?",
  "¿Qué onda, Benja?",
  "Benja, ¿en qué andás?",
];

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/comustock-chat";

// ─── Identidad de la conversación (memoria DB) ─────────────────────────────
// El backend n8n persiste estado por conversationId en PostgreSQL.
// Para que la memoria funcione, el MISMO conversationId tiene que viajar en
// todos los requests de la sesión. Se genera una sola vez y se guarda en
// localStorage; clearChat() lo resetea para arrancar una conversación nueva.

const CONVERSATION_ID_KEY = STORAGE_KEY + ":conversationId";
const CHAT_USER_ID = "benja";

function getConversationId() {
  let id = localStorage.getItem(CONVERSATION_ID_KEY);
  if (!id) {
    id =
      "conv-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8);
    localStorage.setItem(CONVERSATION_ID_KEY, id);
  }
  return id;
}

function resetConversationId() {
  localStorage.removeItem(CONVERSATION_ID_KEY);
}
